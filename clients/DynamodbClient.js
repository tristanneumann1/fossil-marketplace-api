const config = require('config');
const AWS = require('aws-sdk');
const {CustomError} = require('../utils').Errors;
const logger = require('../utils').logger;
const {FMEvent} = require('../entities/Events');

class DynamoDbClient{
  constructor(tableName) {
    this.tableName = tableName;
    const params = Object.assign({}, config.get('dynamoParams'));
    this.client = new AWS.DynamoDB.DocumentClient(params);
  }
  async putEvent(event) {
    if (!(event instanceof FMEvent)) {
      throw new CustomError('DynamodbClient.putEvent, event not valid type');
    }
    const timestamp = Date.now();
    const aggregateByNameKey = '[AggByName]' + event.aggregateName;
    const aggregateByIdKey = '[AggById]' + event.aggregateName + '|' + event.aggregateId;
    const aggregateByNamePayload = Object.assign({}, event);
    const aggregateByIdPayload = Object.assign({}, event);

    aggregateByNamePayload.aggregateKey = aggregateByNameKey;
    aggregateByNamePayload.timestamp = timestamp;
    aggregateByIdPayload.aggregateKey = aggregateByIdKey;
    aggregateByIdPayload.timestamp = timestamp;

    await Promise.all([
      this.put(aggregateByNamePayload),
      this.put(aggregateByIdPayload),
    ]);
  }
  async put(record) {
    try {
      await this.client.put({
        TableName: this.tableName,
        Item: record,
      }).promise();
    } catch (error) {
      logger.warn('DynamoDbClient.put: ' + JSON.stringify(record));
      throw error;
    }
  }
  async getById(id) {
    const response = await this.client.scan({
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id,
      },
      TableName: this.tableName,
    }).promise();
    return response.Items[0];
  }
  async scanEvents(LastEvaluatedKey = false) {
    let params = {
      ConsistentRead: true,
      TableName: this.tableName,
    };
    if (LastEvaluatedKey && typeof LastEvaluatedKey === 'string') {
      params.ExclusiveStartKey = LastEvaluatedKey;
    }
    try {
      return await this.client.scan(params).promise();
    } catch (error) {
      logger.warn('DynamoDbClient.scanEvents: ' + JSON.stringify(params));
      throw error;
    }
  }
  async queryEvents(aggregateName, aggregateId, LastEvaluatedKey = false) {
    let params = {
      ConsistentRead: true,
      TableName: this.tableName,
      KeyConditionExpression: 'aggregateKey = :aggregateKey',
      ExpressionAttributeValues: {
        ':aggregateKey': '[AggByName]' + aggregateName,
      },
    };
    if (aggregateId) {
      params.ExpressionAttributeValues[':aggregateKey'] = '[AggById]' + aggregateName + '|' + aggregateId;
    }
    if (LastEvaluatedKey && typeof LastEvaluatedKey === 'string') {
      params.ExclusiveStartKey = LastEvaluatedKey;
    }
    try {
      return await this.client.query(params).promise();
    } catch (error) {
      logger.warn('DynamoDbClient.queryEvents: ' + JSON.stringify(params));
      throw error;
    }
  }
}


module.exports = DynamoDbClient;
