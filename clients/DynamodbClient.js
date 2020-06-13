const config = require('config');
const AWS = require('aws-sdk');

class DynamoDbClient{
  constructor(tableName) {
    this.tableName = tableName;
    const params = Object.assign({}, config.get('dynamoParams'));
    this.client = new AWS.DynamoDB.DocumentClient(params);
  }
  async put(record) {
    await this.client.put({
      TableName: this.tableName,
      Item: record,
    }).promise();
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
      TableName: this.tableName,
    };
    if (LastEvaluatedKey && typeof LastEvaluatedKey === 'string') {
      params.ExclusiveStartKey = LastEvaluatedKey;
    }
    return await this.client.scan(params).promise();
  }
  async queryEvents(aggregateName, aggregateId, LastEvaluatedKey = false) {
    let params = {
      TableName: this.tableName,
      KeyConditionExpression: 'aggregateName = :aggregateName',
      ExpressionAttributeValues: {
        ':aggregateName': aggregateName,
      },
    };
    if (aggregateId) {
      params.KeyConditionExpression += ' and aggregateId = :aggregateId';
      params.ExpressionAttributeValues[':aggregateId'] = aggregateId;
    }
    if (LastEvaluatedKey && typeof LastEvaluatedKey === 'string') {
      params.ExclusiveStartKey = LastEvaluatedKey;
    }
    return await this.client.query(params).promise();
  }
}

module.exports = DynamoDbClient;
