const crypto = require('crypto');

module.exports = function configureWithAppProxy({ secret }) {
  return function appProxyHandler(onVerified) {
    return async function withWebhook(request, response) {
      const { signature } = request.query;
      const query = Object.assign({}, request.query);
      delete query.signature;
      let message = Object.keys(query)
        .map(i => `${i}=${query[i]}`)
        .sort()
        .join('');
      const generatedHash = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');

      let hashEquals = false;
      try {
        hashEquals = crypto.timingSafeEqual(
          Buffer.from(generatedHash),
          Buffer.from(signature),
        );
      } catch (e) {
        hashEquals = false;
      } finally {
        if (hashEquals) return onVerified(null, request);
      }

      response.status(401).send();
      onVerified(new Error('Unable to verify request query'));
      return;
    };
  };
};
