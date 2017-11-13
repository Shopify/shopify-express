const crypto = require('crypto');

module.exports = function createWithWebhook({ secret, shopStore }) {
  return function withWebhook(request, response, next) {
    const { body: data } = request;
    const hmac = request.get('X-Shopify-Hmac-Sha256');
    const topic = request.get('X-Shopify-Topic');
    const shopDomain = request.get('X-Shopify-Shop-Domain');

    // Shopify escapes forward slashes 
    // + replaces '&' with \u0026 when the HMAC is built
    // so we need to do the same otherwise the validation will fail
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
