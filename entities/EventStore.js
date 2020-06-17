const {CustomError} = require('../utils/Errors');
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
    if(localStorage && localStorage.getItem('useLocalStorage')) {
      this.items = JSON.parse(localStorage.getItem('db'));
      return;
    }
    this.items = [];
  }
  getAllEvents() {
    return {
      items: this.items,
    };
  }
  async registerEvent(event) {
    this.items.push(event);
    if (localStorage && localStorage.getItem('useLocalStorage'));
    localStorage.setItem('db', JSON.stringify(this.items));
  }
  async* getIterator(aggregateName, aggregateId) {
    let i = 0;
    while(i < this.items.length) {
      if (aggregateName && this.items[i].aggregateName !== aggregateName) {
        i++;
        continue;
      }
      if (aggregateId && this.items[i].aggregateId !== aggregateId) {
        i++;
        continue;
      }
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
    await this.client.putEvent(event);
  }
  async* getIterator(aggregateName = null, aggregateId = null) {
    let LastEvaluatedKey = true;
    while (LastEvaluatedKey) {
      let response;
      if (aggregateName) {
        response = await this.client.queryEvents(aggregateName, aggregateId, LastEvaluatedKey);
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
