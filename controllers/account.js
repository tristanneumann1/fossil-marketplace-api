const config = require('config');
const {httpHandler} = require('../utils/handler');
const {CustomError} = require('../utils/Errors');
const Account = require('../aggregates/Account');
const {EventStore} = require('../utils/index').EventStore;

async function createAccount({body}) {
  if (!body || !body.email) {
    throw new CustomError('Account email required', 400);
  }
  const email = body.email;
  const accountAggregate = new Account();
  const eventStore = new EventStore(config.get('eventStoreTableName'));
  await accountAggregate.buildAggregate(eventStore);
  await accountAggregate.createAccount(email, body);
}

module.exports = {
  createAccount: httpHandler(createAccount, true),
};
