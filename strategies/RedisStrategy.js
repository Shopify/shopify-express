const util = require('util');
const redis = require('redis');

module.exports = class RedisStrategy {
  constructor(redisConfig) {
    const client = redis.createClient(redisConfig);

    this.client = {
      hgetall: util.promisify(client.hgetall).bind(client),
      hmset: util.promisify(client.hmset).bind(client),
    }
  }

  async storeShop({ shop, accessToken }) {
    await this.client.hmset(shop, {accessToken})

    return {accessToken};
  }

  async getShop({ shop }) {
    return await this.client.hgetall(shop) || {};
  }
};
