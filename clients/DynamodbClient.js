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
    const payload = Object.assign({}, event);
    payload.eventDate = new Date().toISOString();
    payload.aggregateIdKey = event.aggregateId + '#' + payload.eventDate;

    await this.put(payload);
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
      KeyConditionExpression: 'begins_with(eventDate, :eventDate) and aggregateName = :aggregateName',
      ExpressionAttributeValues: {
        ':aggregateName': aggregateName,
        ':eventDate': '20',
      },
    };
    if (aggregateId) {
      params.IndexName = config.get('eventStoreIndexName');
      params.KeyConditionExpression = 'aggregateName = :aggregateName and begins_with(aggregateIdKey, :aggregateId)';
      params.ExpressionAttributeValues[':aggregateId'] = aggregateId;
      delete params.ExpressionAttributeValues[':eventDate'];
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
