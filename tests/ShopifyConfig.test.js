const shopifyExpress = require('../index');

describe('ShopifyConfig', async () => {
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('logs errors when given empty object', () => {
    shopifyExpress({});
    expect(console.error).toBeCalled();
    expect(console.error.mock.calls).toMatchSnapshot();
  });

  it('logs errors when given bad props', () => {
    shopifyExpress({
      apiKey: 32,
      host: { notGood: true },
      secret: true,
      scope: 'orders',
      afterAuth: true,
      accessMode: 'gerblable',
    });
    expect(console.error).toBeCalled();
    expect(console.error.mock.calls).toMatchSnapshot();
  });

  it('does not log errors when given valid proptypes', () => {
    shopifyExpress({
      apiKey: 'fake',
      host: 'fake',
      secret: 'cats',
      scope: [],
      afterAuth: () => null,
    });
    expect(console.error).not.toBeCalled();
  });
});
