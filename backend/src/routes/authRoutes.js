const express = require("express");
const {
  register,
  login,
  getMe,
  verifyEmail,
  changePassword,
  requestChangePassword,
} = require("../controllers/authController");

const { authToken } = require("../middleware/authmiddleware");


const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/register", verifyEmail, register);
router.post("/login", login);
router.get("/me", authToken, getMe);
router.post("/forget-password", requestChangePassword);
router.patch("/change-password", changePassword);

module.exports = router;