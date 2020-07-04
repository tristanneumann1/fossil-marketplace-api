const {handler: {httpHandler}, Errors: {CustomError}} = require('../utils');
const FossilCatalog = require('./FossilCatalog');
const createRedisClient = require('../clients/createRedisClient');

async function fossilCatalog({ headers, queryStringParameters }) {
  if (!headers.userToken) {
    throw new CustomError('AccountId is required for this method', 400);
  }
  const version = queryStringParameters? queryStringParameters.version || 'latest' : 'latest';
  const client = await createRedisClient();
  const projection = new FossilCatalog({client, projectionVersion: version});
  return await projection.result(headers.userToken);
}

module.exports = {
  fossilCatalog: httpHandler(fossilCatalog),
};
