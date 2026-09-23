const mongoose = require('mongoose');
const config = require('./env');

const connectDatabase = async() => {
    try{
        await mongoose.connect(config.mongodbUri)
        console.log("MongoDB connected Successfully");
    }catch(error){
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

module.exports = connectDatabase;