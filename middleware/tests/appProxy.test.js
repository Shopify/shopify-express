const express = require('express');
const http = require('http');

const appProxy = require('middleware/appProxy');

const SECRET = 'hush';
let server;

describe('appProxy', async () => {
  afterEach(() => server.close());

  it('passes through middleware if hmac query signature is correct', async done => {
    let session = {
      shop: 'shop.com',
      accessToken: 'token',
    };

    let onVerified = err => {
      expect(err).toBeNull();
      done();
    };

    server = await createServer({ session, onVerified });

    await require('supertest')(server).get(
      '/?extra=1&extra=2&shop=shop-name.myshopify.com&path_prefix=%2Fapps%2Fawesome_reviews&timestamp=1317327555&signature=a9718877bea71c2484f91608a7eaea1532bdf71f5c56825065fa4ccabe549ef3',
    );
  });

  it('does not pass through middleware if hmac query signature is not correct', async done => {
    let session = {
      shop: 'shop.com',
      accessToken: 'token',
    };

    let onVerified = err => {
      expect(err).not.toBeNull();
      expect(err).toBeInstanceOf(Error);
      done();
    };

    server = await createServer({ session, onVerified });
    const invalidSignature =
      'b9718877bea71c2484f91608a7eaea1532bdf71f5c56825065fa4ccabe549ef3';
    await require('supertest')(server).get(
      `/?extra=1&extra=2&shop=shop-name.myshopify.com&path_prefix=%2Fapps%2Fawesome_reviews&timestamp=1317327555&signature=${invalidSignature}`,
    );
  });

  it('does not pass through middleware if hmac query signature is empty', async done => {
    let session = {
      shop: 'shop.com',
      accessToken: 'token',
    };

    let onVerified = err => {
      expect(err).not.toBeNull();
      expect(err).toBeInstanceOf(Error);
      done();
    };

    server = await createServer({ session, onVerified });
    await require('supertest')(server).get(
      `/?extra=1&extra=2&shop=shop-name.myshopify.com&path_prefix=%2Fapps%2Fawesome_reviews&timestamp=1317327555`,
    );
  });
});

function createServer({ session, onVerified, app = express() }) {
  const MemoryStrategy = require('strategies/MemoryStrategy');
  let shopStore = new MemoryStrategy();
  shopStore.storeShop(session);
  let handler = appProxy({ secret: SECRET, shopStore });

  app.use((req, _, next) => {
    req.session = session;
    next();
  }, handler(onVerified));

  server = http.createServer(app);
  server.listen(0);
  return server;
}
