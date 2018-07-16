const createWithWebhook = require('./webhooks');
const createWithAppProxy = require('./appProxy');
const withShop = require('./withShop');
const rawBody = require('./rawBody');

module.exports = function createMiddleware(shopifyConfig) {
  const withWebhook = createWithWebhook(shopifyConfig);
  const withAppProxy = createWithAppProxy(shopifyConfig);

  return {
    withShop,
    withWebhook,
    withAppProxy,
    rawBody,
  };
};
