const mongoose = require("mongoose");
const User = require("../models/User");

exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not authorized to access this resource`,
      });
    }

    next();
  };
};

exports.requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId = req.user.id || req.user._id || req.user.userId;
    const email = req.user.email;

    let user = null;

    if (userId && mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId).select("_id role accountStatus");
    } else if (email) {
      user = await User.findOne({ email }).select(
        "_id role accountStatus"
      );
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
};