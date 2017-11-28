const Redis = require('redis');

module.exports = class RedisStrategy {
  constructor(redisConfig) {
    this.client = Redis.createClient(redisConfig);
  }

  storeShop({ shop, accessToken, data = {} }, done) {
    const shopData = Object.assign({}, { accessToken }, data);
    this.client.hmset(shop, shopData, err => {
      if (err) {
        done(err);
      }

      done(null, shopData);
    });
  }

  getShop({ shop }, done) {
    this.client.hgetall(shop, (err, shopData) => {
      if (err) {
        return done(err);
      }

      done(null, shopData);
    });
  }
};
