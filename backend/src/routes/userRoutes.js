const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getUserProfile);
router.patch("/me", protect, updateUserProfile);

module.exports = router;
