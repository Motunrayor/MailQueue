const mongoose = require("mongoose");
const Contact = require("../models/Contact");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    // Accept both the current API field and the field used by your earlier request.
    const full_name = cleanName(req.body?.full_name ?? req.body?.name);
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
      user: req.user._id ?? req.user.id,
      full_name,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "Contact created successfully",
      contact,
      data: contact,
    });
  } catch (error) {
    return handleDatabaseError(error, res, next);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find({
      user: req.user._id ?? req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getContact = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id ?? req.user.id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    return next(error);
  }
};

// Keep both names available for route files from either branch.
exports.getContactById = exports.getContact;

exports.updateContact = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const body = req.body ?? {};
    const allowedFields = new Set(["name", "full_name", "email"]);
    const fields = Object.keys(body);

    if (
      fields.length === 0 ||
      fields.some((field) => !allowedFields.has(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Only name, full_name, and email can be updated",
      });
    }

    const update = {};

    if ("name" in body || "full_name" in body) {
      update.full_name = cleanName(body.full_name ?? body.name);

      if (!update.full_name) {
        return res.status(400).json({
          success: false,
          message: "Full name cannot be empty",
        });
      }
    }

    if ("email" in body) {
      update.email = cleanEmail(body.email);

      if (!EMAIL_PATTERN.test(update.email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }
    }

    const contact = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id ?? req.user.id,
      },
      update,
      { new: true, runValidators: true },
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
      data: contact,
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
      user: req.user._id ?? req.user.id,
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
