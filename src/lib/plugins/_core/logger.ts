// console-backed logger with a pino-like child()/level api.
// swap for your own logger here — nothing else in _core imports a logger directly.

type Fields = Record<string, unknown>

export interface Logger {
  child(fields: Fields): Logger
  debug(fields: Fields | string, msg?: string): void
  info(fields: Fields | string, msg?: string): void
  warn(fields: Fields | string, msg?: string): void
  error(fields: Fields | string, msg?: string): void
}

function emit(
  level: 'debug' | 'info' | 'warn' | 'error',
  base: Fields,
  fields: Fields | string,
  msg?: string,
): void {
  if (level === 'debug' && !import.meta.env.DEV) return

  const [payload, message] =
    typeof fields === 'string' ? [base, fields] : [{ ...base, ...fields }, msg]

  console[level === 'debug' ? 'debug' : level](`[plugins]${message ? ' ' + message : ''}`, payload)
}

function make(base: Fields): Logger {
  return {
    child: (fields) => make({ ...base, ...fields }),
    debug: (fields, msg) => emit('debug', base, fields, msg),
    info: (fields, msg) => emit('info', base, fields, msg),
    warn: (fields, msg) => emit('warn', base, fields, msg),
    error: (fields, msg) => emit('error', base, fields, msg),
  }
}

export function logger(): Logger {
  return make({})
}
