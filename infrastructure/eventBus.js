const unmarshall = require('aws-sdk/clients/dynamodb').Converter.unmarshall;
const logger = require('../utils').logger;
const {FMEvent} = require('../entities/Events');
const FossilCatalog = require('../projections/FossilCatalog');

async function _streamToSubscribers(dbEvent, subscribers) {
  dbEvent.Records.forEach((record) => {
    const unmarshalledEvent = unmarshall(record.dynamodb.NewImage);
    logger.info(`infrastructure.eventBus._streamToSubscriber: ${unmarshalledEvent.id} for ${unmarshalledEvent.aggregateName} - ${unmarshalledEvent.aggregateId}`);
    const meta = {
      aggregateId: unmarshalledEvent.aggregateId,
      aggregateName: unmarshalledEvent.aggregateName,
      id: unmarshalledEvent.id,
      metaData: unmarshalledEvent.metaData,
    };
    const payload = unmarshalledEvent.payload ? unmarshalledEvent.payload : '{}';
    const event = new FMEvent(unmarshalledEvent.name, payload, meta);
    subscribers.forEach((subscriber) => subscriber.consume(event));
  });
}

async function stream(event) {
  const subscribers = [new FossilCatalog({projectionVersion: 'latest'})];
  await _streamToSubscribers(event, subscribers);
}

module.exports = { stream, _streamToSubscribers };
