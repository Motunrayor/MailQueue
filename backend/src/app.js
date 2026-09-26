const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDatabase = require("./config/database");
const errorMiddleware = require("./middlewares/errorMiddleware");
const app = express();

app.use(cors());

app.use(express.json()) //parse incoming request into JSON

// connect to the database
connectDatabase();

//import other route handler here eg authROutes and errorhandler



// Error middleware MUST come after your routes
app.use(errorMiddleware);

//use this to check if your api is working well in the postman
app.get('/health', (req, res) => {
    res.status(200).json({success: true, message: "MailQueue API is working fine"});
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});


module.exports = app;