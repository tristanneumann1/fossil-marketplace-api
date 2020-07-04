const Fossil = require('../aggregates/Fossil');
const {logger} = require('../utils');

class FossilCatalog {
  static PROJECTION_NAME = 'fossilCatalog';
  constructor({client, projectionVersion = null}) {
    this.client = client;
    this.version = projectionVersion;
    this.versionInitialised = false;
  }
  async consume(event) {
    try {
      logger.info(`FossilCatalog.consume -- name: ${event.name} -- id: ${event.id}`);
      if (!this.versionInitialised) {
        await this.initialiseVersion('latest');
      }
      logger.info('FossilCatalog.consume VERSION INITIALISED');
      if (!await this.client.getAsync(this._getPrefix() + '.eventCounter')) {
        this.client.set(this._getPrefix() + '.eventCounter', 0);
      }
      this.client.incr(this._getPrefix() + '.eventCounter');
      logger.info(`${event.name}, ${Fossil.ITEM_WAS_LISTED}, ${event.name === Fossil.ITEM_WAS_LISTED}`);
      if (event.name === Fossil.ITEM_WAS_LISTED) {
        logger.info(`FssilCatalog.consume ITEM WAS LISTED-- event: ${JSON.stringify(event.payload)}`);
        if (event.payload && event.payload.sellerId) {
          await this._updateAccount(event.payload.sellerId, event.aggregateId, event.payload);
        }
        if (event.payload && event.payload.buyerId) {
          await this._updateAccount(event.payload.buyerId, event.aggregateId, event.payload);
        }
      }
      if (event.name === Fossil.ITEM_WAS_UNLISTED) {
        logger.info(`FssilCatalog.consume ITEM WAS UNLISTED-- event: ${JSON.stringify(event.payload)}`);
        const item = JSON.parse(await this.client.hgetAsync(this._getPrefix(), event.payload.accountId) || 'null');
        await this._updateAccount(event.payload.accountId, event.aggregateId, null);
        if (item && item[event.aggregateId].buyerId) {
          await this._updateAccount(item[event.aggregateId].buyerId, event.aggregateId, null);
        }
      }
    } catch(error) {
      logger.error('fossilCatalog.consume: ' + error.message);
      throw error;
    }
  }
  async eventCount() {
    return await this.client.getAsync(this._getPrefix() + '.eventCounter');
  }
  async result(accountId) {
    logger.info(`FossilCatalog.result for account: ${accountId}`);
    const result = await this.client.hgetAsync(this._getPrefix(), accountId);
    return result ? JSON.parse(result) : null;
  }
  async initialiseVersion(version) {
    logger.info(`FossilCatalog.initialising version : ${version}`);
    const versions = await this.client.lrangeAsync(FossilCatalog.PROJECTION_NAME + '.versions', 0, -1);
    this.version = version;
    this.versionInitialised = true;
    logger.info(`FossilCatalog.initialiseVersion: ${JSON.stringify(versions)}, ${version in versions}`);
    if (version in versions) {
      return;
    }
    this.client.lpush(FossilCatalog.PROJECTION_NAME + '.versions', version);
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
