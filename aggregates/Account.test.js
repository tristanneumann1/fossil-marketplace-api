const Account = require('./Account');
const {LocalEventStore} = require('../lib/EventStore');

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
    expect(accountWasCreated.aggregateName).toBe('Account');
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
});
