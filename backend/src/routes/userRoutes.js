const express = require("express");
const { getUserProfile, updateUserProfile, deleteUserProfile, logout, changePassword, checkPassword } =require("../controllers/userController");
const { authToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:id", authToken, getUserProfile);
router.put("/profile/:id", authToken, updateUserProfile);
router.delete("/profile/:id", authToken, deleteUserProfile);
router.post("/logout", authToken, logout);
router.post("/check-password/:id", authToken, checkPassword);
router.post("/change-password/:id", authToken, changePassword);


module.exports = router;