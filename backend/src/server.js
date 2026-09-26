const app = require("./app");
const connectDatabase = require("./config/database");
require("dotenv").config();

const startServer = async () => {
  try {
    await connectDatabase();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port} in ${process.env.NODE_ENV || "development"} mode`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();