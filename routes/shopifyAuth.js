const querystring = require('querystring');
const crypto = require('crypto');
const fetch = require('node-fetch');

module.exports = function createShopifyAuthRoutes({
  host,
  apiKey,
  secret,
  scope,
  afterAuth,
  shopStore,
  accessMode,
}) {
  return {
    // This function initializes the Shopify OAuth Process
    auth(request, response) {
      const { query, baseUrl } = request;
      const { shop } = query;
      
      //Remove unnecessary /
      baseUrl = baseUrl.replace(/^\//, '');

      if (shop == null) {
        return response.status(400).send('Expected a shop query parameter');
      }

      const redirectTo = `https://${shop}/admin/oauth/authorize`;

      const redirectParams = {
        baseUrl,
        scope,
        client_id: apiKey,
        redirect_uri: `${host}${baseUrl}/callback`,
      };

      if (accessMode === 'online') {
        redirectParams['grant_options[]'] = 'per-user';
      }

      response.send(
        `<!DOCTYPE html>
        <html>
          <head>
            <script type="text/javascript">
              window.top.location.href = "${redirectTo}?${querystring.stringify(redirectParams)}"
            </script>
          </head>
        </html>`,
      );
    },

    // Users are redirected here after clicking `Install`.
    // The redirect from Shopify contains the authorization_code query parameter,
    // which the app exchanges for an access token
    async callback(request, response, next) {
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

      try {
        const {token} = await shopStore.storeShop({ accessToken, shop })

        if (request.session) {
          request.session.accessToken = accessToken;
          request.session.shop = shop;
        } else {
          console.warn('Session not present on request, please install a session middleware.');
        }

        afterAuth(request, response);
      } catch (error) {
        console.error('🔴 Error storing shop access token', error);
        next(error);
      }
    }
  };
};
