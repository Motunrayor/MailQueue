const express = require("express");
const {
  register,
  login,
  getMe,
  verifyEmail,
  changePassword,
  requestChangePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/register", verifyEmail, register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forget-password", requestChangePassword);
router.patch("/change-password", changePassword);

module.exports = router;
