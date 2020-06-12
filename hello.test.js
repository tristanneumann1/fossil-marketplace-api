const { helloWorld } = require('./hello');

describe('helloWorld', () => {
  it('returns hello world response', async () => {
    // WHEN
    const actual = await helloWorld();
    // THEN
    expect(actual.body).toBe('Hello World');
    expect(actual.statusCode).toBe(200);
  });
});
