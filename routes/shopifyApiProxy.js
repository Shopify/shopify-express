const { URL } = require('url');

const DISALLOWED_URLS = [
  '/admin/application_charges',
  '/admin/application_credits',
  '/admin/carrier_services',
  '/admin/recurring_application_charges',
  '/admin/script_tags',
  '/admin/storefront_access_token',
  '/admin/webhooks',
  '/admin/oauth',
];

module.exports = function shopifyApiProxy(request, response, next) {
  const { query, method, path, body, session } = request;
  const { shop, accessToken } = session;

  if (!validRequest(path)) {
    return response.status(403).send('Endpoint not in whitelist');
  }

  const fetchOptions = {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
  };

  fetchWithParams(`https://${shop}/admin${path}`, fetchOptions, query)
    .then(remoteResponse => {
      const { status } = remoteResponse;
      return Promise.all([remoteResponse.json(), status]);
    })
    .then(([responseBody, status]) => {
      response.status(status).send(responseBody);
    })
    .catch(err => response.err(err));
};

function validRequest(path) {
  const strippedPath = path.split('?')[0].split('.json')[0];

  return DISALLOWED_URLS.every(resource => {
    return strippedPath.indexOf(resource) === -1
  });
}

function fetchWithParams(url, fetchOpts, query) {
  const parsedUrl = new URL(url);

  Object.entries(query).forEach(([key, value]) => {
    parsedUrl.searchParams.append(key, value);
  });

  return fetch(parsedUrl.href, fetchOpts);
}
