const findFreePort = require('find-free-port')
const fetch = require('node-fetch');
const http = require('http');
const express = require('express');

const { MemoryStrategy } = require('../../strategies');
const createAuth = require('../createAuth');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`

let server;
let afterAuthSpy;
describe('createAuth', async () => {
  beforeEach(async () => {
    afterAuthSpy = jest.fn();

    server = await createServer(afterAuthSpy);
  });

  afterEach(() => {
    server.close();
  });

  describe('/', () => {
    it('responds to get requests by returning a redirect page', async () => {
      const response = await fetch(`${BASE_URL}/?shop=shop1`);
      const data = await response.text();

      expect(response.status).toBe(200);
      expect(data).toMatchSnapshot();
    });

    it('responds with a 400 when no shop query parameter is given', async () => {
      const response = await fetch(BASE_URL);
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

function createServer(afterAuth) {
  const app = express();

  app.use(
    '/',
    createAuth({
      apiKey: 'key',
      secret: 'secret',
      scope: ['scope'],
      shopStore: new MemoryStrategy(),
      afterAuth,
    }),
  );

  server = http.createServer(app);

  return new Promise((resolve, reject) => {
    findFreePort(PORT, (err, freePort) => {
      if (err) {
        throw err;
      }
      server.listen(PORT, resolve(server));
    })
  });
}
