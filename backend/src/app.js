const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const campaignRoutes = require("./routes/campaignRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/campaigns", campaignRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MailQueue API is working fine",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
