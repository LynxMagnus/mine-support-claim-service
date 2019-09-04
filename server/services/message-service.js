const MessageSender = require('./messaging/message-sender')
const config = require('../config')

const calculationSender = new MessageSender('claim-service-calculation-sender', config.messageQueues.calculationQueue)
const scheduleSender = new MessageSender('claim-service-schedule-sender', config.messageQueues.scheduleQueue)

async function registerQueues () {
  await openConnections()
}

async function closeConnections () {
  await calculationSender.closeConnection()
  await scheduleSender.closeConnection()
}

async function openConnections () {
  await calculationSender.openConnection()
  await scheduleSender.openConnection()
}

async function publishClaim (claim) {
  try {
    // if (!isConnected()) {
    //   await closeConnections()
    //   process.exit()
    // }
    console.log('calculationSender connected', calculationSender.isConnected())
    console.log('scheduleSender connected', scheduleSender.isConnected())
    const delivery = await Promise.all([
      calculationSender.sendMessage(claim),
      scheduleSender.sendMessage(claim)
    ])
    delivery.map(del => { console.log(del.settled) })
  } catch (err) {
    console.log(err)
    throw err
  }
}

function getCalculationSender () {
  return calculationSender
}

function getScheduleSender () {
  return scheduleSender
}

module.exports = {
  closeConnections,
  getCalculationSender,
  getScheduleSender,
  openConnections,
  publishClaim,
  registerQueues
}
