enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

const levelPriority: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 10,
  [LogLevel.INFO]: 20,
  [LogLevel.WARN]: 30,
  [LogLevel.ERROR]: 40
};

const currentLevel = getLogLevel();

export const logger = {
  debug(message: string, meta?: unknown): void {
    writeLog(LogLevel.DEBUG, message, meta);
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
  if (levelPriority[level] < levelPriority[currentLevel]) {
    return;
  }

  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta === undefined ? {} : { meta: serializeMeta(meta) })
  };

  const output = JSON.stringify(payload);

  if (level === LogLevel.ERROR) {
    console.error(output);
    return;
  }

  if (level === LogLevel.WARN) {
    console.warn(output);
    return;
  }

  console.log(output);
}

function getLogLevel(): LogLevel {
  const logLevel = process.env.LOG_LEVEL;

  const allowedLevels = Object.values(LogLevel);

  if (allowedLevels.includes(logLevel as LogLevel)) {
    return logLevel as LogLevel;
  }

  return LogLevel.INFO;
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
