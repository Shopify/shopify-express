module.exports = function withShop({
  authBaseUrl,
  redirect = '/install',
} = {}) {
  return function verifyRequest(request, response, next) {
    const {
      query: { shop },
      session,
      baseUrl,
    } = request;

    if (session && session.accessToken) {
      next();
      return;
    }

    if (session) session.returnUrl = request.url;

    if (shop) {
      response.redirect(`${authBaseUrl || baseUrl}/auth?shop=${shop}`);
      return;
    }

    response.redirect(redirect);
    return;
  };
};
