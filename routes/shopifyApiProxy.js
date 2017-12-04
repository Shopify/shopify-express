const { URL } = require('url');
const request = require('axios');

const DISALLOWED_URLS = [
  '/application_charges',
  '/application_credits',
  '/carrier_services',
  '/fulfillment_services',
  '/recurring_application_charges',
  '/script_tags',
  '/storefront_access_token',
  '/webhooks',
  '/oauth',
];

module.exports = async function shopifyApiProxy(incomingRequest, response, next) {
  const { query, method, path, body, session } = incomingRequest;
  const { shop, accessToken } = session;

  if (!validRequest(path)) {
    return response.status(403).send('Endpoint not in whitelist');
  }

  try {
    const { status, data } = await sendRequest({
      method,
      url: `https://${shop}/admin${path}`,
      data: body,
      params: query,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    response.status(status).send(data);
  } catch (error) {
    response.status(500).send(error);
  }
};

function validRequest(path) {
  const strippedPath = path.split('?')[0].split('.json')[0];

  return DISALLOWED_URLS.every(resource => {
    return strippedPath.indexOf(resource) === -1;
  });
}
