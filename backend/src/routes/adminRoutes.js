const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const {
  getUsers,
  getCampaigns,
  getStats,
} = require("../controllers/adminController");

const router = express.Router();

// All admin endpoints require authentication and admin authorization.
router.use(protect, requireAdmin);

router.get("/users", getUsers);
router.get("/campaigns", getCampaigns);
router.get("/stats", getStats);

module.exports = router;
