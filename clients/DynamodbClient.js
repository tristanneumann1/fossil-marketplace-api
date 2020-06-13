const config = require('config');
const AWS = require('aws-sdk');

class DynamoDbClient{
  constructor(tableName) {
    this.tableName = tableName;
    const params = config.get('dynamoParams');
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
  async scanEvents(aggregateName = null, LastEvaluatedKey = false) {
    let params = {
      TableName: this.tableName,
    };
    if (LastEvaluatedKey && typeof LastEvaluatedKey === 'string') {
      params.ExclusiveStartKey = LastEvaluatedKey;
    }
    if (aggregateName) {
      params.FilterExpression = 'aggregateName = :aggregateName';
      params.ExpressionAttributeValues = {
        ':aggregateName': aggregateName,
      };
    }
    return await this.client.scan(params).promise();
  }
}

module.exports = DynamoDbClient;
