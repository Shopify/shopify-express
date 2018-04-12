const findFreePort = require('find-free-port');
const fetch = require('node-fetch');
const http = require('http');
const express = require('express');

const { MemoryStrategy } = require('../../strategies');
const createShopifyAuthRoutes = require('../shopifyAuth');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

let server;
let afterAuth;
describe('shopifyAuth', async () => {
  beforeEach(async () => {
    afterAuth = jest.fn();
    server = await createServer({ afterAuth });
  });

  afterEach(() => {
    server.close();
  });

  describe('/', () => {
    it('responds to get requests by returning a redirect page', async () => {
      const response = await fetch(`${BASE_URL}/auth?shop=shop1`);
      const data = await response.text();

      expect(response.status).toBe(200);
      expect(data).toMatchSnapshot();
    });

    it('redirect page includes per-user grant for accessMode: online', async () => {
      await server.close();
      server = await createServer({ accessMode: 'online' });

      const response = await fetch(`${BASE_URL}/auth?shop=shop1`);
      const data = await response.text();

      expect(response.status).toBe(200);
      expect(data).toContain('grant_options%5B%5D=per-user');
    });

    it('responds with a 400 when no shop query parameter is given', async () => {
      const response = await fetch(`${BASE_URL}/auth`);
      const data = await response.text();

      expect(response.status).toBe(400);
      expect(data).toMatchSnapshot();
    });
  });

  describe('/callback', () => {
    it('errors when hmac validation fails', () => {
      pending();
    });

    it('does not error when hmac validation succeds', () => {
      pending();
    });

    it('requests access token', () => {
      pending();
    });

    it('console warns when no session is present on request context', () => {
      pending();
    });
  });
});

function createServer(userConfig = {}) {
  const app = express();

  const serverConfig = {
    host: 'http://myshop.myshopify.com',
    apiKey: 'key',
    secret: 'secret',
    scope: ['scope'],
    shopStore: new MemoryStrategy(),
    accessMode: 'offline',
    afterAuth: jest.fn(),
  };

  const { auth, callback } = createShopifyAuthRoutes(
    Object.assign({}, serverConfig, userConfig),
  );

  app.use('/auth', auth);
  app.use('/auth/callback', callback);
  server = http.createServer(app);

  return new Promise((resolve, reject) => {
    findFreePort(PORT, (err, freePort) => {
      if (err) {
        throw err;
      }
      server.listen(PORT, resolve(server));
    });
  });
}
