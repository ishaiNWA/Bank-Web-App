const winston = require('winston');
const { colorize, json, errors, combine, timestamp, simple } = winston.format;

const logger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Format timestamp to seconds
    json()
  ),
  transports: [
    new winston.transports.Console({
      // output console for development
      format: combine(
        colorize(),
        simple()
      )
    })
  ]
});
module.exports = logger;