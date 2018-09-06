const {TEST_COOKIE_NAME, TOP_LEVEL_OAUTH_COOKIE_NAME} = require('../constants');

module.exports = function withShop({ authBaseUrl, fallbackUrl } = {}) {
  return function verifyRequest(request, response, next) {
    const { query: { shop }, session, baseUrl } = request;

    if (session && session.accessToken) {
      response.cookie(TOP_LEVEL_OAUTH_COOKIE_NAME);
      next();
      return;
    }

    response.cookie(TEST_COOKIE_NAME, '1');

    if (shop) {
      response.redirect(`${authBaseUrl || baseUrl}/auth?shop=${shop}`);
      return;
    }

    response.redirect(fallbackUrl || '/install');
    return;
  };
};
