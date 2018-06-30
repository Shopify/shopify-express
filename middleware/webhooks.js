const crypto = require('crypto');
const getRawBody = require('raw-body');

module.exports = function configureWithWebhook({ secret, shopStore }) {
  return function createWebhookHandler(onVerified) {
    return async function withWebhook(request, response) {
      const hmac = request.get('X-Shopify-Hmac-Sha256');
      const topic = request.get('X-Shopify-Topic');
      const shopDomain = request.get('X-Shopify-Shop-Domain');

      try {
        let rawBody = null;
        if (request.readable) {
          rawBody = await getRawBody(request);
        } else {
          if (!request.rawBody) {
            throw new Error(
              `Some body parser already read request stream. Please prepend before the parser \`app.use(shopifyExpress.middleware.rawBody)\``,
            );
          }
          rawBody = request.rawBody;
        }
        const generated_hash = crypto
          .createHmac('sha256', secret)
          .update(rawBody)
          .digest('base64');

        if (generated_hash !== hmac) {
          response.status(401).send();
          onVerified(new Error('Unable to verify request HMAC'));
          return;
        }

        const { accessToken } = await shopStore.getShop({ shop: shopDomain });
        request.body = rawBody.toString('utf8');
        request.webhook = { topic, shopDomain, accessToken };

        response.status(200).send();

        onVerified(null, request);
      } catch (error) {
        response.status(401).send();
        onVerified(error);
        return;
      }
    };
  };
};
