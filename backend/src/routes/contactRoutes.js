const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

const router = express.Router();

router.use(protect);

router.route("/").get(getContacts).post(createContact);

router
  .route("/:id")
  .get(getContactById)
  .patch(updateContact)
  .delete(deleteContact);

module.exports = router;
