const Knex = require('knex');

const defaultConfig = {
  dialect: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './db.sqlite3',
  },
};

module.exports = class SQLStrategy {
  constructor(config = defaultConfig) {
    this.knex = Knex(config);
  }

  initialize() {
    return this.knex.schema
      .createTableIfNotExists('shops', table => {
        table.increments('id');
        table.string('shopify_domain');
        table.string('access_token');
        table.unique('shopify_domain');
      })
      .catch(error => {
        console.log(error);
      });
  }

  storeShop({ shop, accessToken, data = {} }, done) {
    this.knex
      .raw(
        `INSERT OR IGNORE INTO shops (shopify_domain, access_token) VALUES ('${shop}', '${accessToken}')`
      )
      .then(result => {
        return done(null, accessToken);
      });
  }

  getShop({ shop }, done) {
    this.knex('shops')
      .where('shopify_domain', shop)
      .then(result => {
        return done(null, result);
      });
  }
};
