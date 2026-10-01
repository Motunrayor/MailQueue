const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} = require("../controllers/campaignController");

const router = express.Router();

router.use(protect);

router.route("/").get(getCampaigns).post(createCampaign);

router
  .route("/:id")
  .get(getCampaignById)
  .patch(updateCampaign)
  .delete(deleteCampaign);

module.exports = router;
