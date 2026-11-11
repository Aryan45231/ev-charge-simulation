enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

const isDebugEnabled = import.meta.env.DEV || import.meta.env.VITE_LOG_LEVEL === LogLevel.DEBUG;

export const logger = {
  debug(message: string, meta?: unknown): void {
    if (isDebugEnabled) {
      writeLog(LogLevel.DEBUG, message, meta);
    }
  },

  info(message: string, meta?: unknown): void {
    writeLog(LogLevel.INFO, message, meta);
  },

  warn(message: string, meta?: unknown): void {
    writeLog(LogLevel.WARN, message, meta);
  },

  error(message: string, meta?: unknown): void {
    writeLog(LogLevel.ERROR, message, meta);
  }
};

function writeLog(level: LogLevel, message: string, meta?: unknown): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta === undefined ? {} : { meta: serializeMeta(meta) })
  };

  if (level === LogLevel.ERROR) {
    console.error(payload);
    return;
  }

  if (level === LogLevel.WARN) {
    console.warn(payload);
    return;
  }

  console.log(payload);
}

function serializeMeta(meta: unknown): unknown {
  if (meta instanceof Error) {
    return {
      name: meta.name,
      message: meta.message,
      stack: meta.stack
    };
  }

  return meta;
}
