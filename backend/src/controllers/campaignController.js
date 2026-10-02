const Campaign = require("../models/Campaign");
const Contact = require("../models/Contact");
const Job = require("../models/Job");
const Notification = require("../models/Notification");


exports.createCampaign = async (req, res, next) => {
  try {
    const { name, subject, message, recipients } = req.body;

    if (
      !name ||
      !subject ||
      !message ||
      !recipients ||
      recipients.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, subject, message, and at least one recipient are required",
      });
    }

    const campaign = await Campaign.create({
      user: req.user._id,
      name,
      subject,
      message,
      recipients,
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
    const campaigns = await Campaign.find({ user: req.user._id });
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

exports.getCampaignById = async (req, res, next) => {
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

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
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

    await Campaign.findByIdAndDelete(req.params.id);

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