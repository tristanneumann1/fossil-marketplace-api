const Fossil = require('./Fossil.js');
const Account = require('./Account.js');
const {LocalEventStore} = require('../entities/EventStore');
const {FMEvent} = require('../entities/Events');

describe('Fossil', () => {
  const fossilId = 'fossil-id';
  const accountId = 'user-token';
  const accountId2 = 'second-account-id';
  const accountId3 = 'third-account-id';
  let fossilAggregate;
  beforeEach(async () => {
    fossilAggregate = new Fossil();
    const eventStore = new LocalEventStore();
    const accountAggregate = new Account();
    await accountAggregate.buildAggregate(eventStore);
    await accountAggregate.createAccount(accountId);
    await accountAggregate.createAccount(accountId2);
    await accountAggregate.createAccount(accountId3);
    await fossilAggregate.buildAggregate(accountAggregate.eventStore);
  });
  it('Ignores events of other Aggregates', async () => {
    // GIVEN
    const event = new FMEvent(fossilAggregate.ITEM_WAS_LISTED, {}, {aggregateName: 'UnrelatedAggregate', aggregateId: 'itemId'});
    // WHEN
    await fossilAggregate._consumeEvent(event);
    // THEN
    expect(fossilAggregate.fossils).toEqual({});
  });
  
  it('Pairs up buyers with sellers', async () => {
    // GIVEN
    const sellerId = accountId;
    const buyerId = accountId2;
    // WHEN
    await fossilAggregate.listItem({accountId: sellerId, fossilId});
    await fossilAggregate.desireItem({accountId: buyerId, fossilId});
    // THEN
    expect(fossilAggregate.fossils[fossilId]).toBeDefined();
    expect(fossilAggregate._itemIds(fossilId).length).toBe(1);
    const itemId = fossilAggregate._itemIds(fossilId)[0];
    expect(fossilAggregate.fossils[fossilId][itemId].fossilId).toBe(fossilId);
    expect(fossilAggregate.fossils[fossilId][itemId].sellerId).toBe(sellerId);
    expect(fossilAggregate.fossils[fossilId][itemId].buyerId).toBe(buyerId);
  });
  it('Pairs up sellers with buyers', async () => {
    // WHEN
    const sellerId = accountId;
    const buyerId = accountId2;
    await fossilAggregate.desireItem({accountId: buyerId, fossilId});
    await fossilAggregate.listItem({accountId: sellerId, fossilId});
    // THEN
    expect(fossilAggregate.fossils[fossilId]).toBeDefined();
    expect(fossilAggregate._itemIds(fossilId).length).toBe(1);
    const itemId = fossilAggregate._itemIds(fossilId)[0];
    expect(fossilAggregate.fossils[fossilId][itemId].fossilId).toBe(fossilId);
    expect(fossilAggregate.fossils[fossilId][itemId].sellerId).toBe(sellerId);
    expect(fossilAggregate.fossils[fossilId][itemId].buyerId).toBe(buyerId);
  });
  it('doesn\'t overwrite pairs', async () => {
    // WHEN
    const sellerId = accountId;
    const buyerId = accountId2;
    await fossilAggregate.desireItem({accountId: buyerId, fossilId});
    await fossilAggregate.listItem({accountId: sellerId, fossilId});
    await fossilAggregate.listItem({accountId: accountId3, fossilId});
    // THEN
    expect(fossilAggregate.fossils[fossilId]).toBeDefined();
    expect(fossilAggregate._itemIds(fossilId).length).toBe(2);
  });

  describe('List Item', () => {
    it('Lists the fossil', async () => {
      // WHEN
      await fossilAggregate.listItem({accountId, fossilId});
      // THEN
      expect(fossilAggregate.fossils[fossilId]).toBeDefined();
      expect(Object.keys(fossilAggregate.fossils[fossilId]).length).toBe(1);
      const itemId = fossilAggregate._itemIds(fossilId)[0];
      expect(fossilAggregate.fossils[fossilId][itemId].fossilId).toBe(fossilId);
      expect(fossilAggregate.fossils[fossilId][itemId].sellerId).toBe(accountId);
    });
    it('Does not list item when account does not exist', async () => {
      // THEN
      await expect(fossilAggregate.listItem({fossilId})).rejects.toThrow(/Account is required/);
      await expect(fossilAggregate.listItem({accountId: 'invalid_account', fossilId})).rejects.toThrow(/Account does not exist/);
    });
    it('Does not list item when no fossil id available', async () => {
      // THEN
      await expect(fossilAggregate.listItem({accountId})).rejects.toThrow(/Fossil requires fossilId/);
    });
  });
  describe('Unlist Item', () => {
    it('removes item', async () => {
      // GIVEN
      await fossilAggregate.listItem({accountId, fossilId});
      const itemId = fossilAggregate._itemIds(fossilId)[0];
      // WHEN
      await fossilAggregate.unlistItem({itemId, fossilId, accountId});
      // THEN
      expect(fossilAggregate._itemIds(fossilId).length).toBe(0);
      expect(fossilAggregate.fossils[fossilId][itemId]).not.toBeDefined();
    });
    it('Relists buyer if no available other seller', async () => {
      // GIVEN
      await fossilAggregate.listItem({accountId, fossilId});
      await fossilAggregate.desireItem({accountId: accountId2, fossilId});
      const itemId = fossilAggregate._itemIds(fossilId)[0];
      // WHEN
      await fossilAggregate.unlistItem({itemId, fossilId, accountId});
      // THEN
      expect(fossilAggregate._itemIds(fossilId).length).toBe(0);
      expect(fossilAggregate.fossils[fossilId].desiredAccountIds).toBeDefined();
      expect(fossilAggregate.fossils[fossilId].desiredAccountIds[0]).toBe(accountId2);
    });
    it('Pairs item with a new seller if there is still a buyer', async () => {
      // GIVEN
      const buyerId = accountId;
      await fossilAggregate.listItem({accountId: accountId2, fossilId});
      const firstItemId = fossilAggregate._itemIds(fossilId)[0];
      await fossilAggregate.desireItem({accountId: buyerId, fossilId});
      await fossilAggregate.listItem({accountId: accountId3, fossilId});
      const secondItemId = fossilAggregate._itemIds(fossilId).find((itemId) => itemId !== firstItemId);
      // WHEN
      await fossilAggregate.unlistItem({itemId: firstItemId, fossilId, accountId: accountId2});
      // THEN
      expect(fossilAggregate._itemIds(fossilId).length).toBe(1);
      expect(fossilAggregate.fossils[fossilId][firstItemId]).not.toBeDefined();
      expect(fossilAggregate.fossils[fossilId][secondItemId].sellerId).toBe(accountId3);
      expect(fossilAggregate.fossils[fossilId][secondItemId].buyerId).toBe(buyerId);
    });
    it('cannot unlist item if not found', async () => {
      // THEN
      await expect(fossilAggregate.unlistItem({itemId: 'unavailable-item', fossilId})).rejects.toThrow(/Item Could not be found/);
    });
    it('cannot unlist item of another account', async () => {
      // GIVEN
      await fossilAggregate.listItem({accountId, fossilId});
      const itemId = fossilAggregate._itemIds(fossilId)[0];
      // THEN
      await expect(fossilAggregate.unlistItem({itemId, fossilId, accountId: accountId2})).rejects.toThrow(/User is not seller of item/);
    });
  });
  describe('Desire Item', () => {
    it('Adds Item to desired account if seller exists', async () => {
      // GIVEN
      await fossilAggregate.listItem({accountId: accountId2, fossilId});
      // WHEN
      await fossilAggregate.desireItem({accountId, fossilId});
      // THEN
      expect(fossilAggregate.fossils[fossilId]).toBeDefined();
      expect(Object.keys(fossilAggregate.fossils[fossilId]).length).toBe(1);
      const itemId = fossilAggregate._itemIds(fossilId)[0];
      expect(fossilAggregate.fossils[fossilId][itemId].fossilId).toBe(fossilId);
      expect(fossilAggregate.fossils[fossilId][itemId].sellerId).toBe(accountId2);
      expect(fossilAggregate.fossils[fossilId][itemId].buyerId).toBe(accountId);
    });
    it('Adds Account to desired accounts if seller does not exists', async () => {
      // WHEN
      await fossilAggregate.desireItem({accountId, fossilId});
      // THEN
      expect(fossilAggregate.fossils[fossilId].desiredAccountIds).toBeDefined();
      expect(fossilAggregate.fossils[fossilId].desiredAccountIds.length).toBe(1);
      expect(fossilAggregate.fossils[fossilId].desiredAccountIds[0]).toBe(accountId);
    });
    it('Does not desire item when account does not exist', async () => {
      // THEN
      await expect(fossilAggregate.desireItem({fossilId})).rejects.toThrow(/Account is required/);
      await expect(fossilAggregate.desireItem({accountId: 'invalid_account', fossilId})).rejects.toThrow(/Account does not exist/);
    });
    it('Does not desire item when no fossil id available', async () => {
      // THEN
      await expect(fossilAggregate.desireItem({accountId})).rejects.toThrow(/Fossil requires fossilId/);
    });
  });
  describe('Undesire Item', () => {
    it('Undesires the item if not currently in a match', async () => {
      // GIVEN
      await fossilAggregate.desireItem({accountId, fossilId});
      // WHEN
      await fossilAggregate.undesireItem({accountId, fossilId});
      // THEN
      expect(fossilAggregate.fossils[fossilId]).toBeDefined();
      expect(fossilAggregate.fossils[fossilId].desiredAccountIds).toBeDefined();
      expect(fossilAggregate.fossils[fossilId].desiredAccountIds.length).toBe(0);
    });
    it('Undesires the item even in a match', async () => {
      // GIVEN
      await fossilAggregate.listItem({accountId: accountId2, fossilId});
      await fossilAggregate.desireItem({accountId, fossilId});
      // WHEN
      await fossilAggregate.undesireItem({accountId, fossilId});
      // THEN
      expect(fossilAggregate.fossils[fossilId]).toBeDefined();
      expect(fossilAggregate._itemIds(fossilId).length).toBe(1);
      const itemId = fossilAggregate._itemIds(fossilId)[0];
      expect(fossilAggregate.fossils[fossilId][itemId].buyerId).toBe(null);
    });
    it('Throws an error if item not being desired', async () => {
      // THEN
      await expect(fossilAggregate.undesireItem({accountId, fossilId})).rejects.toThrow(/Item not currently desired/);
    });
    it('Does not list item when account does not exist', async () => {
      // THEN
      await expect(fossilAggregate.undesireItem({fossilId})).rejects.toThrow(/Account is required/);
      await expect(fossilAggregate.undesireItem({accountId: 'invalid_account', fossilId})).rejects.toThrow(/Account does not exist/);
    });
    it('Does not list item when no fossil id available', async () => {
      // THEN
      await expect(fossilAggregate.undesireItem({accountId})).rejects.toThrow(/Fossil requires fossilId/);
    });
  });
});
