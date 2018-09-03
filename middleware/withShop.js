const TEST_COOKIE_NAME = 'shopifyTestCookie';

module.exports = function withShop({ authBaseUrl } = {}) {
  return function verifyRequest(request, response, next) {
    const { query: { shop }, session, baseUrl } = request;

    if (session && session.accessToken) {
      next();
      return;
    }

    response.cookie(TEST_COOKIE_NAME, '1');

    if (shop) {
      response.redirect(`${authBaseUrl || baseUrl}/auth?shop=${shop}`);
      return;
    }

    response.redirect('/install');
    return;
  };
};
