const sls = require('serverless-http');
const binaryMimeTypes = require('../binaryMimeTypes.config.js');
const nuxt = require('../nuxtClient');

module.exports.nuxt = sls(nuxt, {
  binary: binaryMimeTypes,
});
