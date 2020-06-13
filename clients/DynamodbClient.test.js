const DynamoDbClient = require('./DynamodbClient');
const AWS = require('aws-sdk');
const sinon = require('sinon');
const { marshall } = AWS.DynamoDB.Converter;

describe('DynamodbClient', () => {
  let sinonSandbox;

  let dynamoPutStub = sinon.stub();
  let dynamoScanStub = sinon.stub();
  let dynamoQueryStub = sinon.stub();
  beforeEach(() => {
    sinonSandbox = sinon.createSandbox();
    sinonSandbox.stub(AWS, 'DynamoDB').returns({
      putItem(...args) {
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
    expect(dynamoPutStub.firstCall.args[0].Item).toEqual(marshall(record));
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
  it('Can query for aggregate type', async () => {
    // GIVEN
    const aggregateName = 'AggregateName';
    const record = {
      aggregateName,
      id: 'event_id',
    };
    const tableName = 'DynamoTable';
    const client = new DynamoDbClient(tableName);
    dynamoQueryStub.resolves({
      Items: [record],
    });
    // WHEN
    const actual = await client.queryEvents(aggregateName);
    // THEN
    expect(dynamoQueryStub.calledOnce).toBe(true);
    expect(dynamoQueryStub.firstCall.args[0].TableName).toBe(tableName);
    expect(dynamoQueryStub.firstCall.args[0].ExpressionAttributeValues[':aggregateName']).toBe(aggregateName);
    expect(actual.Items[0]).toBe(record);
  });
});
