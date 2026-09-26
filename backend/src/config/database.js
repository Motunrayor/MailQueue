const mongoose = require('mongoose');
require('dotenv').config()

const connectDatabase = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI )
        console.log("MongoDB connected Successfully");
    }catch(error){
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

module.exports = connectDatabase;