const querystring = require('qs');
const fetch = require('node-fetch');

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
  const { query, method, path: pathname, body, session } = incomingRequest;

  if (session == null) {
    console.error('A session middleware must be installed to use ApiProxy.')
    response.status(401).send(new Error('Unauthorized'));
    return;
  }

  const { shop, accessToken } = session;

  if (shop == null || accessToken == null) {
    response.status(401).send(new Error('Unauthorized'));
    return;
  }

  if (!validRequest(pathname)) {
    response.status(403).send('Endpoint not in whitelist');
    return;
  }

  try {
    const searchParams = querystring.stringify(query);
    const searchString = searchParams.length > 0
      ? `?${searchParams}`
      : '';

    const url = `https://${shop}/admin${pathname}${searchString}`;
    const result = await fetch(url, {
      method,
      body,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    const data = await result.text();
    response.status(result.status).send(data);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
};

module.exports.DISALLOWED_URLS = DISALLOWED_URLS;

function validRequest(path) {
  const strippedPath = path.split('?')[0].split('.json')[0];

  return DISALLOWED_URLS.every(resource => {
    return strippedPath.indexOf(resource) === -1;
  });
}
