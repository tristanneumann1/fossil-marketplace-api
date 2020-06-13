const {FMEvent} = require('../lib/Events');
const {CustomError} = require('../lib/Errors');

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
    const accountWasCreated = new FMEvent(this.ACCOUNT_WAS_CREATED, {aggregateName: this.AGGREGATE_NAME}, {email});
    await this.eventStore.registerEvent(accountWasCreated);
    this._consumeEvent(accountWasCreated);
  }
  async buildAggregate(eventStore) {
    this.eventStore = eventStore;
    const iterator = eventStore.getIterator();
    const item = await iterator.next();
    while (!item.done) {
      const event = item.value;
      this._consumeEvent(event);
      await iterator.next();
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
