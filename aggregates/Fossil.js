const Account = require('./Account');
const {FMEvent} = require('../entities/Events');
const Item = require('../entities/Item');
const {CustomError} = require('../utils/Errors');
const {v4} = require('uuid');

class Fossil {
  constructor() {
    this.AGGREGATE_NAME = 'Fossil';
    this.ITEM_WAS_LISTED = 'ItemWasListed';
    this.ITEM_WAS_DESIRED = 'ItemWasDesired';
    this.ITEM_WAS_UNLISTED = 'ItemWasUnlisted';
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
  async listItem(payload) {
    await this._validatePayload(payload);
    const accountId = payload.accountId;
    payload.sellerId = accountId;
    const itemId = v4();
    payload.itemId = itemId;
    const fossilWasListed = new FMEvent(this.ITEM_WAS_LISTED, payload, {aggregateName: this.AGGREGATE_NAME, aggregateId: itemId});
    await this.eventStore.registerEvent(fossilWasListed);
    this._consumeEvent(fossilWasListed);
  }
  async unlistItem(payload) {
    const {fossilId, itemId, accountId} = payload;
    if (!this.fossils[fossilId] || !this.fossils[fossilId][itemId]) {
      throw new CustomError('Item Could not be found', 400);
    }
    const item = this.fossils[fossilId][itemId];
    if(item.sellerId !== accountId) {
      throw new CustomError('User is not seller of item', 400);
    }
    if (item.buyerId) {
      const availableItem = this._findAvailableItem(fossilId);
      if (availableItem) {
        payload.newItemId = availableItem.itemId;
      }
    }
    const fossilWasUnlisted = new FMEvent(this.ITEM_WAS_UNLISTED, payload, {aggregateName: this.AGGREGATE_NAME, aggregateId: itemId});
    await this.eventStore.registerEvent(fossilWasUnlisted);
    this._consumeEvent(fossilWasUnlisted);

  }
  async desireItem(payload) {
    await this._validatePayload(payload);
    const desiredItem = this._findAvailableItem(payload.fossilId);
    if (desiredItem) {
      const itemId = desiredItem.itemId;
      payload.itemId = itemId;
    }
    const fossilWasDesired = new FMEvent(this.ITEM_WAS_DESIRED, payload, {aggregateName: this.AGGREGATE_NAME, aggregateId: payload.fossilId});
    await this.eventStore.registerEvent(fossilWasDesired);
    this._consumeEvent(fossilWasDesired);
  }
  async _validatePayload(payload) {
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
  }
  _consumeEvent(event) {
    if (event.aggregateName !== this.AGGREGATE_NAME) {
      return;
    }
    if (!this.fossils[event.payload.fossilId]) {
      this.fossils[event.payload.fossilId] = {};
    }
    const fossilListings = this.fossils[event.payload.fossilId];
    
    if (event.name === this.ITEM_WAS_LISTED) {
      if (
        fossilListings.desiredAccountIds &&
        fossilListings.desiredAccountIds.length
      ) {
        event.payload.buyerId = fossilListings.desiredAccountIds.shift();
      }
      fossilListings[event.aggregateId] = new Item(event.aggregateId, event.payload);
    }
    if (event.name === this.ITEM_WAS_DESIRED) {
      if (event.payload.itemId && fossilListings[event.payload.itemId]) {
        fossilListings[event.payload.itemId].buyerId = event.payload.accountId;
        return;
      }
      if (!fossilListings.desiredAccountIds) {
        fossilListings.desiredAccountIds = [];
      }
      fossilListings.desiredAccountIds.push(event.payload.accountId);
    }
    if (event.name === this.ITEM_WAS_UNLISTED) {
      const {itemId, newItemId = null} = event.payload;
      const buyerId = fossilListings[itemId].buyerId;
      delete fossilListings[itemId];
      if (buyerId) {
        if (newItemId && fossilListings[newItemId]) {
          fossilListings[newItemId].buyerId = buyerId;
          return;
        }
        if (!fossilListings.desiredAccountIds) {
          fossilListings.desiredAccountIds = [];
        }
        fossilListings.desiredAccountIds.push(buyerId);
      }
    }
  }
  _itemIds(fossilId) {
    return Object.keys(this.fossils[fossilId]).filter((key) => key !== 'desiredAccountIds');
  }
  _findAvailableItem(fossilId) {
    if (this.fossils[fossilId]) {
      const desiredItemKey = Object.keys(this.fossils[fossilId]).find((itemKey) => {
        return this.fossils[fossilId][itemKey].buyerId === null;
      });
      return this.fossils[fossilId][desiredItemKey];
    }
  }
}

module.exports = Fossil;
