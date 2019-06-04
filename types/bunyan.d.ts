export = bunyan
declare class bunyan {
  static DEBUG: number
  static ERROR: number
  static FATAL: number
  static INFO: number
  static LOG_VERSION: number
  static RingBuffer(options: any): void
  static RotatingFileStream(options: any): void
  static TRACE: number
  static VERSION: string
  static WARN: number
  static createLogger(options: any): any
  static levelFromName: {
    debug: number
    error: number
    fatal: number
    info: number
    trace: number
    warn: number
  }
  static nameFromLevel: {
    '10': string
    '20': string
    '30': string
    '40': string
    '50': string
    '60': string
  }
  static resolveLevel(nameOrNum: any): any
  static safeCycles(): any
  constructor(options: any, _childOptions: any, _childSimple: any)
  streams: any
  serializers: any
  src: any
  fields: any
  addListener(type: any, listener: any): any
  addSerializers(serializers: any): void
  addStream(s: any, defaultLevel: any): void
  child(options: any, simple: any): any
  debug(...args: any[]): any
  emit(type: any, args: any): any
  error(...args: any[]): any
  eventNames(): any
  fatal(...args: any[]): any
  getMaxListeners(): any
  info(...args: any[]): any
  level(value: any): any
  levels(name: any, value: any): any
  listenerCount(type: any): any
  listeners(type: any): any
  off(type: any, listener: any): any
  on(type: any, listener: any): any
  once(type: any, listener: any): any
  prependListener(type: any, listener: any): any
  prependOnceListener(type: any, listener: any): any
  rawListeners(type: any): any
  removeAllListeners(type: any, ...args: any[]): any
  removeListener(type: any, listener: any): any
  reopenFileStreams(): void
  setMaxListeners(n: any): any
  trace(...args: any[]): any
  warn(...args: any[]): any
}
declare namespace bunyan {
  namespace stdSerializers {
    function err(err: any): any
    function req(req: any): any
    function res(res: any): any
  }
}
