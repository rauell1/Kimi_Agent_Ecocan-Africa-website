type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown> | undefined;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

function writeLog(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context
      ? Object.fromEntries(
          Object.entries(context).map(([key, value]) => [
            key,
            key.toLowerCase().includes('error') ? serializeError(value) : value,
          ])
        )
      : undefined,
  };

  const output = JSON.stringify(payload);

  switch (level) {
    case 'debug':
    case 'info':
      console.log(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'error':
      console.error(output);
      break;
  }
}

export const logger = {
  debug(message: string, context?: LogContext) {
    writeLog('debug', message, context);
  },
  info(message: string, context?: LogContext) {
    writeLog('info', message, context);
  },
  warn(message: string, context?: LogContext) {
    writeLog('warn', message, context);
  },
  error(message: string, context?: LogContext) {
    writeLog('error', message, context);
  },
};
