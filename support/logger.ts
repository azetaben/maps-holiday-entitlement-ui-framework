import {mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {createLogger, format, transports} from 'winston';

const { combine, timestamp, errors, printf, splat, colorize } = format;
const logFilePath = resolve(process.env.LOG_FILE ?? 'logs/framework.log');

mkdirSync(dirname(logFilePath), { recursive: true });

const logLine = printf(({ timestamp: time, level, message, ...metadata }) => {
  const page = typeof metadata.page === 'string' ? metadata.page : undefined;
  delete metadata.page;
  const details = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : '';
  return `${time}${page ? ` Page: ${page}` : ''} ${level.toUpperCase()} ${message}${details}`;
});

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  logLine,
);

const consoleFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  colorize({ all: true }),
  logLine,
);

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  transports: [
    new transports.Console({ format: consoleFormat }),
    new transports.File({
      filename: logFilePath,
      format: fileFormat,
      maxsize: Number(process.env.LOG_MAX_SIZE ?? 5_000_000),
      maxFiles: Number(process.env.LOG_MAX_FILES ?? 5),
      tailable: true,
    }),
  ],
});

logger.info('Writing framework logs to %s', logFilePath);

export default logger;
