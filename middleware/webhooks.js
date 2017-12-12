const crypto = require('crypto');

module.exports = function createWithWebhook({ secret, shopStore }) {
  return function withWebhook(request, response, next) {
    const { body: data } = request;
    const hmac = request.get('X-Shopify-Hmac-Sha256');
    const topic = request.get('X-Shopify-Topic');
    const shopDomain = request.get('X-Shopify-Shop-Domain');

    const generated_hash = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64');

    if (generated_hash !== hmac) {
      return response.status(401).send("Request doesn't pass HMAC validation");
    }

    shopStore.getShop({ shop: shopDomain }, (error, { accessToken }) => {
      if (error) {
        next(error);
      }

      request.webhook = { topic, shopDomain, accessToken };

      next();
    });
  };
};
