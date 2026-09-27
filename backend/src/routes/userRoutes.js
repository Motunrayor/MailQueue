const express = require("express");
const {getUserProfile, updateUserProfile, deleteUserProfile, logout,} = require("../controllers/userController");
const { authToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile/:id", authToken, getUserProfile);
router.put("/profile/:id", authToken, updateUserProfile);
router.delete("/profile/:id", authToken, deleteUserProfile);
router.post("/logout", authToken, logout);

module.exports = router;