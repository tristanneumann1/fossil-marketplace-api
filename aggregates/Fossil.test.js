const Fossil = require('./Fossil.js');
const Account = require('./Account.js');
const {LocalEventStore} = require('../entities/EventStore');
const {FMEvent} = require('../entities/Events');

describe('List Item', () => {
  const fossilId = 'fossil-id';
  const accountId = 'user-token';
  let fossilAggregate;
  beforeEach(async () => {
    fossilAggregate = new Fossil();
    const eventStore = new LocalEventStore();
    const accountAggregate = new Account();
    await accountAggregate.buildAggregate(eventStore);
    await accountAggregate.createAccount(accountId);
    await fossilAggregate.buildAggregate(accountAggregate.eventStore);
  });
  it('Adds Item to listed account', async () => {
    // WHEN
    const itemId = 'item-id';
    await fossilAggregate.listItem(itemId, {accountId, fossilId});
    // THEN
    expect(fossilAggregate.fossils[itemId]).toBeDefined();
    expect(fossilAggregate.fossils[itemId].fossilId).toBe(fossilId);
  });
  it('Does not list item when account does not exist', async () => {
    // THEN
    await expect(fossilAggregate.listItem('itemId', {fossilId})).rejects.toThrow(/Account is required/);
    await expect(fossilAggregate.listItem('itemId', {accountId: 'invalid_account', fossilId})).rejects.toThrow(/Account does not exist/);
  });
  it('Does not list item when no fossil id availablet', async () => {
    // THEN
    await expect(fossilAggregate.listItem('itemId', {accountId})).rejects.toThrow(/Fossil requires fossilId/);
  });
  it('Ignores events of other Aggregates', async () => {
    // GIVEN
    const event = new FMEvent(fossilAggregate.ITEM_WAS_LISTED, {}, {aggregateName: 'UnrelatedAggregate', aggregateId: 'itemId'});
    // WHEN
    await fossilAggregate._consumeEvent(event);
    // THEN
    expect(fossilAggregate.fossils).toEqual({});
  });
});
