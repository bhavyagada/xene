const express = require('express')
const redirectSSL = require('redirect-ssl')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  const nuxt = new Nuxt(config)
  const port = process.env.PORT || nuxt.options.server.port;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : nuxt.options.server.host;

  if (config.dev) {
    await new Builder(nuxt).build()
  } else {
    await nuxt.ready()
  }

  app.use(redirectSSL)
  app.use(nuxt.render) // nuxt middleware to express

  app.listen(port, host)
  console.log(`Server listening on http://${host}:${port}`)
}
start()
