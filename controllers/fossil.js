const Fossil = require('../aggregates/Fossil');
const {v4} = require('uuid');const config = require('config');
const {httpHandler} = require('../utils').handler;
const {CustomError} = require('../utils').Errors;
const {EventStore} = require('../entities/EventStore');

async function listItem({headers, body}) {
  if (!headers || !headers.userToken) {
    throw new CustomError('Account token required', 400);
  }
  if(!body || !body.fossilId) {
    throw new CustomError('ItemId is required', 400);
  }
  body.itemId = v4();
  body.accountId = headers.userToken;
  const fossilAggregate = new Fossil();
  const eventStore = new EventStore(config.get('eventStoreTableName'));
  await fossilAggregate.buildAggregate(eventStore);
  return await fossilAggregate.listItem(body.itemId, body);
}

module.exports = {
  listItem: httpHandler(listItem, true),
};
