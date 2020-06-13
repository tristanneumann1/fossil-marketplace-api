const logger = require('./logger');

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    logger.error(this);
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = {CustomError};
