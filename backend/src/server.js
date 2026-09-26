const app = require('./app');
const config = require("./config/env")
const connectDatabase = require('./config/database');

const startServer = async() => {
    try{
        await connectDatabase();
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port} on ${config.nodeEnv} mode`);
        });
    }catch(error){
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();