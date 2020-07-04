const redis = require('redis');
const config = require('config');
const { promisify } = require('util');

module.exports = () => {
  const client = redis.createClient ({
    port : config.get('redis.port'),
    host : config.get('redis.host'),
    password: config.get('redis.password'),
  });
  client.hgetAsync = promisify(client.hget).bind(client);
  client.getAsync = promisify(client.get).bind(client);
  client.lrangeAsync = promisify(client.lrange).bind(client);
  return new Promise((resolve, reject) => {
    client.on('ready', () => {
      resolve(client);
    });
    client.on('error', () => {
      reject(client);
    });
  });
};

