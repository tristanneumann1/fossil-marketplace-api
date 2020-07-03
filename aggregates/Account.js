const {FMEvent} = require('../entities/Events');
const {CustomError} = require('../utils/Errors');

class Account {
  static AGGREGATE_NAME = 'Account';
  static ACCOUNT_WAS_CREATED = 'AccountWasCreated';
  constructor() {
    this.accounts = {};
  }
  async buildAggregate(eventStore, aggregateId) {
    this.eventStore = eventStore;
    const iterator = eventStore.getIterator(Account.AGGREGATE_NAME, aggregateId);
    let item = await iterator.next();
    while (!item.done) {
      const event = item.value;
      this._consumeEvent(event);
      item = await iterator.next();
    }
  }
  async createAccount(userToken, info = {}) {
    if (this.accounts[userToken]) {
      throw new CustomError('Account already exists for user: ' + userToken, 400);
    }
    const accountWasCreated = new FMEvent(Account.ACCOUNT_WAS_CREATED, info, {aggregateName: Account.AGGREGATE_NAME, aggregateId: userToken});
    await this.eventStore.registerEvent(accountWasCreated);
    this._consumeEvent(accountWasCreated);
  }
  _consumeEvent(event) {
    if (event.aggregateName !== Account.AGGREGATE_NAME) {
      return;
    }
    if (event.name === Account.ACCOUNT_WAS_CREATED) {
      this.accounts[event.aggregateId] = event.payload;
    }
  }
}

module.exports = Account;
