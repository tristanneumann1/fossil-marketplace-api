module.exports = {
  mode: 'universal',

  head: {
    title: 'Fossil Marketplace',
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css' },
    ],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'A marketplace for all your Animal Crossing needs! Complete your fossil collection and sell your dusty duplicates!' },
    ],
  },

  srcDir: 'client/',

  modules: [
    '@nuxt/http',
    'nuxt-material-design-icons-iconfont',
  ],
  buildModules: [
    [
      '@nuxtjs/vuetify', 
      {
        icons: {
          iconfont: 'mdi',
        },
        theme: {
          themes: {
            light: {
              primary: '#0A516D',
              secondary: '#018790',
              accent: '#BACCA4',
              error: '#7DAD93',
            },
          },
        },
      },
    ],
  ],
  http: {
    baseURL: 'https://app.tristan-neumann.com/',
  },

  render: {
    compressor: false,
  },
};
