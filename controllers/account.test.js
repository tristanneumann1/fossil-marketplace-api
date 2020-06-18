const {createAccount} = require('./account');

describe('account', () => {
  describe('Create Account', () => {
    it('Returns a 200 [Happy path]', async () => {
      // GIVEN
      const params = {
        headers: {
          userToken: 'account-user-token',
        },
      };
      // WHEN
      const actual = await createAccount(params);
      // THEN
      expect(actual.statusCode).toBe(200);
    });
    it('Returns a 400 when body is not valid[Sad path]', async () => {
      // GIVEN
      const params = {};
      // WHEN
      const actual = await createAccount(params);
      // THEN
      expect(actual.statusCode).toBe(400);
    });
  });
});
