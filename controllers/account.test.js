const {createAccount, listItem} = require('./account');

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
  describe('List an Item', () => {
    beforeEach(() => {
      localStorage.setItem('useLocalStorage', true);
      localStorage.setItem('db', '[]');
    });
    afterEach(() => {
      localStorage.clear();
    });
    it('Returns a 200 [Happy path]', async () => {
      // GIVEN
      const headers = {
        userToken: 'account-user-token',
      };
      const body = JSON.stringify({
        itemId: 'item-id',
      });
      await createAccount({headers});
      // WHEN
      const actual = await listItem({headers, body});
      // THEN
      expect(actual.statusCode).toBe(200);
    });
    it('Returns a 400 when params are invalid[Sad path]', async () => {
      // GIVEN
      const headers = {
        userToken: 'account-user-token',
      };
      const body = JSON.stringify({
        itemId: 'item-id',
      });
      await createAccount({headers});
      // WHEN
      const missingItemId = await listItem({headers, body: '{}'});
      const missingUserToken = await listItem({headers: {}, body});
      // THEN
      expect(missingItemId.statusCode).toBe(400);
      expect(missingUserToken.statusCode).toBe(400);
    });
  });
});
