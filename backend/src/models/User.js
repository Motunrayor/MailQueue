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

    phone_no: {
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

    onboardingstatus: {
      type: String,
      enum: [ "in_progress", "completed", ],
      default: "in_progress",
    },

    accountStatus: {
      type: String,
      enum: [ "active","suspended", "blocked", ],
      default: "active",
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

