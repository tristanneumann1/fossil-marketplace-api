const sls = require('serverless-http');
const binaryMimeTypes = require('../binaryMimeTypes');
const nuxt = require('../nuxtClient');

module.exports.nuxt = sls(nuxt, {
  binary: binaryMimeTypes,
});
