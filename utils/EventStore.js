const {CustomError} = require('./Errors');
const DynamoDbClient = require('../clients/DynamodbClient');
const config = require('config');

class BaseEventStore{
  // eslint-disable-next-line
  async* getIterator() {
    throw new CustomError('Action unavailable', 400);
  }
  async registerEvent() {
    throw new CustomError('Action unavailable', 400);
  }
}

class LocalEventStore extends BaseEventStore{
  constructor() {
    super();
    this.items = [];
  }
  getAllEvents() {
    return {
      items: this.items,
    };
  }
  async registerEvent(event) {
    this.items.push(event);
  }
  async* getIterator() {
    let i = 0;
    while(i < this.items.length) {
      yield this.items[i];
      i++;
    }
  }
}

class DynamoEventStore extends BaseEventStore{
  constructor(tableName) {
    super();
    this.client = new DynamoDbClient(tableName);
  }
  async registerEvent(event) {
    await this.client.put(event);
  }
  async* getIterator(aggregateName = null, aggregateId = null) {
    let LastEvaluatedKey = true;
    while (LastEvaluatedKey) {
      let response;
      if (aggregateName) {
        response = this.client.queryEvents(aggregateName, aggregateId, LastEvaluatedKey);
      } else {
        response = await this.client.scanEvents(LastEvaluatedKey);
      }
      const records = response.Items;
      LastEvaluatedKey = response.LastEvaluatedKey;
      let i = 0;
      while(i < records.length) {
        yield records[i];
        i++;
      }
    }
  }
  async getById(id) {
    return await this.client.getById(id);
  }
}

const EventStore = {
  LocalEventStore,
  DynamoEventStore,
}[config.get('eventStore')];

module.exports = {BaseEventStore, LocalEventStore, DynamoEventStore, EventStore};
