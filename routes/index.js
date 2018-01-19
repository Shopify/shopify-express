const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const assert = require('assert');

const createWithShop = require('../middleware/withShop');
const createShopifyAuthRouter = require('./shopifyAuth');
const shopifyApiProxy = require('./shopifyApiProxy');

module.exports = function createRouter(shopifyConfig) {
  const { sessionConfig = {}, secret } = shopifyConfig;
  const router = express.Router();
  const rawParser = bodyParser.raw({ type: '*/*' });

  assert.ok(secret, "Expected config to have secret key");
  assert.ok(shopifyConfig.apiKey, "Expected config to have API key");
  assert.ok(shopifyConfig.host, "Expected config to have host");
  assert.ok(shopifyConfig.scope, "Expected config to have scope");
  assert(shopifyConfig.scope.length > 0, "Expected config to have scope");

  const defaultSessionConfig = {
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
  };

  router.use(expressSession(Object.assign({}, defaultSessionConfig, sessionConfig)));

  router.use('/auth/shopify', createShopifyAuthRouter(shopifyConfig));
  router.use(
    '/api',
    rawParser,
    createWithShop({ redirect: false }),
    shopifyApiProxy,
  );

  return router;
};
