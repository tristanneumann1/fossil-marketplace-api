const marshall = require('aws-sdk/clients/dynamodb').Converter.marshall;
const { _streamToSubscribers } = require('./eventBus');
const {FMEvent} = require('../entities/Events');

describe('EventBus', () => {
  it('Invokes subscribers with dynamo record event', async () => {
    // GIVEN
    const subscriber = {
      consume: jest.fn(),
    };
    const expected = {
      aggregateName: 'aggregateName',
      aggregateId: 'aggregateId',
      id: 'event-id',
      name: 'EventName',
    };
    const dynamoEvent = {
      Records: [
        {
          dynamodb: {
            NewImage: marshall(expected),
          },
        },
      ],
    };

    // WHEN
    await _streamToSubscribers(dynamoEvent, [subscriber]);
    // THEN
    expect(subscriber.consume.mock.calls.length).toBe(1);
    const actual = subscriber.consume.mock.calls[0][0];
    expect(actual instanceof FMEvent).toBe(true);
    expect(actual.id).toBe(expected.id);
  });
});
