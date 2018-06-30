const crypto = require('crypto');
const express = require('express');
const http = require('http');

const webhooks = require('middleware/webhooks');

const SECRET = 'secret';
let server;

describe('webhooks', async () => {
  afterEach(() => server.close());

  it('passes through middleware if hmac signature is correct', async done => {
    let session = {
      shop: 'shop.com',
      accessToken: 'token',
    };

    let topic = 'shopify-express/test';
    let onVerified = (err, request) => {
      expect(err).toBeNull();
      expect(request).toHaveProperty('webhook.topic', topic);
      done();
    };

    server = await createServer({ session, onVerified });

    const body = { foo: '\\""\\bar' };
    const hash = crypto
      .createHmac('sha256', SECRET)
      .update(new Buffer(JSON.stringify(body)))
      .digest('base64');

    await require('supertest')(server)
      .post('/')
      .send(body)
      .set({
        'X-Shopify-Shop-Domain': session.shop,
        'X-Shopify-Topic': topic,
        'X-Shopify-Hmac-Sha256': hash,
      });
  });

  it('passes through middleware if hmac signature if the body is json parsed', async done => {
    let session = {
      shop: 'shop.com',
      accessToken: 'token',
    };

    let topic = 'shopify-express/test';
    let onVerified = (err, request) => {
      expect(err).toBeNull();
      expect(request).toHaveProperty('webhook.topic', topic);
      done();
    };
    let app = express();
    app.use(require('middleware/rawBody'));
    app.use(require('body-parser').json());
    server = await createServer({ session, onVerified, app });

    const body = { foo: '\\""\\bar' };
    const hash = crypto
      .createHmac('sha256', SECRET)
      .update(new Buffer(JSON.stringify(body)))
      .digest('base64');

    await require('supertest')(server)
      .post('/')
      .send(body)
      .set({
        'X-Shopify-Shop-Domain': session.shop,
        'X-Shopify-Topic': topic,
        'X-Shopify-Hmac-Sha256': hash,
      });
  });

  it('if shows an error if request already read', async done => {
    let session = {
      shop: 'shop.com',
      accessToken: 'token',
    };

    let topic = 'shopify-express/test';
    let onVerified = err => {
      expect(err).not.toBeNull();
      expect(err).toBeInstanceOf(Error);
      done();
    };
    let app = express();
    app.use(require('body-parser').json());
    server = await createServer({ session, onVerified, app });

    const body = { foo: '\\""\\bar' };
    const hash = crypto
      .createHmac('sha256', SECRET)
      .update(new Buffer(JSON.stringify(body)))
      .digest('base64');

    await require('supertest')(server)
      .post('/')
      .send(body)
      .set({
        'X-Shopify-Shop-Domain': session.shop,
        'X-Shopify-Topic': topic,
        'X-Shopify-Hmac-Sha256': hash,
      });
  });
});

function createServer({ session, onVerified, app = express() }) {
  const MemoryStrategy = require('strategies/MemoryStrategy');
  let shopStore = new MemoryStrategy();
  shopStore.storeShop(session);
  let handler = webhooks({ secret: SECRET, shopStore });

  app.use((req, _, next) => {
    req.session = session;
    next();
  }, handler(onVerified));

  server = http.createServer(app);
  server.listen(0);
  return server;
}
