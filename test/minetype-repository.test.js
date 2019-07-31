let minetypeRepository
let mockSequelize
let mockDb

describe('Test minetype repository', () => {

  beforeEach(async () => {
    jest.mock('../server/models')
    jest.mock('../server/models/minetype', () => {
      mockSequelize = require('sequelize-mock')
      mockDb = new mockSequelize()
      return mockDb.define('mineTypes', {
        mineTypeId: 1,
        claimId: 'MINE123',
        mineType: 'gold'
      })
    })
  })

  test('minetype repository loads object from database', async () => {
    minetypeRepository = require('../server/repository/minetype-repository')
    mockDb.$queueResult({
      mineTypeId: 1,
      claimId: 'MINE123',
      mineType: 'gold'
    })
    const minetype = await minetypeRepository.create({
      mineTypeId: 1,
      claimId: 'MINE123',
      mineType: 'gold'
    })
    await expect(minetype.claimId).toEqual('MINE123')
    await expect(minetype.mineTypeId).toEqual(1)
    await expect(minetype.mineType).toEqual('gold')
  })

  test('minetype repository handles database failure', async () => {
    minetypeRepository = require('../server/repository/minetype-repository')

    mockDb.$queueFailure(new mockSequelize.ValidationError('Test error'))

    return expect(minetypeRepository.create({
      mineTypeId: 1,
      claimId: 'MINE123',
      mineType: 'gold'
    })).rejects.toThrow()
  })

  afterEach(async () => {
    jest.unmock('../server/models/minetype')
    jest.unmock('../server/models')
  })
})

describe('Test minetype model', () => {
  test('Minetype model is created', async () => {
    jest.mock('sequelize', () => {
      const mockSequelize = require('sequelize-mock')
      return mockSequelize
    })
    const minetypeModel = require('../server/models/minetype')
    expect(minetypeModel.name).toEqual('')
  })
})