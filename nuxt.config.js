const config = require('config');

module.exports = {
  mode: 'universal',
  head: {
    title: 'Fossil Marketplace',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'A marketplace for all your Animal Crossing needs! Complete your fossil collection and sell your dusty duplicates!' },
    ],
  },
  build: {
    vendor: ['axios'],
    publicPath: `/${config.get('NODE_ENV')}/_nuxt/`,
  },
  srcDir: 'client/',
  performance: {
    gzip: false,
  },
  router: {
    base: `/`,
  },
  dev: false,
};
