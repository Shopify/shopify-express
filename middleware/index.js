const createWithWebhook = require('./webhooks');
const withShop = require('./withShop');
const rawBody = require('./rawBody');

module.exports = function createMiddleware(shopifyConfig) {
  const withWebhook = createWithWebhook(shopifyConfig);

  return {
    withShop,
    withWebhook,
    rawBody,
  };
};
