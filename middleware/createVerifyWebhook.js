const crypto = require('crypto');
const getRawBody = require('raw-body');

const propTypes = {
  secret: PropTypes.string.isRequired,
  shopStore: PropTypes.Object,
};

module.exports = function createVerifyWebhook({ secret, shopStore }) {
  PropTypes.checkPropTypes(ShopifyConfigTypes, propTypes, 'option', 'ShopifyExpress');

  return function createWrappedFunction(onVerified) {
    return async function webhookHandler(request, response) {
      const { body: data } = request;
      const hmac = request.get('X-Shopify-Hmac-Sha256');
      const topic = request.get('X-Shopify-Topic');
      const shopDomain = request.get('X-Shopify-Shop-Domain');

      try {
        const rawBody = await getRawBody(request);
        const generated_hash = crypto
          .createHmac('sha256', secret)
          .update(rawBody)
          .digest('base64');

        if (generated_hash !== hmac) {
          response.status(401).send();
          onVerified(new Error("Unable to verify request HMAC"));
          return;
        }

        shopStore.getShop({ shop: shopDomain }, (error, { accessToken }) => {
          if (error) {
            response.status(401).send();
            onVerified(new Error("Couldn't fetch credentials for shop"));
            return;
          }

          request.body = rawBody.toString('utf8');
          request.webhook = { topic, shopDomain, accessToken };

          response.status(200).send();

          onVerified(null, request);
        });
      } catch(error) {
        response.send(error);
      }
    };
  }
};
