const { ReceiveMode } = require('@azure/service-bus')
const MessageBase = require('./message-base')
const appInsights = require('applicationinsights')
const AppInsightsUtil = require('../../../util/app-insights-util')

class MessageReceiver extends MessageBase {
  constructor (name, config, credentials, action) {
    super(name, config, credentials)
    this.receiverHandler = this.receiverHandler.bind(this)
    this.action = action
    this.receiver = this.queueClient.createReceiver(ReceiveMode.peekLock)
    this.receiver.registerMessageHandler(this.receiverHandler, this.receiverError)
  }

  receiverError (error) {
    console.log(error)
  }

  async receiverHandler (message) {
    console.log(`${this.name} received message`, message.body)
    try {
      const appInsightsService = AppInsightsUtil(appInsights.defaultClient)

      appInsightsService.setOperationId(message.correlationId)
      appInsightsService.logTraceMessage(`Trace Receiver - ${this.name}`)

      await this.action(message.body)
    } catch (ex) {
      console.error(`${this.name} error with message`, ex)
    }
  }

  async closeConnection () {
    await this.receiver.close()
    console.log(`${this.name} receiver closed`)
    await super.closeConnection()
  }
}

module.exports = MessageReceiver
