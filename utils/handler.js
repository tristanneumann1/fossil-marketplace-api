const {CustomError} = require('./Errors');
const logger = require('./logger');

function httpHandler(functionToRun, parseBody = false) {
  return async function handler(event) {
    if (event === null || event === undefined) {
      event = {};
    }
    const params = {
      queryStringParameters: event.queryStringParameters,
      headers: event.headers,
      pathParameters: event.pathParameters,
      body: (parseBody && event.body)? JSON.parse(event.body) : event.body,
    };
    try {
      const result = await functionToRun(params);
      if (result !== null && result !== undefined) {
        if (result.statusCode === null || result.statusCode === undefined) {
          return {
            statusCode: 200,
            body: typeof result === 'string' ? result : JSON.stringify(result),
          };
        }
        return result;
      }
      return {
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        return {
          statusCode: error.statusCode,
          body: error.message,
        };
      }
      logger.error(error);
      return {
        statusCode: 500,
        body: 'Internal Server Error',
      };
    }
  };
}

function wsHandler(funcToRun, parseBody = false) {
  return async function handler(event) {
    if (event === null || event === undefined) {
      event = {};
    }
    let params = null;
    if (event.requestContext.routeKey === '$connect' || event.requestContext.routeKey === '$disconnect') {
      params = {
        queryStringParameters: event.queryStringParameters,
        requestContext: event.requestContext,
      };
    } else {
      try {
        params = {
          body: parseBody ? JSON.parse(event.body) : event.body,
          queryStringParameters: event.queryStringParameters,
          requestContext: event.requestContext,
        };
      } catch (ignore) {
        throw new CustomError('[wsHandler] Could not parse event body: ' + event.body, 400);
      }
    }
    return await funcToRun(params);
  };
}

module.exports.httpHandler = httpHandler;
module.exports.wsHandler = wsHandler;
