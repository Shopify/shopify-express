module.exports = class MemoryStrategy {
  constructor() {
    this.store = {};
  }

  async storeShop({ shop, accessToken }) {
    this.store[shop] = {accessToken};

    return {accessToken};
  }

  async getShop({ shop }) {
    return this.store[shop];
  }
};
