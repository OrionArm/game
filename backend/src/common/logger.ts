import * as winston from 'winston';
import * as path from 'path';
import { type LogContext } from './filters/all-exceptions.filter';

type WinstonLogContext = LogContext & { level: string; context: string };
function formatLogMessage(data: WinstonLogContext): string {
  const { timestamp, context, level, message, path, method, statusCode } = data;

  const msg =
    typeof message === 'string'
      ? message
      : JSON.stringify(message ?? '', null, 0);

  const time = new Date(timestamp).toLocaleTimeString();
  const arr = [context, level, method, path, statusCode, msg].filter(Boolean);
  return `${time} ${arr.join(' ')}`;
}

export const WinstonLoggerConfig = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((data: WinstonLogContext) =>
          formatLogMessage(data),
        ),
      ),
    }),
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
    }),
  ],
};
