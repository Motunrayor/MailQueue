const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
  {
    // User who created the campaign
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Internal name of the campaign
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },

    // Email subject
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // Email body/content
    content: {
      type: String,
      required: true,
    },

    // Contacts selected for this campaign
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
      },
    ],

    // Overall campaign status
    status: {
      type: String,
      enum: [
        "draft",
        "queued",
        "processing",
        "completed",
        "failed",
      ],
      default: "draft",
    },

    // Campaign statistics
    stats: {
      total: {
        type: Number,
        default: 0,
      },
      processed: {
        type: Number,
        default: 0,
      },
      successful: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
    },

    // Important campaign timestamps
    queuedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", CampaignSchema);
