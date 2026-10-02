const mongoose = require("mongoose");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_PATTERN, "Please provide a valid email address"],
    },
  },
  { timestamps: true }
);

contactSchema.index({ user: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Contact", contactSchema);
