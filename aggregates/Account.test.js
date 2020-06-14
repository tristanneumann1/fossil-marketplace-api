const Account = require('./Account');
const {LocalEventStore} = require('../utils/EventStore');
const { v4 } = require('uuid');
const {FMEvent} = require('../utils').Events;

describe('account aggregate', () => {
  it('Creates a new account', async () => {
    // GIVEN
    const eventStore = new LocalEventStore();
    const email = 'account@example.com';
    const accountAggregate = new Account();
    await accountAggregate.buildAggregate(eventStore);
    // WHEN
    await accountAggregate.createAccount(email);
    // THEN
    const accountWasCreated = eventStore.getAllEvents().items[0];
    expect(accountWasCreated.aggregateName).toBe(accountAggregate.AGGREGATE_NAME);
    expect(accountWasCreated.payload.email).toBe(email);
  });
  it('Does Not Create a new account if one exists with that email', async () => {
    // GIVEN
    const eventStore = new LocalEventStore();
    const email = 'account@example.com';
    const accountAggregate = new Account();
    await accountAggregate.buildAggregate(eventStore);
    await accountAggregate.createAccount(email);
    // THEN
    expect(accountAggregate.createAccount(email)).rejects.toThrow(/Account already exists for email/);

    const firstAccountWasCreated = eventStore.getAllEvents().items[0];
    expect(eventStore.getAllEvents().items.length).toBe(1);
    expect(firstAccountWasCreated.payload.email).toBe(email);
  });
  it('Adds extra information to account', async () => {
    // GIVEN
    const eventStore = new LocalEventStore();
    const email = 'account@example.com';
    const info = {
      dodoCode: 'dodo_code',
      username: 'Mr.Dodo',
      email,
    };
    const accountAggregate = new Account();
    await accountAggregate.buildAggregate(eventStore);
    // WHEN
    await accountAggregate.createAccount(email, info);
    // THEN
    const accountWasCreated = eventStore.getAllEvents().items[0];
    expect(accountWasCreated.aggregateName).toBe(accountAggregate.AGGREGATE_NAME);
    expect(accountWasCreated.payload.email).toBe(email);
    expect(accountWasCreated.payload.username).toBe(info.username);
    expect(accountWasCreated.payload.dodoCode).toBe(info.dodoCode);
  });
  it('Builds up an aggregate based on an event store', async () => {
    // GIVEN
    const eventStore = new LocalEventStore();
    const account = new Account();
    const emails = [
      'test1@example.com',
      'test2@example.com',
      'test3@example.com'
    ];
    const events = emails.map((email) => new FMEvent('ThingHappened', {email}, {aggregateName: account.AGGREGATE_NAME, aggregateId: v4()}));
    events.forEach((event) => eventStore.registerEvent(event));
    // WHEN
    await account.buildAggregate(eventStore);
    // THEN
    expect(account.accounts[emails[0]]).toEqual({email: emails[0]});
    expect(account.accounts[emails[1]]).toEqual({email: emails[1]});
    expect(account.accounts[emails[2]]).toEqual({email: emails[2]});
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
