const {httpHandler} = require('./lib/handler');

async function helloWorld() {
  return 'Hello World';
}

module.exports = { helloWorld: httpHandler(helloWorld) };
