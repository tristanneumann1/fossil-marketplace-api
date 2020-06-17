const {FMEvent} = require('../entities/Events');
const Item = require('../entities/Item');
const {CustomError} = require('../utils/Errors');

class Account {
  constructor() {
    this.AGGREGATE_NAME = 'Account';
    this.ACCOUNT_WAS_CREATED = 'AccountWasCreated';
    this.ITEM_WAS_LISTED = 'ItemWasListed';
    this.accounts = {};
  }
  async buildAggregate(eventStore, aggregateId) {
    this.eventStore = eventStore;
    const iterator = eventStore.getIterator(this.AGGREGATE_NAME, aggregateId);
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
    const accountWasCreated = new FMEvent(this.ACCOUNT_WAS_CREATED, info, {aggregateName: this.AGGREGATE_NAME, aggregateId: userToken});
    await this.eventStore.registerEvent(accountWasCreated);
    this._consumeEvent(accountWasCreated);
  }
  async listItem(userToken, payload) {
    if (!this.accounts[userToken]) {
      throw new CustomError('Account does not exist: ' + userToken, 400);
    }
    const itemWasListed = new FMEvent(this.ITEM_WAS_LISTED, payload, {aggregateName: this.AGGREGATE_NAME, aggregateId: userToken});
    await this.eventStore.registerEvent(itemWasListed);
    this._consumeEvent(itemWasListed);
  }
  _consumeEvent(event) {
    if (event.aggregateName !== this.AGGREGATE_NAME) {
      return;
    }
    if (event.name === this.ACCOUNT_WAS_CREATED) {
      this.accounts[event.aggregateId] = event.payload;
    }
    if (event.name === this.ITEM_WAS_LISTED) {
      if(!this.accounts[event.aggregateId].listedItems) {
        this.accounts[event.aggregateId].listedItems = {};
      }
      const listedItems = this.accounts[event.aggregateId].listedItems;
      const {itemId} = event.payload;
      if (!listedItems[itemId]) {
        listedItems[itemId] = [];
      }
      listedItems[itemId].push(new Item(itemId));
    }
  }
}

module.exports = Account;
