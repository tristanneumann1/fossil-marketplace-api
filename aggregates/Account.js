const {FMEvent} = require('../utils/Events');
const {CustomError} = require('../utils/Errors');
const {v4} = require('uuid');

class Account {
  constructor() {
    this.AGGREGATE_NAME = 'Account';
    this.ACCOUNT_WAS_CREATED = 'AccountWasCreated';
    this.accounts = {};
  }
  async createAccount(email) {
    if (this.accounts[email]) {
      throw new CustomError('Account already exists for email ' + email, 400);
    }
    const accountWasCreated = new FMEvent(this.ACCOUNT_WAS_CREATED, {email}, {aggregateName: this.AGGREGATE_NAME, aggregateId: v4()});
    await this.eventStore.registerEvent(accountWasCreated);
    this._consumeEvent(accountWasCreated);
  }
  async buildAggregate(eventStore) {
    this.eventStore = eventStore;
    const iterator = eventStore.getIterator();
    let item = await iterator.next();
    while (!item.done) {
      const event = item.value;
      this._consumeEvent(event);
      item = await iterator.next();
    }
  }
  _consumeEvent(event) {
    if (event.aggregateName !== this.AGGREGATE_NAME) {
      return;
    }
    this.accounts[event.payload.email] = {
      email: event.payload.email,
    };
  }
}

module.exports = Account;
