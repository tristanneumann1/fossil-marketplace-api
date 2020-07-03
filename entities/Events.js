const {v4} = require('uuid');
const {CustomError} = require('../utils/Errors');

class FMEvent{
  constructor(name, payload, {aggregateName, aggregateId, id = null, metaData = null}) {
    if (!aggregateName || !aggregateId) {
      throw new CustomError('Event, invalid event params', 500);
    }
    this.id = id || v4();
    this.name = name;
    this.aggregateName = aggregateName;
    this.aggregateId = aggregateId;
    this.payload = payload;
    this.metaData = metaData || {
      createdAt: Date.now(),
    };
  }
}

module.exports = {FMEvent};
