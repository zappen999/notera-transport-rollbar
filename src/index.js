// Maps Notera default levels to Rollbar levels
const LEVEL_MAP = {
  emerg: 'critical',
  alert: 'critical',
  crit: 'critical',
  err: 'error',
  warning: 'warning',
  notice: 'warning',
  info: 'info',
  debug: 'debug'
}

function NoteraTransportRollbar (opts) {
  const levelMap = opts.levelMap || LEVEL_MAP

  return function transport ({ ctx, level, msg, err, meta }) {
    if (!levelMap[level]) {
      throw new Error(`Could not map level: ${level} to Rollbar logging level`)
    }

    const args = []
    const message = [ctx, msg].filter(x => x).join(': ')

    if (message) args.push(message)
    if (err) args.push(err)
    if (meta) args.push(meta)

    // TODO: Turn this into an async transport using callback

    const logFunc = opts.rollbar[levelMap[level]]
    logFunc.apply(opts.rollbar, args)
  }
}

module.exports = NoteraTransportRollbar
