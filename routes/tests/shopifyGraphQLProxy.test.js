const request = require('supertest');
const express = require('express');
const nock = require('nock');
const expressShopifyGraphqlProxy = require('../shopifyGraphQLProxy');

describe('shopifyGraphQLProxy', () => {
  const app = express();
  app.use(function(req, res, next) { req.session = {}; next(); });
  app.use(expressShopifyGraphqlProxy());

  it('bails and calls next middleware if request method is not POST', (done) => {
    request(app)
      .get('/graphql')
      .expect(404)
      .expect(/Cannot GET \/graphql/, done);
  });

  it('bails and calls next middleware if request path is not /graphql', (done) => {
    request(app)
      .post('/not/graphql')
      .expect(404)
      .expect(/Cannot POST \/not\/graphql/, done);
  });

  it('responds 403 unauthorized when no session is provided', (done) => {
    request(app)
      .post('/graphql')
      .expect(403)
      .expect('Unauthorized', done);
  });

  it('proxies request to the current logged in shop found in session', (done) => {
    const app = express();

    app.use(function(req, res, next) {
      req.session = {
        shop: 'testshop.myshopify.com',
        accessToken: 'token'
      };
      next();
    });

    app.use(expressShopifyGraphqlProxy());

    const graphqlAdminAPI = nock('https://testshop.myshopify.com')
      .post('/admin/api/graphql.json')
      .reply(200, {
        data: {
          shop: {
            name: 'Test Shop'
          }
        },
        extensions: {
          cost: {
            requestedQueryCost: 1,
            actualQueryCost: 1,
            throttleStatus: {
              maximumAvailable: 1000.0,
              currentlyAvailable:999,
              restoreRate:50.0
            }
          }
        }
      }, {
        'x-shopid': '12345678'
      });

    request(app)
      .post('/graphql')
      .send(JSON.stringify({ query: '{ shop { name } }' }))
      .end(function(err, res) {
        expect(res.statusCode).toEqual(200);
        expect(res.header['x-shopid']).toEqual('12345678');
        expect(res.body.data.shop.name).toEqual('Test Shop');
        done();
      });
  });
});
