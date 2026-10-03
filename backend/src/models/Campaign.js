const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
      },
    ],
    status: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "queued",
        "processing",
        "sent",
        "completed",
        "failed",
      ],
      default: "draft",
    },
    totalRecipients: {
      type: Number,
      default: 0,
    },
    processedCount: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Campaign", campaignSchema);
