const express = require("express");
const cors = require("cors");
const {notFound, errorHandler} = require('./middleware/errorMiddleware');
//import other route handler here eg authROutes and errorhandler


const app = express();

app.use(cors());

app.use(express.json()) //parse incoming request into JSON

app.get('/health', (req, res) => {
    res.status(200).json({success: true, message: "MailQueue API is working fine"});
})

app.use(notFound);
app.use(errorHandler);

module.exports = app;