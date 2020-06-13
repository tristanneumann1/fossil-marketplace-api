const {httpHandler} = require('../lib/handler');
const CustomError = require('../lib/Errors');
const Account = require('../aggregates/Account');

async function createAccount({body}) {
  if (!body.email) {
    throw new CustomError('Account email required', 400);
  }
  const email = body.email;
  const accountAggregate = new Account();
  accountAggregate.createAccount(email);
}

module.exports = {
  createAccount: httpHandler(createAccount),
};
