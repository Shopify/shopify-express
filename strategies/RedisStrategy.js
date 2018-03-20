const Redis = require('handy-redis');

module.exports = class RedisStrategy {
  constructor(redisConfig) {
    this.client = Redis.createClient(redisConfig);
  }

  async storeShop({ shop, accessToken }) {
    await this.client.hmset(shop, {accessToken})

    return {accessToken};
  }

<<<<<<< HEAD
  getShop({ shop }, done) {
    this.client.hgetall(shop, (err, shopData) => {
      if (err) {
        return done(err);
      }

      if (shopData) {
        done(null, shopData);
      } else {
        done(null, {});
      }
    });
=======
  async getShop({ shop }) {
    return await this.client.hgetall(shop) || {};
>>>>>>> 🎨 refactor strategies to use promises
  }
};
