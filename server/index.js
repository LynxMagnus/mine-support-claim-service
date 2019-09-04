const hapi = require('hapi')
const config = require('./config')
const messageService = require('./services/message-service')

async function registerQueues () {
  await messageService.registerQueues()

  process.on('SIGTERM', async function () {
    await messageService.closeConnections()
    process.exit(0)
  })

  process.on('SIGINT', async function () {
    await messageService.closeConnections()
    process.exit(0)
  })

  process.on('warning', async (warning) => {
    console.log('warning received', warning)
    if (warning && warning.name === 'AMQPWarning') {
      await messageService.closeConnections()
      process.exit(0)
    }
  })
}

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  // Register the plugins
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))

  if (config.isDev) {
    await server.register(require('blipp'))
    await server.register(require('./plugins/logging'))
  }

  process.on('SIGTERM', async function () {
    await messageService.closeConnections()
    process.exit(0)
  })

  process.on('SIGINT', async function () {
    await messageService.closeConnections()
    process.exit(0)
  })

  await registerQueues()
  return server
}

module.exports = createServer
