const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    middlename: {
      type: String,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone_no1: {
      type: String,
      trim: true,
    },

    phone_no2: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },

    account_type: {
      type: String,
      enum: ["individual", "organization"],
      required: true,
    },

    company_name: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    socialmedia_url: {
      facebook: {
        type: String,
        trim: true,
      },

      instagram: {
        type: String,
        trim: true,
      },

      twitter: {
        type: String,
        trim: true,
      },

      linkedin: {
        type: String,
        trim: true,
      },
    },

    otp_code: {
      type: String,
    },

    expiredotp_time: {
      type: Date,
    },

    email_verified: {
      type: Boolean,
      default: false,
    },

    onboardingstatus: {
      type: String,
      enum: [ "not_started","in_progress","submitted","under_review", "completed", ],
      default: "not_started",
    },

    accountStatus: {
      type: String,
      enum: [ "pending", "active","suspended", "blocked", ],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);

