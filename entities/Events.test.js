const {FMEvent} = require('./Events');

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
