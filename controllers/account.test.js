const {createAccount} = require('./account');

describe('account', () => {
  it('Returns a 200 [Happy path]', async () => {
    // GIVEN
    const params = {
      body: JSON.stringify({
        email: 'email@example.com',
      }),
    };
    // WHEN
    const actual = await createAccount(params);
    // THEN
    expect(actual.statusCode).toBe(200);
  });
  it('Returns a 400 when body is not valid[Sad path]', async () => {
    // GIVEN
    const params = {
      body: JSON.stringify({}),
    };
    // WHEN
    const actual = await createAccount(params);
    // THEN
    expect(actual.statusCode).toBe(400);
  });
});
