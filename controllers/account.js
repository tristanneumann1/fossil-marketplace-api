const config = require('config');
const {httpHandler} = require('../utils').handler;
const {CustomError} = require('../utils').Errors;
const Account = require('../aggregates/Account');
const {EventStore} = require('../entities/EventStore');

async function createAccount({headers, body = {}}) {
  if (!headers || !headers.userToken) {
    throw new CustomError('Account token required', 400);
  }
  const accountAggregate = new Account();
  const eventStore = new EventStore(config.get('eventStoreTableName'));
  await accountAggregate.buildAggregate(eventStore);
  return await accountAggregate.createAccount(headers.userToken, body);
}

async function listItem({headers, body}) {
  if (!headers || !headers.userToken) {
    throw new CustomError('Account token required', 400);
  }
  if(!body || !body.itemId) {
    throw new CustomError('ItemId is required', 400);
  }
  const accountAggregate = new Account();
  const eventStore = new EventStore(config.get('eventStoreTableName'));
  await accountAggregate.buildAggregate(eventStore, headers.userToken);
  return await accountAggregate.listItem(headers.userToken, body);
}

module.exports = {
  createAccount: httpHandler(createAccount, true),
  listItem: httpHandler(listItem, true),
};
