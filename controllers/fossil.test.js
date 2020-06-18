const {desireItem, listItem, unlistItem} = require('./fossil');
const {createAccount} = require('./account');
const {dbWithAccountAndItem} = require('../test/dbFixtures');

describe('List an Item', () => {
  beforeEach(() => {
    localStorage.setItem('useLocalStorage', true);
    localStorage.setItem('db', '[]');
  });
  afterEach(() => {
    localStorage.clear();
  });
  describe('List Item', () => {
    it('Returns a 200 [Happy path]', async () => {
      // GIVEN
      const headers = {
        userToken: 'account-user-token',
      };
      const body = JSON.stringify({
        fossilId: 'fossil-id',
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
        fossilId: 'fossil-id',
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
  describe('Unlist Item', () => {
    it('Returns a 200 [Happy path]', async () => {
      // GIVEN
      const accountId = 'account-user-token';
      const fossilId = 'fossil-id';
      const itemId = 'item-id';
      localStorage.setItem('db', dbWithAccountAndItem(accountId, fossilId, itemId));

      const headers = {
        userToken: accountId,
      };
      const body = JSON.stringify({
        itemId,
        fossilId,
      });
      // WHEN
      const actual = await unlistItem({headers, body});
      // THEN
      expect(actual.statusCode).toBe(200);
    });
    it('Returns a 400 when params are invalid[Sad path]', async () => {
      // GIVEN
      const accountId = 'account-user-token';
      const fossilId = 'fossil-id';
      const itemId = 'item-id';
      localStorage.setItem('db', dbWithAccountAndItem(accountId, fossilId, itemId));

      const headers = {
        userToken: accountId,
      };
      const body = JSON.stringify({
        itemId,
        fossilId,
      });
      // WHEN
      const missingItemId = await unlistItem({headers, body: '{}'});
      const missingUserToken = await unlistItem({headers: {}, body});
      // THEN
      expect(missingItemId.statusCode).toBe(400);
      expect(missingUserToken.statusCode).toBe(400);
    });
  });
  describe('Desire Item', () => {
    it('Returns a 200 [Happy path]', async () => {
      // GIVEN
      const headers = {
        userToken: 'account-user-token',
      };
      const body = JSON.stringify({
        fossilId: 'fossil-id',
      });
      await createAccount({headers});
      // WHEN
      const actual = await desireItem({headers, body});
      // THEN
      expect(actual.statusCode).toBe(200);
    });
    it('Returns a 400 when params are invalid[Sad path]', async () => {
      // GIVEN
      const headers = {
        userToken: 'account-user-token',
      };
      const body = JSON.stringify({
        fossilId: 'fossil-id',
      });
      await createAccount({headers});
      // WHEN
      const missingItemId = await desireItem({headers, body: '{}'});
      const missingUserToken = await desireItem({headers: {}, body});
      // THEN
      expect(missingItemId.statusCode).toBe(400);
      expect(missingUserToken.statusCode).toBe(400);
    });
  });
});
