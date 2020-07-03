const Account = require('./Account');
const {FMEvent} = require('../entities/Events');
const Item = require('../entities/Item');
const {CustomError} = require('../utils/Errors');
const {v4} = require('uuid');

class Fossil {
  static AGGREGATE_NAME = 'Fossil';
  static ITEM_WAS_LISTED = 'ItemWasListed';
  static ITEM_WAS_UNLISTED = 'ItemWasUnlisted';
  static ACCOUNT_MADE_TO_WAIT = 'AccountMadeToWait';
  static ACCOUNT_STOPPED_WAITING = 'AccountStoppedWaiting';
  constructor() {
    this.fossils = {};
  }
  async buildAggregate(eventStore, aggregateId) {
    this.eventStore = eventStore;
    const iterator = eventStore.getIterator(Fossil.AGGREGATE_NAME, aggregateId);
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
    const fossilWasListed = new FMEvent(Fossil.ITEM_WAS_LISTED, payload, {aggregateName: Fossil.AGGREGATE_NAME, aggregateId: itemId});
    
    const fossilListings = this.fossils[payload.fossilId];
    if (
      fossilListings &&
      fossilListings.desiredAccountIds &&
      fossilListings.desiredAccountIds.length
    ) {
      payload.buyerId = fossilListings.desiredAccountIds[0];
    }
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
    const fossilWasUnlisted = new FMEvent(Fossil.ITEM_WAS_UNLISTED, payload, {aggregateName: Fossil.AGGREGATE_NAME, aggregateId: itemId});
    await this.eventStore.registerEvent(fossilWasUnlisted);
    this._consumeEvent(fossilWasUnlisted);
    const buyerId = item.buyerId;
    if(!buyerId) {
      return;
    }
    // add buyer to new item if available
    const availableItem = this._findAvailableItem(fossilId);
    if (availableItem) {
      availableItem.buyerId = buyerId;
      const itemWasListed = new FMEvent(Fossil.ITEM_WAS_LISTED, availableItem, {aggregateName: Fossil.AGGREGATE_NAME, aggregateId: availableItem.itemId});
      await this.eventStore.registerEvent(itemWasListed);
      this._consumeEvent(itemWasListed);
      return;
    }
    const accountMadeToWait = new FMEvent(Fossil.ACCOUNT_MADE_TO_WAIT, {accountId: buyerId, fossilId}, {aggregateName: Fossil.AGGREGATE_NAME, aggregateId: fossilId});
    await this.eventStore.registerEvent(accountMadeToWait);
    this._consumeEvent(accountMadeToWait);
  }
  async desireItem(payload) {
    await this._validatePayload(payload);
    const desiredItem = this._findAvailableItem(payload.fossilId);
    if (desiredItem) {
      desiredItem.buyerId = payload.accountId;
      const itemWasListed = new FMEvent(Fossil.ITEM_WAS_LISTED, desiredItem, {aggregateName: Fossil.AGGREGATE_NAME, aggregateId: desiredItem.itemId});
      await this.eventStore.registerEvent(itemWasListed);
      this._consumeEvent(itemWasListed);
      return;
    }
    const accountMadeToWait = new FMEvent(Fossil.ACCOUNT_MADE_TO_WAIT, payload, {aggregateName: Fossil.AGGREGATE_NAME, aggregateId: payload.fossilId});
    await this.eventStore.registerEvent(accountMadeToWait);
    this._consumeEvent(accountMadeToWait);
  }
  async undesireItem(payload) {
    await this._validatePayload(payload);
    const fossilListings = this.fossils[payload.fossilId];
    if (
      fossilListings &&
      fossilListings.desiredAccountIds &&
      fossilListings.desiredAccountIds.indexOf(payload.accountId) > -1
    ) {
      const accountStoppedWaiting = new FMEvent(Fossil.ACCOUNT_STOPPED_WAITING, payload, {aggregateName: Fossil.AGGREGATE_NAME, aggregateId: payload.fossilId});
      await this.eventStore.registerEvent(accountStoppedWaiting);
      this._consumeEvent(accountStoppedWaiting);
      return;
    }
    const itemDesiredId = this._itemIds(payload.fossilId).find((itemId) => {
      return this.fossils[payload.fossilId][itemId].buyerId === payload.accountId;
    });
    if (!itemDesiredId) {
      throw new CustomError('Item not currently desired', 400);
    }
    const itemDesired = this.fossils[payload.fossilId][itemDesiredId];
    itemDesired.buyerId = null;
    const itemWasListed = new FMEvent(Fossil.ITEM_WAS_LISTED, itemDesired, {aggregateName: Fossil.AGGREGATE_NAME, aggregateId: itemDesired.itemId});
    await this.eventStore.registerEvent(itemWasListed);
    this._consumeEvent(itemWasListed);
  }
  _consumeEvent(event) {
    if (event.aggregateName !== Fossil.AGGREGATE_NAME) {
      return;
    }
    if (!this.fossils[event.payload.fossilId]) {
      this.fossils[event.payload.fossilId] = {};
    }
    const fossilListings = this.fossils[event.payload.fossilId];
    
    if (event.name === Fossil.ITEM_WAS_LISTED) {
      // Splice buyerId out of desiredAccounts
      if (
        event.payload.buyerId &&
        fossilListings.desiredAccountIds &&
        fossilListings.desiredAccountIds.indexOf(event.payload.buyerId) > -1
      ) {
        fossilListings.desiredAccountIds.splice(fossilListings.desiredAccountIds.indexOf(event.payload.buyerId), 1);
      }
      fossilListings[event.aggregateId] = new Item(event.aggregateId, event.payload);
    }
    if (event.name === Fossil.ACCOUNT_MADE_TO_WAIT) {
      if (!fossilListings.desiredAccountIds) {
        fossilListings.desiredAccountIds = [];
      }
      fossilListings.desiredAccountIds.push(event.payload.accountId);
    }
    if (event.name === Fossil.ITEM_WAS_UNLISTED) {
      const {itemId} = event.payload;
      delete fossilListings[itemId];
    }
    if (event.name === Fossil.ACCOUNT_STOPPED_WAITING) {
      const {accountId} = event.payload;
      if (
        fossilListings.desiredAccountIds &&
        fossilListings.desiredAccountIds.indexOf(accountId) > -1
      ) {
        fossilListings.desiredAccountIds.splice(fossilListings.desiredAccountIds.indexOf(accountId), 1);
      }
    }
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
  _itemIds(fossilId) {
    if (!this.fossils[fossilId]) {
      return [];
    }
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
