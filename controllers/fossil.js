const Fossil = require('../aggregates/Fossil');
const config = require('config');
const {handler: {httpHandler}, Errors: {CustomError}} = require('../utils');
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
    throw new CustomError('ItemId and fossilId are required', 400);
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

async function undesireItem({headers, body}) {
  if (!headers || !headers.userToken) {
    throw new CustomError('Account token required', 400);
  }
  if(!body || !body.fossilId) {
    throw new CustomError('fossilId is required', 400);
  }
  body.accountId = headers.userToken;
  const fossilAggregate = new Fossil();
  const eventStore = new EventStore(config.get('eventStoreTableName'));
  await fossilAggregate.buildAggregate(eventStore);
  return await fossilAggregate.undesireItem(body);
}

module.exports = {
  listItem: httpHandler(listItem, true),
  unlistItem: httpHandler(unlistItem, true),
  desireItem: httpHandler(desireItem, true),
  undesireItem: httpHandler(undesireItem, true),
};
