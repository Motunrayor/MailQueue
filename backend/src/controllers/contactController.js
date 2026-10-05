const mongoose = require("mongoose");
const Contact = require("../models/Contact");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_UPDATES = new Set(["full_name", "email"]);

function cleanName(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidId(id) {
  return mongoose.isObjectIdOrHexString(id);
}

function handleDatabaseError(error, res, next) {
  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A contact with this email already exists",
    });
  }

  return next(error);
}

exports.createContact = async (req, res, next) => {
  try {
    const full_name = cleanName(req.body?.full_name);
    const email = cleanEmail(req.body?.email);

    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required",
      });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const contact = await Contact.create({
      user: req.user.id,
      full_name,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "Contact created successfully",
      contact,
    });
  } catch (error) {
    return handleDatabaseError(error, res, next);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const query = req.query || {};
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 100));
    const skip = (page - 1) * limit;
    const search = typeof query.search === "string"
      ? query.search.trim()
      : "";

    const filter = {
      user: req.user.id,
    };

    if (search) {
      filter.$or = [
        {
          full_name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({
        createdAt: -1,
      }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getContact = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({ success: true, contact });
  } catch (error) {
    return next(error);
  }
};

exports.getContact = getContact;
exports.getContactById = getContact;

exports.updateContact = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const fields = Object.keys(req.body || {});
    if (
      fields.length === 0 ||
      fields.some((field) => !ALLOWED_UPDATES.has(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Only full_name and email can be updated",
      });
    }

    const update = {};

    if (fields.includes("full_name")) {
      update.full_name = cleanName(req.body.full_name);
      if (!update.full_name) {
        return res.status(400).json({
          success: false,
          message: "Full name cannot be empty",
        });
      }
    }

    if (fields.includes("email")) {
      update.email = cleanEmail(req.body.email);
      if (!EMAIL_PATTERN.test(update.email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      update,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      contact,
    });
  } catch (error) {
    return handleDatabaseError(error, res, next);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
