const createRouter = require('./routes');
const createMiddleware = require('./middleware');
const {MemoryStrategy} = require('./strategies');

module.exports = function shopify(shopifyConfig) {
  const config = Object.assign(
    {shopStore: new MemoryStrategy()},
    shopifyConfig,
  );

  return {
    middleware: createMiddleware(config),
    routes: createRouter(config),
  };
};
