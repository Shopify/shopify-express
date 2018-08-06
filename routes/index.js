const express = require('express');
const bodyParser = require('body-parser');

const createShopifyAuthRoutes = require('./shopifyAuth');
const shopifyApiProxy = require('./shopifyApiProxy');
const shopifyGraphQLProxy = require('./shopifyGraphQLProxy');

module.exports = function createRouter(shopifyConfig) {
  const router = express.Router();
  const rawParser = bodyParser.raw({ type: '*/*' });
  const {auth, callback} = createShopifyAuthRoutes(shopifyConfig)

  router.use('/auth/callback', callback);
  router.use('/auth', auth);
  router.use(
    '/api',
    rawParser,
    verifyApiCall,
    shopifyApiProxy,
  );
  router.use(shopifyGraphQLProxy());

  return router;
};

function verifyApiCall(request, response, next) {
  const {session} = request;

  if (session && session.accessToken) {
    next();
    return;
  }

  response.status(401).send();
  return;
}
