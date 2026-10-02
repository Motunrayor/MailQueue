const express = require("express");
const { authToken } = require("../middleware/authMiddleware");

const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

const router = express.Router();

router.use(authToken);
router.route("/").post(createContact).get(getContacts);
router.route("/:id").get(getContactById).patch(updateContact).delete(deleteContact);

module.exports = router;
