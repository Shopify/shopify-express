const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const createShopifyAuthRoutes = require('./shopifyAuth');
const shopifyApiProxy = require('./shopifyApiProxy');
const shopifyGraphQLProxy = require('./shopifyGraphQLProxy');

module.exports = function createRouter(shopifyConfig) {
  const router = express.Router();
  const rawParser = bodyParser.raw({ type: '*/*' });
  const simpleCookieParser = cookieParser();
  const {auth, callback, enableCookies} = createShopifyAuthRoutes(shopifyConfig)

  router.use('/auth/callback', callback);
  router.use('/auth/enable_cookies', enableCookies);
  router.use('/auth', simpleCookieParser, auth);
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
