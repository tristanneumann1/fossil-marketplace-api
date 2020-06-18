const Account = require('./Account');
const {FMEvent} = require('../entities/Events');
const Item = require('../entities/Item');
const {CustomError} = require('../utils/Errors');

class Fossil {
  constructor() {
    this.AGGREGATE_NAME = 'Fossil';
    this.ITEM_WAS_LISTED = 'ItemWasListed';
    this.fossils = {};
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
  async listItem(itemId, payload) {
    const accountId = payload.accountId;
    if (!accountId) {
      throw new CustomError('Account is required', 400);
    }
    if(!payload.fossilId) {
      throw new CustomError('Fossil requires fossilId', 400);
    }
    const accountAggregate = new Account();
    await accountAggregate.buildAggregate(this.eventStore, accountId);
    if (!accountAggregate.accounts[accountId]) {
      throw new CustomError('Account does not exist: ' + accountId, 400);
    }
    const fossilWasListed = new FMEvent(this.ITEM_WAS_LISTED, payload, {aggregateName: this.AGGREGATE_NAME, aggregateId: itemId});
    await this.eventStore.registerEvent(fossilWasListed);
    this._consumeEvent(fossilWasListed);
  }
  _consumeEvent(event) {
    if (event.aggregateName !== this.AGGREGATE_NAME) {
      return;
    }
    if (event.name === this.ITEM_WAS_LISTED) {
      this.fossils[event.aggregateId] = new Item(event.aggregateId, event.payload);
      // Search for Other Candidate
    }
  }
}

module.exports = Fossil;
