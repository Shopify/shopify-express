const express = require('express');

const createWithShop = require('../middleware/withShop');
const createShopifyAuthRouter = require('./shopifyAuth');
const shopifyApiProxy = require('./shopifyApiProxy');

module.exports = function createRouter(shopifyConfig) {
  const router = express.Router();

  router.use('/auth/shopify', createShopifyAuthRouter(shopifyConfig));
  router.use('/api', createWithShop({ redirect: false }), shopifyApiProxy);

  return router;
}
