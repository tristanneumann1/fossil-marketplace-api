const config = require('config');
const {httpHandler} = require('../utils').handler;
const {CustomError} = require('../utils').Errors;
const {EventStore} = require('../entities/EventStore');
const Account = require('../aggregates/Account');

async function createAccount({headers, body = {}}) {
  if (!headers || !headers.userToken) {
    throw new CustomError('Account token required', 400);
  }
  const accountAggregate = new Account();
  const eventStore = new EventStore(config.get('eventStoreTableName'));
  await accountAggregate.buildAggregate(eventStore);
  return await accountAggregate.createAccount(headers.userToken, body);
}

module.exports = {
  createAccount: httpHandler(createAccount, true),
};
