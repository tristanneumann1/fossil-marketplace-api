const config = require('config');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint, colorize } = format;
 
const logger = createLogger({
  format: combine(
    timestamp(),
    prettyPrint(),
    colorize(),
  ),
  transports: [
    new transports.Console({
      colorize: true,
    }),
  ],
  exitOnError: false,
});
logger.level = config.loggerLevel;
logger.json = config.loggerJson;
logger.handleExceptions = config.loggerhandleExceptions;

module.exports = logger;
