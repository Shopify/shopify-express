module.exports = function withShop({ authBaseUrl } = {}) {
  return function verifyRequest(request, response, next) {
    const { session, baseUrl } = request;
    let shop = request.query.shop;

    if (!shop && request.get('referer')) {
      const result = request.get('referer').match(/shop=([^&]+)/);
      if (result) {
        shop = result[1];
      }
    }

    if (session && session.accessToken && session.shop && session.shop === shop) {
      next();
      return;
    }

    if (shop) {
      response.redirect(`${authBaseUrl || baseUrl}/auth?shop=${shop}`);
      return;
    }

    response.redirect('/install');
    return;
  };
};
