const crypto = require('crypto');

module.exports = function createWithWebhook({ secret, shopStore }) {
  return function withWebhook(request, response, next) {
    const { body: data } = request;
    const hmac = request.get('X-Shopify-Hmac-Sha256');
    const topic = request.get('X-Shopify-Topic');
    const shopDomain = request.get('X-Shopify-Shop-Domain');

    // Shopify seems to be escaping forward slashes when the build the HMAC
    // so we need to do the same otherwise it will fail validation
    // Shopify also seems to replace '&' with \u0026 ...
    let message = JSON.stringify(data)
    message = message.split('/').join('\\/');
    message = message.split('&').join('\\u0026');

    const generated_hash = crypto
      .createHmac('sha256', secret)
      .update(message)
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
