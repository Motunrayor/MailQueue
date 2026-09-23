const dotenv = require("dotenv");

dotenv.config();

const port = Number(process.env.PORT) || 5000

const config = {
    port,
    nodeEnv: process.env.NODE_ENV || "development",
    mongodbUri: process.env.MONGODB_URI
};

module.exports = config;