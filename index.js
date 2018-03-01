const PropTypes = require('prop-types');
const createRouter = require('./routes');
const createMiddleware = require('./middleware');
const {MemoryStrategy} = require('./strategies');

const ShopifyConfigTypes = {
  apiKey: PropTypes.string.isRequired,
  host: PropTypes.string.isRequired,
  secret: PropTypes.string.isRequired,
  scope: PropTypes.arrayOf(PropTypes.string).isRequired,
  afterAuth: PropTypes.func.isRequired,
  shopStore: PropTypes.Object,
};

module.exports = function shopify(shopifyConfig) {
  PropTypes.checkPropTypes(ShopifyConfigTypes, shopifyConfig, 'option', 'ShopifyExpress');

  const config = Object.assign(
    {shopStore: new MemoryStrategy()},
    shopifyConfig,
  );

  return {
    middleware: createMiddleware(config),
    routes: createRouter(config),
  };
};
