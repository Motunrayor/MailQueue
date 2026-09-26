const express = require("express");
const {
  register,
  login,
  verifyEmail,
  changePassword,
  requestChangePassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/register", verifyEmail, register);
router.post("/login", login);
router.post("/forget-password", requestChangePassword);
router.post("/change-password", changePassword);

module.exports = router;