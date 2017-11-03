# shopify-express-app

A small set of abstractions that will help you quickly build an Express.js app that consumes the Shopify API.

## Architecture

The main abstractions are `shopifyRouter`, `withShop`, and `withWebhook`.

* `shopifyRouter` provides mountable routes for authentication and API proxying. The authentication endpoint also handles shop session storage using a configurable storage strategy (defaults to SQLite).
* `withShop` is an express middleware that validates the presence of your shop session.
* `withWebhook` is an express middleware that validates the the presence of a valid HMAC signature

## Example app

You can look at [shopify-node-app](https://github.com/shopify/shopify-node-app) for a complete working example.
