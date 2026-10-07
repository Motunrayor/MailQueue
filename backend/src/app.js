const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./config/openapi");
require("dotenv").config();

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api-docs.json", (req, res) => res.json(openapi));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, {
  customSiteTitle: "MailQueue API Documentation",
  swaggerOptions: { url: "/api-docs.json", validatorUrl: null },
}));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/contacts", contactRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MailQueue API is working fine",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
