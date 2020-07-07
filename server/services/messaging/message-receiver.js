const rheaPromise = require('rhea-promise')
const { getReceiverConfig } = require('./config-helper')
const MessageBase = require('./message-base')
const appInsights = require('applicationinsights')

class MessageReceiver extends MessageBase {
  constructor (name, config) {
    super(name, config)
    this.receiverConfig = getReceiverConfig(this.name, config)
  }

  registerEvents (receiver, action) {
    receiver.on(rheaPromise.ReceiverEvents.message, async (context) => {
      console.log('context.message***********************')
      console.log(context.message)

      const correlationId = context.message.correlation_id
      console.log(correlationId)

      const phonyReq = {
        // TODO: Update the name to something meaningul and the url to the message queue
        name: 'phony',
        url: 'message-queue',
        duration: 0,
        resultCode: 200,
        success: true,
        // see https://docs.microsoft.com/en-us/azure/azure-monitor/app/data-model-context#operation-id
        properties: { operationId: correlationId }
      }

      console.log('call trackRequest with phonyReq')
      appInsights.defaultClient.trackRequest(phonyReq)

      const correlationContext = appInsights.getCorrelationContext()
      console.log('correlationContext')
      console.log(correlationContext)

      console.log(`${this.name} received message`, context.message.body)
      try {
        const message = JSON.parse(context.message.body)
        // const message = { word: 'up' }
        await action(message)
      } catch (ex) {
        console.error(`${this.name} error with message`, ex)
      }
    })

    receiver.on(rheaPromise.ReceiverEvents.receiverError, context => {
      const receiverError = context.receiver && context.receiver.error
      if (receiverError) {
        console.error(`${this.name} receipt error`, receiverError)
      }
    })
  }

  async setupReceiver (action) {
    const receiver = await this.connection.createReceiver(this.receiverConfig)
    this.registerEvents(receiver, action)
  }
}

module.exports = MessageReceiver
