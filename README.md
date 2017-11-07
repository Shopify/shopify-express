# shopify-express

A small set of abstractions that will help you quickly build an Express.js app that consumes the Shopify API.

## Example

```javascript
const express = require('express');
const shopifyExpress = require('@shopify/shopify-express');

const app = express();

const {
  SHOPIFY_APP_KEY,
  SHOPIFY_APP_HOST,
  SHOPIFY_APP_SECRET,
  NODE_ENV,
} = process.env;

const shopify = shopifyExpress({
  host: SHOPIFY_APP_HOST,
  apiKey: SHOPIFY_APP_KEY,
  secret: SHOPIFY_APP_SECRET,
  scope: ['write_orders, write_products'],
  afterAuth(request, response) {
    const { session: { accessToken, shop } } = request;
    // install webhooks or hook into your own app here
    return response.redirect('/');
  },
});

// mounts '/auth/shopify' and '/api' off of '/'
app.use('/', shopify.routes);
```

## Shopify routes

```javascript
  const {routes} = shopifyExpress(config);
  app.use('/', routes);
```

Provides mountable routes for authentication and API proxying. The authentication endpoint also handles shop session storage using a configurable storage strategy (defaults to SQLite).

### `/auth/shopify`

Serves a login endpoint so merchants can access your app with a shop session.

### `/api`

Proxies requests to the api for the currently logged in shop. Useful to securely use api
endpoints from a client application without having to worry about CORS.

## Helper middleware

`const {middleware: {withShop, withWebhook}} = shopifyExpress(config);`

### `withShop`

`app.use('/someProtectedPath', withShop, someHandler);`

Express middleware that validates the presence of your shop session.

### `withWebhook`

`app.use('/someProtectedPath', withWebhook, someHandler);`

Express middleware that validates the the presence of a valid HMAC signature to allow webhook requests from shopify to your app.

## Example app

You can look at [shopify-node-app](https://github.com/shopify/shopify-node-app) for a complete working example.
