require("dotenv").config({ path: "./.env" });
const logger = require("./helpers/logger");
const mongoService = require("./services/mongodb-service");
const rabbitService = require("./services/rabbitmq-service")

mongoService.connect()
.then(rabbitService.initAndListen)
.then(
    ()=> logger.info("FinSceduler App successfully initiated")
).catch( error =>
    logger.error("FinSceduler App failed to init:\n ",{error: error.message, stack: error.stack})
)
