const colors = require('vuetify/es5/util/colors').default
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config()

module.exports = {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    // titleTemplate: process.env.PROJECT_NAME + '%s - ',
    // title: process.env.PROJECT_NAME || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.PROJECT_DESCRIPTION || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/' + process.env.PROJECT_ID + '-favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: 'cyan', height: '5px' },
  /*
  ** Global CSS
  */
  css: [
    { src: '~assets/fonts/fonts.css' },
    'codemirror/lib/codemirror.css',
    { src: '~assets/css/custom.css' },
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/simple-keyboard.js', mode: 'client' },
    { src: '~plugins/vue-codemirror.js', mode: 'client' },
    { src: '~/plugins/vue-countup-v2.js', mode: 'client' },
    { src: '~/plugins/vue-particles.js', mode: 'client' },
    { src: '~/plugins/c3.js', mode: 'client' },
    { src: '~/plugins/vue-fullscreen.js', mode: 'client' },
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/vuetify',
    ['@nuxtjs/google-analytics', {
      id: 'UA-164503315-1'
    }]
  ],  
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    '@nuxtjs/auth',
    '@nuxtjs/sentry',
    [
      '@nuxtjs/device',
      {defaultUserAgent: 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Mobile Safari/537.36'}
    ]
  ],
  sentry: {
    dsn: 'https://b79e26d6b2df4a9cb87a01bc329e035c@o379859.ingest.sentry.io/5205167', // Enter your project's DSN here
    disabled: process.env.NODE_ENV === 'development',
    config: {}    
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    proxy: false,
    baseURL: process.env.BASE_URL
  },
  // proxy: {
  //   '/api': 'http://localhost:3000'
  // },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    treeShake: true,
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    },
    icons: {
      iconfont: 'mdi', // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
    },
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {      
    }
  },

  serverMiddleware: [
    'redirect-ssl',
    cookieParser(),
    bodyParser.json(),
    '~/server/api'
  ],
  auth: {
    redirect: {
      callback: '/callback',
      login: '/',
      home: '/challenges'
    },
    cookie: {
      options: {
        maxAge: 999999999
      }
    },
    strategies: {
      local: false,
      auth0: {
        domain: process.env.AUTH0_DOMAIN,
        client_id: process.env.AUTH0_CLIENT_ID
      },
    }
  },
  pwa: {
    manifest: {
      name: process.env.PROJECT_NAME,
    },
    icon: {
      iconFileName: process.env.PROJECT_ID + '-icon.png'
    }
  },
  // vue:{
  //   config: {
  //     productionTip: false,
  //     devtools: true
  //   }
  // },
  // server: {
  //   port: 80,
  //   host: '192.168.1.100'
  // }

}
