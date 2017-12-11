const express = require('express');
const http = require('http');
const fetch = require.requireActual('node-fetch');
const fetchMock = require.requireMock('node-fetch');

const shopifyApiProxy = require('../shopifyApiProxy');

const { DISALLOWED_URLS } = shopifyApiProxy;
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const API_ROUTE = '/api';

jest.mock('node-fetch');

let session;
let server;
describe('shopifyApiProxy', async () => {
  beforeEach(async () => {
    fetchMock.mockImplementation(() => ({ status: 200, text: () => Promise.resolve() }));

    session = {
      shop: 'shop.com',
      accessToken: 'token',
    };

    server = await createServer();
  });

  afterEach(() => {
    fetchMock.mockClear();
    server.close();
  });

  it('proxies requests to the shop given in session', async () => {
    const shop = 'some-shop.com';
    const endpoint = '/products';
    session.shop = shop;

    const expectedPath = `https://${shop}/admin${endpoint}`;
    const response = await fetch(`${BASE_URL}${API_ROUTE}${endpoint}`);

    expect(fetchMock).toBeCalled();
    expect(fetchMock.mock.calls[0][0]).toBe(expectedPath);
    expect(response.status).toBe(200);
  });

  it('includes the access token given in session and json content type', async () => {
    const accessToken = 'foo-token';
    session.accessToken = accessToken;

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    };
    const expectedPath = `https://${session.shop}/admin/`;

    const response = await fetch(`${BASE_URL}${API_ROUTE}`);

    expect(fetchMock).toBeCalled();
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject(expectedHeaders);
    expect(response.status).toBe(200);
  });

  it('does not proxy requests to dissallowed urls', async () => {
    for(const url of DISALLOWED_URLS) {
      response = await fetch(`${BASE_URL}${API_ROUTE}${url}`);
      expect(response.status).toBe(403);
    }
  });

  it('returns body from proxied request', async () => {
    const expectedBody = 'body text';
    fetchMock.mockImplementation(() => {
      return {status: 200, text: () => Promise.resolve(expectedBody)};
    });

    const response = await fetch(`${BASE_URL}${API_ROUTE}`);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe(expectedBody);
  });
});

function createServer() {
  const app = express();

  app.use(
    API_ROUTE,
    (req, _, next) => {
      req.session = session;
      next();
    },
    shopifyApiProxy
  );

  server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(3000, resolve(server));
  });
}
