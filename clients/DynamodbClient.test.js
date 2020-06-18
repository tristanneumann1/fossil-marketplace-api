const DynamoDbClient = require('./DynamodbClient');
const {FMEvent} = require('../entities/Events');
const AWS = require('aws-sdk');
const sinon = require('sinon');

describe('DynamodbClient', () => {
  let sinonSandbox;

  let dynamoPutStub = sinon.stub();
  let dynamoScanStub = sinon.stub();
  let dynamoQueryStub = sinon.stub();
  beforeEach(() => {
    sinonSandbox = sinon.createSandbox();
    sinonSandbox.stub(AWS.DynamoDB, 'DocumentClient').returns({
      put(...args) {
        return {
          promise: () => dynamoPutStub(...args),
        };
      },
      scan(...args) {
        return {
          promise: () => dynamoScanStub(...args),
        };
      },
      query(...args) {
        return {
          promise: () => dynamoQueryStub(...args),
        };
      },
    });
  });
  afterEach(() => {
    dynamoPutStub.reset();
    dynamoScanStub.reset();
    dynamoQueryStub.reset();
    sinonSandbox.restore();
  });
  it('Can Create Records', async () => {
    // GIVEN
    const record = {
      pk: 'pk',
      sk: 'sk',
    };
    const tableName = 'DynamoTable';
    const client = new DynamoDbClient(tableName);
    // WHEN
    await client.put(record);
    // THEN
    expect(dynamoPutStub.calledOnce).toBe(true);
    expect(dynamoPutStub.firstCall.args[0].Item).toEqual(record);
    expect(dynamoPutStub.firstCall.args[0].TableName).toBe(tableName);
  });
  it('Can recover Records', async () => {
    // GIVEN
    const record = {
      pk: 'pk',
      sk: 'sk',
      id: 'event_id',
    };
    const tableName = 'DynamoTable';
    const client = new DynamoDbClient(tableName);
    dynamoScanStub.resolves({
      Items: [record],
    });
    // WHEN
    const actual = await client.getById(record.id);
    // THEN
    expect(dynamoScanStub.calledOnce).toBe(true);
    expect(dynamoScanStub.firstCall.args[0].ExpressionAttributeValues[':id']).toBe(record.id);
    expect(dynamoScanStub.firstCall.args[0].TableName).toBe(tableName);
    expect(actual).toBe(record);
  });
  it('can publish an event', async () => {
    // GIVEN
    const aggregateName = 'Aggregate';
    const aggregateId = 'aggregateId';
    const event = new FMEvent('Something Happened', {}, {aggregateName, aggregateId});
    const tableName = 'DynamoTable';
    const client = new DynamoDbClient(tableName);
    // WHEN
    await client.putEvent(event);
    // THEN
    expect(dynamoPutStub.calledOnce).toBe(true);
    const firstCallArg = dynamoPutStub.args[0][0];
    expect(firstCallArg.Item.aggregateName).toEqual(aggregateName);
    expect(firstCallArg.Item.aggregateId).toEqual(aggregateId);
    expect(firstCallArg.Item.aggregateIdKey.includes(aggregateId + '#')).toBe(true);
    expect(firstCallArg.Item.eventDate).toBeDefined();
    expect(firstCallArg.TableName).toBe(tableName);   
  });
  it('Does not publish invalid eventt', async () => {
    // GIVEN
    const event = {aggregateName: 'InvalidEvent', aggregateId: 'aggregate-id'};
    const tableName = 'DynamoTable';
    const client = new DynamoDbClient(tableName);
    // WHEN
    // THEN
    await expect(client.putEvent(event)).rejects.toThrow(/event not valid type/);
  });
  it('Can scan for records', async () => {
    // GIVEN
    const record = {
      id: 'event_id',
    };
    const tableName = 'DynamoTable';
    const client = new DynamoDbClient(tableName);
    dynamoScanStub.resolves({
      Items: [record],
    });
    // WHEN
    const actual = await client.scanEvents();
    // THEN
    expect(dynamoScanStub.calledOnce).toBe(true);
    expect(dynamoScanStub.firstCall.args[0].TableName).toBe(tableName);
    expect(actual.Items[0]).toBe(record);
  });
  it('Can scan paginated records', async () => {
    // GIVEN
    const lastEvaluatedKey = 'LastEvaluatedKey';
    const tableName = 'DynamoTable';
    const client = new DynamoDbClient(tableName);
    // WHEN
    await client.scanEvents(lastEvaluatedKey);
    // THEN
    expect(dynamoScanStub.calledOnce).toBe(true);
    expect(dynamoScanStub.firstCall.args[0].TableName).toBe(tableName);
    expect(dynamoScanStub.firstCall.args[0].ExclusiveStartKey).toBe(lastEvaluatedKey);
  });
  it('Can query for aggregate type', async () => {
    // GIVEN
    const record = {
      aggregateName: 'AggregateName',
      id: 'event_id',
    };
    const tableName = 'DynamoTable';
    const client = new DynamoDbClient(tableName);
    dynamoQueryStub.resolves({
      Items: [record],
    });
    // WHEN
    const actual = await client.queryEvents(record.aggregateName);
    // THEN
    expect(dynamoQueryStub.calledOnce).toBe(true);
    expect(dynamoQueryStub.firstCall.args[0].TableName).toBe(tableName);
    expect(dynamoQueryStub.firstCall.args[0].ExpressionAttributeValues[':aggregateName']).toBe(record.aggregateName);
    expect(actual.Items[0]).toBe(record);
  });
  it('Can query for aggregate type and aggregateId', async () => {
    // GIVEN
    const aggregateName = 'AggregateName';
    const aggregateId = 'aggregateId';
    const lastEvaluatedKey = 'LastEvaluatedKey';
    const tableName = 'DynamoTable';
    const client = new DynamoDbClient(tableName);
    // WHEN
    await client.queryEvents(aggregateName, aggregateId, lastEvaluatedKey);
    // THEN
    expect(dynamoQueryStub.calledOnce).toBe(true);
    expect(dynamoQueryStub.firstCall.args[0].TableName).toBe(tableName);
    expect(dynamoQueryStub.firstCall.args[0].ExpressionAttributeValues[':aggregateName']).toBe(aggregateName);
    expect(dynamoQueryStub.firstCall.args[0].ExpressionAttributeValues[':aggregateId']).toBe(aggregateId);
    expect(dynamoQueryStub.firstCall.args[0].KeyConditionExpression).toBe('aggregateName = :aggregateName and begins_with(aggregateIdKey, :aggregateId)');
    expect(dynamoQueryStub.firstCall.args[0].ExclusiveStartKey).toBe(lastEvaluatedKey);
  });
});
