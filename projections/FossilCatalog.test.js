const FossilCatalog = require('./fossilCatalog');
const {FMEvent} = require('../entities/Events');
const Fossil = require('../aggregates/Fossil');
const redis = require('redis-mock');

describe('Fossil catalog', () => {
  let client;
  beforeEach(() => {
    client = redis.createClient();
  });
  afterEach(() => {
    client.quit();
  });
  it('Counts events it is projecting', async () => {
    // GIVEN
    const fossilCatalog = new FossilCatalog({client});
    const aggregateName = 'aggregate-name';
    const aggregateId = 'aggregate-id';
    const event = new FMEvent(Fossil.ITEM_WAS_LISTED, {}, {aggregateName, aggregateId});
    const event2 = new FMEvent(Fossil.ITEM_WAS_LISTED, {}, {aggregateName, aggregateId: aggregateId + '2'});
    // WHEN
    await fossilCatalog.consume(event);
    await fossilCatalog.consume(event2);
    // THEN
    expect(await fossilCatalog.eventCount()).toBe('2');
  });
  it('Has projects events into the state', async () => {
    // GIVEN
    const fossilCatalog = new FossilCatalog({client});
    const aggregateName = 'aggregate-name';
    const aggregateId = 'aggregate-id';
    const sellerId = 'seller-id';
    const buyerId = 'buyer-id';
    const fossilId = 'fossil-id';
    const event = new FMEvent(Fossil.ITEM_WAS_LISTED, {fossilId, sellerId, buyerId}, {aggregateName, aggregateId});
    // WHEN
    await fossilCatalog.consume(event);
    // THEN
    const sellerCatalog = await fossilCatalog.result(sellerId);
    expect(sellerCatalog[aggregateId]).toBeDefined();
    expect(sellerCatalog[aggregateId].sellerId).toBe(sellerId);
    const buyerCatalog = await fossilCatalog.result(buyerId);
    expect(buyerCatalog[aggregateId]).toBeDefined();
    expect(buyerCatalog[aggregateId].buyerId).toBe(buyerId);
  });
  it('Projects listings and unlistings', async () => {
    // GIVEN
    const fossilCatalog = new FossilCatalog({client});
    const aggregateName = 'aggregate-name';
    const aggregateId = 'aggregate-id';
    const sellerId = 'seller-id';
    const buyerId = 'buyer-id';
    const fossilId = 'fossil-id';
    const listingEvent = new FMEvent(Fossil.ITEM_WAS_LISTED, {fossilId, sellerId, buyerId}, {aggregateName, aggregateId});
    const unlistingEvent = new FMEvent(Fossil.ITEM_WAS_UNLISTED, {accountId: sellerId, fossilId, itemId: aggregateId}, {aggregateName, aggregateId});
    // WHEN
    await fossilCatalog.consume(listingEvent);
    await fossilCatalog.consume(unlistingEvent);
    // THEN
    const sellerCatalog = await fossilCatalog.result(sellerId);
    expect(sellerCatalog[aggregateId]).toBe(null);
    const buyerCatalog = await fossilCatalog.result(buyerId);
    expect(buyerCatalog[aggregateId]).toBe(null);
  });
  it('projects under specified version', async () => {
    // GIVEN 
    const projectionVersion = 'testVersion';
    // WHEN
    const fossilCatalog = new FossilCatalog({client});
    await fossilCatalog.initialiseVerion(projectionVersion);
    // THEN
    expect(fossilCatalog._getPrefix()).toBe(FossilCatalog.PROJECTION_NAME + '.' + projectionVersion);
  });
});
