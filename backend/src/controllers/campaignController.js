const Campaign = require("../models/Campaign");
const Contact = require("../models/Contact");
const Job = require("../models/Job");
const Notification = require("../models/Notification");

const VALID_CAMPAIGN_STATUSES = new Set([
  "draft",
  "queued",
  "processing",
  "completed",
  "failed",
]);

const EDITABLE_FIELDS = new Set(["name", "subject", "message", "recipients"]);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const validateRecipientIds = async (recipientIds, userId) => {
  if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
    return {
      error: "At least one recipient is required",
    };
  }

  const uniqueRecipientIds = [...new Set(recipientIds.map((id) => String(id)))];

  if (uniqueRecipientIds.some((id) => !id.match(/^[0-9a-fA-F]{24}$/))) {
    return {
      error: "One or more campaign recipients are invalid",
    };
  }

  const contacts = await Contact.find({
    _id: { $in: uniqueRecipientIds },
    user: userId,
  }).select("_id");

  if (contacts.length !== uniqueRecipientIds.length) {
    return {
      error: "One or more campaign recipients are invalid",
    };
  }

  return {
    recipients: uniqueRecipientIds,
  };
};

exports.createCampaign = async (req, res, next) => {
  try {
    const { name, subject, message, recipients } = req.body;
    const cleanName = normalizeString(name);
    const cleanSubject = normalizeString(subject);
    const cleanMessage = normalizeString(message);

    if (
      !cleanName ||
      !cleanSubject ||
      !cleanMessage ||
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, subject, message, and at least one recipient are required",
      });
    }

    const recipientValidation = await validateRecipientIds(recipients, req.user._id);
    if (recipientValidation.error) {
      return res.status(400).json({
        success: false,
        message: recipientValidation.error,
      });
    }

    const campaign = await Campaign.create({
      user: req.user._id,
      name: cleanName,
      subject: cleanSubject,
      message: cleanMessage,
      recipients: recipientValidation.recipients,
      totalRecipients: recipientValidation.recipients.length,
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCampaigns = async (req, res, next) => {
  try {
    const query = req.query || {};
    const { page, limit, skip } = getPagination(query);
    const filter = { user: req.user._id };

    if (query.status) {
      if (!VALID_CAMPAIGN_STATUSES.has(query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid campaign status",
        });
      }
      filter.status = query.status;
    }

    if (typeof query.search === "string" && query.search.trim()) {
      const search = escapeRegex(query.search.trim());
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Campaign.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("recipients", "full_name email");

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

exports.updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    if (campaign.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft campaigns can be updated",
      });
    }

    const fields = Object.keys(req.body || {});
    if (
      fields.length === 0 ||
      fields.some((field) => !EDITABLE_FIELDS.has(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Only name, subject, message, and recipients can be updated",
      });
    }

    const update = {};

    if (fields.includes("name")) {
      update.name = normalizeString(req.body.name);
      if (!update.name) {
        return res.status(400).json({
          success: false,
          message: "Campaign name cannot be empty",
        });
      }
    }

    if (fields.includes("subject")) {
      update.subject = normalizeString(req.body.subject);
      if (!update.subject) {
        return res.status(400).json({
          success: false,
          message: "Subject cannot be empty",
        });
      }
    }

    if (fields.includes("message")) {
      update.message = normalizeString(req.body.message);
      if (!update.message) {
        return res.status(400).json({
          success: false,
          message: "Message cannot be empty",
        });
      }
    }

    if (fields.includes("recipients")) {
      const recipientValidation = await validateRecipientIds(
        req.body.recipients,
        req.user._id
      );
      if (recipientValidation.error) {
        return res.status(400).json({
          success: false,
          message: recipientValidation.error,
        });
      }
      update.recipients = recipientValidation.recipients;
      update.totalRecipients = recipientValidation.recipients.length;
    }

    const updatedCampaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, data: updatedCampaign });
  } catch (error) {
    next(error);
  }
};

exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    if (campaign.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft campaigns can be deleted",
      });
    }

    await Campaign.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.sendCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    // Only draft campaigns can be queued
    if (campaign.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft campaigns can be sent",
      });
    }

    if (!campaign.recipients || campaign.recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Campaign has no recipients",
      });
    }

    // Get the actual contacts belonging to the authenticated user
    const contacts = await Contact.find({
      _id: { $in: campaign.recipients },
      user: req.user._id,
    });

    if (contacts.length !== campaign.recipients.length) {
      return res.status(400).json({
        success: false,
        message: "One or more campaign recipients are invalid",
      });
    }

    // Prevent duplicate jobs for the same campaign
    const existingJobs = await Job.countDocuments({
      campaign: campaign._id,
    });

    if (existingJobs > 0) {
      return res.status(400).json({
        success: false,
        message: "Campaign has already been queued",
      });
    }

    // Reset campaign counters
    campaign.status = "queued";
    campaign.totalRecipients = contacts.length;
    campaign.processedCount = 0;
    campaign.successCount = 0;
    campaign.failedCount = 0;

    await campaign.save();

    // Create one job and one notification for each recipient
    const jobs = contacts.map((contact) => ({
      campaign: campaign._id,
      user: req.user._id,
      contact: contact._id,
      recipientEmail: contact.email,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
    }));

    await Job.insertMany(jobs);

    const notifications = contacts.map((contact) => ({
      campaign: campaign._id,
      contact: contact._id,
      email: contact.email,
      status: "pending",
    }));

    await Notification.insertMany(notifications);

    return res.status(200).json({
      success: true,
      message: "Campaign queued successfully",
      data: {
        campaignId: campaign._id,
        status: campaign.status,
        queuedJobs: jobs.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCampaignNotifications = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const notifications = await Notification.find({
      campaign: campaign._id,
    })
      .populate("contact", "full_name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};
