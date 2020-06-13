const {httpHandler} = require('./utils/handler');

async function helloWorld() {
  return 'Hello World';
}

module.exports = { helloWorld: httpHandler(helloWorld) };
