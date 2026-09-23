const cors = require('cors');

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000']
}))


app.listen(5000, () => {
    console.log('The Server is running on port 5000');
});