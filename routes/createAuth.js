const PropTypes =  require('prop-types');
const express = require('express');
const querystring = require('querystring');
const crypto = require('crypto');
const fetch = require('node-fetch');

const propTypes = {
  apiKey: PropTypes.string.isRequired,
  host: PropTypes.string.isRequired,
  secret: PropTypes.string.isRequired,
  scope: PropTypes.arrayOf(PropTypes.string).isRequired,
  afterAuth: PropTypes.func.isRequired,
  shopStore: PropTypes.Object,
};

module.exports = function createShopifyAuthRouter(authConfig) {
  PropTypes.checkPropTypes(ShopifyConfigTypes, propTypes, 'option', 'ShopifyExpress');

  const config = Object.assign(
    {shopStore: new MemoryStrategy()},
    authConfig,
  );

  const {
    host,
    apiKey,
    secret,
    scope,
    afterAuth,
    shopStore,
    callbackRoute,
  } = config;

  const router = express.Router();

  // This function initializes the Shopify OAuth Process
  router.get('/', function(request, response) {
    const { query } = request;
    const { shop } = query;

    if (shop == null) {
      return response.status(400).send('Expected a shop query parameter');
    }

    const redirectTo = `https://${shop}/admin/oauth/authorize`;
    const redirectParams =
      `?client_id=${apiKey}&scope=${scope}&redirect_uri=${host}` +
      callbackRoute;

    response.send(
      `<!DOCTYPE html>
      <html>
        <head>
          <script type="text/javascript">
            window.top.location.href = "${redirectTo}${redirectParams}"
          </script>
        </head>
      </html>`,
    );
  });

  // Users are redirected here after clicking `Install`.
  // The redirect from Shopify contains the authorization_code query parameter,
  // which the app exchanges for an access token
  router.get('/callback', async (request, response) => {
    const { query } = request;
    const { code, hmac, shop } = query;

    const map = JSON.parse(JSON.stringify(query));
    delete map['signature'];
    delete map['hmac'];

    const message = querystring.stringify(map);
    const generated_hash = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    if (generated_hash !== hmac) {
      return response.status(400).send('HMAC validation failed');
    }

    if (shop == null) {
      return response.status(400).send('Expected a shop query parameter');
    }

    const requestBody = querystring.stringify({
      code,
      client_id: apiKey,
      client_secret: secret,
    });

    const remoteResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      body: requestBody,
    });

    const responseBody = await remoteResponse.json();

    const accessToken = responseBody.access_token;

    shopStore.storeShop({ accessToken, shop }, (err, token) => {
      if (err) {
        console.error('🔴 Error storing shop access token', err);
      }

      if (request.session) {
        request.session.accessToken = accessToken;
        request.session.shop = shop;
      } else {
        console.warn('Session not present on request, please install a session middleware.');
      }

      afterAuth(request, response);
    });
  });

  return router;
};
