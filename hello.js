async function helloWorld() {
  return {
    statusCode: 200,
    body: 'Hello World',
  };
}

module.exports = { helloWorld };
