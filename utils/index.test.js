const {FMEvent} = require('./index').Events;
const {LocalEventStore} = require('./index').EventStore;

describe('utils', () => {
  describe('FMEvent', () => {
    it('Creates an event with all given data', () => {
      // GIVEN
      const eventName = 'SomethingJustHappened';
      const aggregateName = 'MegaCorp';
      const aggregateId = 'Corp_123';
      const payload = {
        key: 'special value',
      };
      // WHEN
      const event = new FMEvent(eventName, payload, {aggregateName, aggregateId});
      // THEN
      expect(event.name).toBe(eventName);
      expect(event.aggregateName).toBe(aggregateName);
      expect(event.aggregateId).toBe(aggregateId);
      expect(event.payload).toBe(payload);
      expect(event.id).toBeDefined();
      expect(event.metaData).toBeDefined();
      expect(typeof event.metaData.createdAt).toBe('number');
    });
  });
  describe('LocalEventStore', () => {
    it('Stores and retrievs items', async () => {
      // GIVEN
      const aggregateName = 'SomeAgg';
      const aggregateId = '111222';
      const store = new LocalEventStore();
      const event = new FMEvent('YouDidSomethingCool', {}, {aggregateName, aggregateId});
      // WHEN
      await store.registerEvent(event);
      const events = store.getAllEvents();
      // THEN
      expect(events.items.length).toBe(1);
      expect(events.items[0]).toBe(event);
    });
    it('Provides an iterator', async () => {
      // GIVEN
      const aggregateName = 'SomeAgg';
      const aggregateId = '111222';
      const store = new LocalEventStore();
      const firstEvent = new FMEvent('FirstEvent', {}, {aggregateName, aggregateId});
      const secondEvent = new FMEvent('SecondEvent', {}, {aggregateName, aggregateId});
      // WHEN
      await store.registerEvent(firstEvent);
      await store.registerEvent(secondEvent);
      const iterator = store.getIterator();
      // THEN
      expect(typeof iterator[Symbol.asyncIterator]).toBe('function');
      expect((await iterator.next()).value).toBe(firstEvent);
      expect((await iterator.next()).value).toBe(secondEvent);
      expect((await iterator.next()).done).toBe(true);
    });
  });
});
