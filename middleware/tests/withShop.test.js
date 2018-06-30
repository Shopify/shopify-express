const express = require('express');
const http = require('http');

const withShop = require('middleware/withShop');

let server;

describe('withShop', async () => {
  afterEach(() => server.close());

  it('redirects to default /install path', async () => {
    let session = {};
    server = await createServer({
      session,
      params: { authBaseUrl: '/shopify' },
    });
    let response = await require('supertest')(server).get('/');
    expect(response).toHaveProperty('headers.location', '/install');
  });

  it('redirects to default param install path', async () => {
    let session = {};
    let redirect = '/redirect/install';
    server = await createServer({
      session,
      params: { authBaseUrl: '/shopify', redirect },
    });
    let response = await require('supertest')(server).get('/');
    expect(response).toHaveProperty('headers.location', redirect);
  });

  it('saves return url to session', async () => {
    let session = {};
    server = await createServer({
      session,
      params: { authBaseUrl: '/shopify' },
    });
    let returnUrl = '/return-url';
    await require('supertest')(server).get(returnUrl);
    expect(session).toHaveProperty('returnUrl', returnUrl);
  });
});

function createServer({ session, params, app = express() }) {
  app.use((req, _, next) => {
    req.session = session;
    next();
  }, withShop(params));

  server = http.createServer(app);
  server.listen(0);
  return server;
}
