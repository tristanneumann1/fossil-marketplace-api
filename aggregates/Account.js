const {FMEvent} = require('../lib/Events');
const {CustomError} = require('../lib/Errors');

class Account {
  constructor(eventStore) {
    this.AGGREGATE_NAME = 'Account';
    this.ACCOUNT_WAS_CREATED = 'AccountWasCreated';
    this.eventStore = eventStore;
    this.accounts = {};
    this._buildAggregate();
  }
  createAccount(email) {
    if (this.accounts[email]) {
      throw new CustomError('Account already exists for email ' + email, 400);
    }
    const accountWasCreated = new FMEvent(this.ACCOUNT_WAS_CREATED, {aggregateName: this.AGGREGATE_NAME}, {email});
    this.eventStore.registerEvent(accountWasCreated);
    this._consumeEvent(accountWasCreated);
  }
  _buildAggregate() {
    const iterator = this.eventStore.getIterator();
    const item = iterator.next();
    while (!item.done) {
      const event = item.value;
      this._consumeEvent(event);
      iterator.next();
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
