const request = require('supertest');
const http = require('http');
const express = require('express');

const { MemoryStrategy } = require('../../strategies');
const createShopifyAuthRouter = require('../shopifyAuth');

let server;
describe('shopifyAuth', async () => {
  afterEach(() => {
    server.close();
  });

  describe('/', () => {
    it('responds to get requests by returning a redirect page', async () => {
      const { app, server } = await createServer();
      const { status, text } = await request(app)
        .get('/?shop=shop1')
        .then(resp => resp);

      expect(status).toBe(200);
      expect(text).toMatchSnapshot();

      server.close();
    });

    it('responds with a 400 when no shop query parameter is given', async () => {
      const { app, server } = await createServer();
      const { status, text } = await request(app)
        .get('/')
        .then(resp => resp);

      expect(status).toBe(400);
      expect(text).toMatchSnapshot();

      server.close();
    });
  });
});

function createServer({ afterAuth = jest.fn() } = {}) {
  const app = express();

  app.use(
    '/',
    createShopifyAuthRouter({
      apiKey: 'key',
      secret: 'secret',
      scope: ['scope'],
      shopStore: new MemoryStrategy(),
      afterAuth,
    }),
  );

  server = http.createServer(app);

  return new Promise((resolve, reject) => {
    const results = {
      server,
      app,
      afterAuth,
    };
    server.listen(3000, resolve(results));
  });
}
