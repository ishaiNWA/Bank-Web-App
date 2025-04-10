const mongoose = require("mongoose");
const logger = require ("../helpers/logger");

async function connect(){
   await mongoose.connect(process.env.MONGODB_URI);
   logger.info("App successfully connected to mongoose Atlas service");
}


module.exports = {
    connect,
}