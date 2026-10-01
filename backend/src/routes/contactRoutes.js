const express = require("express");
const { authToken } = require("../middleware/authMiddleware");

const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

const router = express.Router();

router.use(authToken);
router.route("/").post(createContact).get(getContacts);
router.route("/:id").get(getContact).patch(updateContact).delete(deleteContact);

module.exports = router;
