module.exports = function withShop({ authBaseUrl } = {}) {
  return function verifyRequest(request, response, next) {
    const { query = {}, session = {}, baseUrl } = request;
    const { accessToken } = session;
    const shop = getShopFromReferrer(request.get('referer')) || query.shop;

    if (accessToken && session.shop === shop) {
      next();
      return;
    }

    if (shop) {
      response.redirect(`${authBaseUrl || baseUrl}/auth/shopify?shop=${shop}`);
      return;
    }

    response.redirect('/install');
  };

  function getShopFromReferrer(referrer) {
    if (!referrer) {
      return;
    }
    const result = referrer.match(/shop=([^&]+)/);
    return result && result[1];
  }
};
