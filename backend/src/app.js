const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());

app.use(express.json()) //parse incoming request into JSON

//import other route handler here eg authROutes and errorhandler
app.use("/api/auth", authRoutes);



//use this to check if your api is working well in the postman
app.get('/health', (req, res) => {
    res.status(200).json({success: true, message: "MailQueue API is working fine"});
})

// Error middleware MUST come after your routes
app.use(notFound);
app.use(errorHandler);

module.exports = app;
