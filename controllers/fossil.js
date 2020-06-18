const Fossil = require('../aggregates/Fossil');
const config = require('config');
const {httpHandler} = require('../utils').handler;
const {CustomError} = require('../utils').Errors;
const {EventStore} = require('../entities/EventStore');

async function listItem({headers, body}) {
  if (!headers || !headers.userToken) {
    throw new CustomError('Account token required', 400);
  }
  if(!body || !body.fossilId) {
    throw new CustomError('FossilId is required', 400);
  }
  body.accountId = headers.userToken;
  const fossilAggregate = new Fossil();
  const eventStore = new EventStore(config.get('eventStoreTableName'));
  await fossilAggregate.buildAggregate(eventStore);
  return await fossilAggregate.listItem(body);
}

async function unlistItem({headers, body}) {
  if (!headers || !headers.userToken) {
    throw new CustomError('Account token required', 400);
  }
  if(!body || !body.itemId || !body.fossilId) {
    throw new CustomError('ItemId is required', 400);
  }
  body.accountId = headers.userToken;
  const fossilAggregate = new Fossil();
  const eventStore = new EventStore(config.get('eventStoreTableName'));
  await fossilAggregate.buildAggregate(eventStore);
  return await fossilAggregate.unlistItem(body);
}

async function desireItem({headers, body}) {
  if (!headers || !headers.userToken) {
    throw new CustomError('Account token required', 400);
  }
  if(!body || !body.fossilId) {
    throw new CustomError('FossilId is required', 400);
  }
  body.accountId = headers.userToken;
  const fossilAggregate = new Fossil();
  const eventStore = new EventStore(config.get('eventStoreTableName'));
  await fossilAggregate.buildAggregate(eventStore);
  return await fossilAggregate.desireItem(body);
}

module.exports = {
  listItem: httpHandler(listItem, true),
  desireItem: httpHandler(desireItem, true),
  unlistItem: httpHandler(unlistItem, true),
};
