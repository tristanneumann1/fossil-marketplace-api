const Account = require('./Account');
const {LocalEventStore} = require('../entities/EventStore');
const { v4 } = require('uuid');
const {FMEvent} = require('../entities/Events');

describe('account aggregate', () => {
  describe('Build Aggregate', () => {
    it('Builds up an aggregate based on an event store', async () => {
      // GIVEN
      const eventStore = new LocalEventStore();
      const account = new Account();
      const userTokens = [
        'user-token-1',
        'user-token-2',
        'user-token-3',
      ];
      const events = userTokens.map((userToken) => new FMEvent(account.ACCOUNT_WAS_CREATED, {}, {aggregateName: account.AGGREGATE_NAME, aggregateId: userToken}));
      events.forEach((event) => eventStore.registerEvent(event));
      // WHEN
      await account.buildAggregate(eventStore);
      // THEN
      expect(account.accounts[userTokens[0]]).toBeDefined();
      expect(account.accounts[userTokens[1]]).toBeDefined();
      expect(account.accounts[userTokens[2]]).toBeDefined();
    });
    it('Ignores events of other Aggregates', async () => {
      // GIVEN
      const eventStore = new LocalEventStore();
      const account = new Account();
      const event = new FMEvent('ThingHappened', {}, {aggregateName: 'UnrelatedAggregate', aggregateId: v4()});
      eventStore.registerEvent(event);
      // WHEN
      await account.buildAggregate(eventStore);
      // THEN
      expect(account.accounts).toEqual({});
    });
  });
  describe('Create Account', () => {
    it('Creates a new account', async () => {
      // GIVEN
      const eventStore = new LocalEventStore();
      const userToken = 'accountToken';
      const email = 'account@example.com';
      const payload = {
        email,
      };
      const accountAggregate = new Account();
      await accountAggregate.buildAggregate(eventStore);
      // WHEN
      await accountAggregate.createAccount(userToken, payload);
      // THEN
      const accountWasCreated = eventStore.getAllEvents().items[0];
      expect(accountWasCreated.aggregateName).toBe(accountAggregate.AGGREGATE_NAME);
      expect(accountWasCreated.aggregateId).toBe(userToken);
      expect(accountWasCreated.payload.email).toBe(email);
    });
    it('Does Not Create a new account if one exists for that user', async () => {
      // GIVEN
      const eventStore = new LocalEventStore();
      const userToken = 'userToken';
      const accountAggregate = new Account();
      await accountAggregate.buildAggregate(eventStore);
      await accountAggregate.createAccount(userToken);
      // THEN
      await expect(accountAggregate.createAccount(userToken)).rejects.toThrow(/Account already exists for user/);
  
      const firstAccountWasCreated = eventStore.getAllEvents().items[0];
      expect(eventStore.getAllEvents().items.length).toBe(1);
      expect(firstAccountWasCreated.aggregateId).toBe(userToken);
    });
    it('Adds extra information to account', async () => {
      // GIVEN
      const eventStore = new LocalEventStore();
      const userToken = 'user-token';
      const info = {
        dodoCode: 'dodo_code',
        username: 'Mr.Dodo',
        email: 'account@example.com',
      };
      const accountAggregate = new Account();
      await accountAggregate.buildAggregate(eventStore);
      // WHEN
      await accountAggregate.createAccount(userToken, info);
      // THEN
      const accountWasCreated = eventStore.getAllEvents().items[0];
      expect(accountWasCreated.aggregateName).toBe(accountAggregate.AGGREGATE_NAME);
      expect(accountWasCreated.aggregateId).toBe(userToken);
      expect(accountWasCreated.payload.email).toBe(info.email);
      expect(accountWasCreated.payload.username).toBe(info.username);
      expect(accountWasCreated.payload.dodoCode).toBe(info.dodoCode);
    });
  });
  describe('List Item', () => {
    const itemId = 'item-id';
    const userToken = 'user-token';
    let aggregate;
    beforeEach(async () => {
      aggregate = new Account();
      const eventStore = new LocalEventStore();
      await aggregate.buildAggregate(eventStore);
      await aggregate.createAccount(userToken);
    });
    it('Adds Item to listed account', async () => {
      // WHEN
      await aggregate.listItem(userToken, {itemId});
      // THEN
      expect(aggregate.accounts[userToken].listedItems).toBeDefined();
      expect(aggregate.accounts[userToken].listedItems[itemId]).toBeDefined();
      const item = aggregate.accounts[userToken].listedItems[itemId][0];
      expect(item.itemId).toBe(itemId);
    });
    it('Does not list item when account does not exist', async () => {
      // THEN
      await expect(aggregate.listItem('other-user-token', {itemId})).rejects.toThrow(/Account does not exist/);
    });
  });
});
