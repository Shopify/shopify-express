const proxy = require('express-http-proxy');

const PROXY_BASE_PATH = '/graphql';
const GRAPHQL_PATH = '/admin/api/graphql.json';

module.exports = function shopifyGraphQLProxy() {
  return function shopifyGraphQLProxyMiddleware(req, res, next) {
    const { session: { shop, accessToken } } = req;

    if (req.path !== PROXY_BASE_PATH || req.method !== 'POST') {
      return next();
    }

    if (accessToken == null || shop == null) {
      return res.status(403).send('Unauthorized');
    }

    proxy(shop, {
      https: true,
      parseReqBody: false,
      proxyReqOptDecorator(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['content-type'] = 'application/json';
        proxyReqOpts.headers['x-shopify-access-token'] = accessToken;
        return proxyReqOpts;
      },
      proxyReqPathResolver(req) {
        return GRAPHQL_PATH;
      }
    })(req, res, next);
  }
};

module.exports.PROXY_BASE_PATH = PROXY_BASE_PATH;
module.exports.GRAPHQL_PATH = GRAPHQL_PATH;
