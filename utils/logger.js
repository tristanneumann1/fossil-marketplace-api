const config = require('config');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, errors } = format;
 
const logger = createLogger({
  format: combine(
    colorize({colors: {error: 'red', info: 'blue', warn: 'yellow', debug: 'green'}}),
    timestamp(),
    errors({stack: true}),
    format.printf((info) => `${info.level}${info.statusCode ? ' ' + info.statusCode : ''}: ${info.message} @${info.timestamp}${info.stack? '\n' + info.stack : ''}`),
  ),
  transports: [new transports.Console()],
  exitOnError: false,
});
logger.level = config.loggerLevel;
logger.json = config.loggerJson;
logger.handleExceptions = config.loggerhandleExceptions;

module.exports = logger;
