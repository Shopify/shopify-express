const createRouter = require('./routes');
const createMiddleware = require('./middleware');
const {MemoryStrategy} = require('./strategies');

module.exports = function shopify(shopifyConfig = {shopStore: new MemoryStrategy()}) {
  return {
    middleware: createMiddleware(shopifyConfig),
    routes: createRouter(shopifyConfig),
  };
};
