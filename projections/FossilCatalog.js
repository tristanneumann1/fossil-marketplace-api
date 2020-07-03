const { promisify } = require('util');
const redis = require('redis');
const config = require('config');
const Fossil = require('../aggregates/Fossil');
const {logger} = require('../utils');

class FossilCatalog {
  static PROJECTION_NAME = 'fossilCatalog';
  constructor({client = null, projectionVersion = null}) {
    this.client = client || redis.createClient ({
      port : config.get('redis.port'),
      host : config.get('redis.host'),
      password: config.get('redis.password'),
    });
    this.version = projectionVersion;
    this.client.hgetAsync = promisify(this.client.hget).bind(this.client);
    this.client.getAsync = promisify(this.client.get).bind(this.client);
    this.client.lrangeAsync = promisify(this.client.lrange).bind(this.client);
  }
  async consume(event) {
    if (!this.version) {
      await this.initialiseVerion('latest');
    }
    if (!await this.client.getAsync(this._getPrefix() + '.eventCounter')) {
      this.client.set(this._getPrefix() + '.eventCounter', 0);
    }
    this.client.incr(this._getPrefix() + '.eventCounter');
    if (event.name === Fossil.ITEM_WAS_LISTED) {
      logger.debug(`projections.fossilCatalog.consume -- event: ${event.name} -- eventId: ${event.id}`);
      if (event.payload && event.payload.sellerId) {
        await this._updateAccount(event.payload.sellerId, event.aggregateId, event.payload);
      }
      if (event.payload && event.payload.buyerId) {
        await this._updateAccount(event.payload.buyerId, event.aggregateId, event.payload);
      }
    }
    if (event.name === Fossil.ITEM_WAS_UNLISTED) {
      const item = JSON.parse(await this.client.hgetAsync(this._getPrefix(), event.payload.accountId) || 'null');
      await this._updateAccount(event.payload.accountId, event.aggregateId, null);
      if (item && item[event.aggregateId].buyerId) {
        await this._updateAccount(item[event.aggregateId].buyerId, event.aggregateId, null);
      }
    }
  }
  async eventCount() {
    return await this.client.getAsync(this._getPrefix() + '.eventCounter');
  }
  async result(accountId) {
    const result = await this.client.hgetAsync(this._getPrefix(), accountId);
    return result ? JSON.parse(result) : null;
  }
  async initialiseVerion(version) {
    const versions = this.client.lrangeAsync(FossilCatalog.PROJECTION_NAME + '.versions', 0, -1);
    if (version in versions) {
      return;
    }
    this.client.lpush(FossilCatalog.PROJECTION_NAME + '.versions', version);
    this.version = version;
  }
  async _updateAccount(accountId, itemId, item) {
    const redisResult = await this.client.hgetAsync(this._getPrefix(), accountId);
    const accountState = redisResult ? JSON.parse(redisResult) : {};
    accountState[itemId] = item;
    this.client.hset(this._getPrefix(), accountId, JSON.stringify(accountState));
  }
  _getPrefix() {
    return FossilCatalog.PROJECTION_NAME + '.' + this.version;
  }
}

module.exports = FossilCatalog;
