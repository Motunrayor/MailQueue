// const app = require("./app");
// const connectDatabase = require("./config/database");
// require("dotenv").config();

// const startServer = async () => {
//   try {
//     await connectDatabase();

//     const port = process.env.PORT || 4008;
//     app.listen(port, () => {
//       console.log(
//         `Server running on port ${port} in ${process.env.NODE_ENV || "development"} mode`,
//       );
//     });
//   } catch (error) {
//     console.error(`Failed to start server: ${error.message}`);
//     process.exit(1);
//   }
// };

// startServer();

const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const app = require("./app");
const connectDatabase = require("./config/database");

const startServer = async () => {
  try {
    await connectDatabase();

    const port = process.env.PORT || 4008;
    app.listen(port, () => {
      console.log(
        `Server running on port ${port} in ${process.env.NODE_ENV || "development"} mode`,
      );
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
