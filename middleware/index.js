const createWithWebhook = require('./webhooks');
const withShop = require('./withShop');

module.exports = function createMiddleware(shopifyConfig) {
  const withWebhook = createWithWebhook(shopifyConfig);

  return {
    withShop,
    withWebhook,
  };
};
