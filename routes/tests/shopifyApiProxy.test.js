const express = require('express');
const http = require('http');
const fetchMock = require.requireMock('node-fetch');

const shopifyApiProxy = require('routes/shopifyApiProxy');

const { DISALLOWED_URLS } = shopifyApiProxy;
const API_ROUTE = '/api';

jest.mock('node-fetch');

let session;
let server;
const originalConsoleError = console.error;
describe('shopifyApiProxy', async () => {
  beforeEach(async () => {
    fetchMock.mockImplementation(() => ({
      status: 200,
      text: () => Promise.resolve(),
    }));

    session = {
      shop: 'shop.com',
      accessToken: 'token',
    };

    server = await createServer();
    console.error = jest.fn();
  });

  afterEach(() => {
    fetchMock.mockClear();
    server.close();
    console.error = originalConsoleError;
  });

  it('errors when no session is present', async () => {
    const endpoint = '/products';
    session = null;
    const response = await require('supertest')(server).get(
      `${API_ROUTE}${endpoint}`,
    );

    expect(fetchMock).not.toBeCalled();
    expect(console.error).toBeCalledWith(
      'A session middleware must be installed to use ApiProxy.',
    );
    expect(response.status).toBe(401);
  });

  it('errors when shop information is not in session', async () => {
    const endpoint = '/products';
    session.shop = null;
    session.accessToken = null;

    const response = await require('supertest')(server).get(
      `${API_ROUTE}${endpoint}`,
    );

    expect(fetchMock).not.toBeCalled();
    expect(response.status).toBe(401);
  });

  it('proxies requests to the shop given in session', async () => {
    const shop = 'some-shop.com';
    const endpoint = '/products';
    session.shop = shop;

    const expectedPath = `https://${shop}/admin${endpoint}`;
    const response = await require('supertest')(server).get(
      `${API_ROUTE}${endpoint}`,
    );

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

    const response = await require('supertest')(server).get(`${API_ROUTE}`);

    expect(fetchMock).toBeCalled();
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject(expectedHeaders);
    expect(response.status).toBe(200);
  });

  it('does not proxy requests to dissallowed urls', async () => {
    for (const url of DISALLOWED_URLS) {
      const response = await require('supertest')(server).get(
        `${API_ROUTE}${url}`,
      );
      expect(response.status).toBe(403);
    }
  });

  it('returns body from proxied request', async () => {
    const expectedBody = 'body text';
    fetchMock.mockImplementation(() => {
      return { status: 200, text: () => Promise.resolve(expectedBody) };
    });

    const response = await require('supertest')(server).get(`${API_ROUTE}`);
    const body = await response.text;

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
    shopifyApiProxy,
  );

  server = http.createServer(app);
  server.listen(0);
  return server;
}
