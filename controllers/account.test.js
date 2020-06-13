const {createAccount} = require('./account');

describe('account', () => {
  it('Returns a 200 [Happy path]', async () => {
    // GIVEN
    const params = {
      body: {
        email: 'email@example.com',
      },
    };
    // WHEN
    const actual = await createAccount(params);
    // THEN
    expect(actual.statusCode).toBe(200);
  });
});
