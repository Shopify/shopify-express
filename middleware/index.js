const createWithWebhook = require('./webhooks');
const createWithShop = require('./withShop');

module.exports = function createMiddleware(shopifyConfig) {
  const withWebhook = createWithWebhook(shopifyConfig)
  const withShop = createWithShop();

  return {
    withShop,
    withWebhook,
  };
};
