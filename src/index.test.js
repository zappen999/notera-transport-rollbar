/* global jest, describe, test, expect, beforeEach */
const noteraTransportRollbar = require('./index')

const mockEntry = {
  ctx: 'SERVER',
  level: 'info',
  msg: 'Some stuff\n happened',
  err: new Error('This is a mock error'),
  meta: {
    some: 'meta',
    data: true
  }
}

const rollbar = {
  critical: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
  debug: () => {}
}

beforeEach(() => {
  for (const key in rollbar) {
    rollbar[key] = jest.fn()
  }
})

describe('Level map', () => {
  test('should throw if the level cannot be mapped', () => {
    const levelMap = { stuff: 'info' } // Useless level map
    expect(() => noteraTransportRollbar({ rollbar, levelMap })(mockEntry))
      .toThrow('Could not map level: info to Rollbar logging level')
  })
})

describe('Logging', () => {
  test('should call Rollbar logging function', () => {
    noteraTransportRollbar({ rollbar })(mockEntry)
    expect(rollbar.info.mock.calls.length).toEqual(1)
    const firstCall = rollbar.info.mock.calls[0]
    expect(firstCall[0]).toEqual('SERVER: Some stuff\n happened')
    expect(firstCall[1]).toEqual(mockEntry.err)
    expect(firstCall[2]).toEqual(mockEntry.meta)
  })

  test('should not provide message if ctx or msg is not present', () => {
    noteraTransportRollbar({ rollbar })({ level: 'info', err: mockEntry.err })
    const firstCall = rollbar.info.mock.calls[0]
    expect(firstCall[0]).toEqual(mockEntry.err)
  })

  test('should provide message if only ctx is present', () => {
    noteraTransportRollbar({ rollbar })({
      ctx: 'SERVER',
      level: 'info'
    })
    const firstCall = rollbar.info.mock.calls[0]
    expect(firstCall[0]).toEqual('SERVER')
  })
})
