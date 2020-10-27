const appInsightstUtil = require('../../../util/app-insights-util')

let appInsightsClient

describe('App Insights Util', () => {
  beforeEach(() => {
    appInsightsClient = {
      trackTrace: jest.fn(),
      context: {
        keys: {
          operationId: jest.fn()
        },
        tags: {
        }
      }
    }
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  test('App Insights client is null', async () => {
    const appInsightsService = appInsightstUtil(null)

    appInsightsService.setOperationId('13213213eweqwe32121')

    expect(appInsightsClient.context.keys.operationId).toHaveBeenCalledTimes(0)
    expect(appInsightsClient.trackTrace).toHaveBeenCalledTimes(0)
  })

  test('App Insights client is null', async () => {
    const appInsightsService = appInsightstUtil(null)

    appInsightsService.logTraceMessage('test')

    expect(appInsightsClient.context.keys.operationId).toHaveBeenCalledTimes(0)
    expect(appInsightsClient.trackTrace).toHaveBeenCalledTimes(0)
  })

  /* test('App Insights client is not null', async () => {

    const appInsightsService = appInsightstUtil(appInsightsClient)

    appInsightsService.setOperationId('13213213eweqwe32121')

    console.log(appInsightsClient.context.keys.operationId)

    expect(appInsightsClient.context).toHaveBeenCalledTimes(1)
    expect(appInsightsClient.trackTrace).toHaveBeenCalledTimes(0)
  }) */

  test('App Insights client is not null', async () => {
    const appInsightsService = appInsightstUtil(appInsightsClient)

    appInsightsService.logTraceMessage('test')

    expect(appInsightsClient.context.keys.operationId).toHaveBeenCalledTimes(0)
    expect(appInsightsClient.trackTrace).toHaveBeenCalledTimes(1)
  })
})