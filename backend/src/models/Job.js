const mongoose = require("mongoose");

const EmailJobSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },

    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "sent",
        "failed",
      ],
      default: "pending",
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastError: {
      type: String,
    },

    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmailJob", EmailJobSchema);