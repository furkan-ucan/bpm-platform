// monitoring/logging/providers/winston.logger.ts
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Özel format oluşturma
const customFormat = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    return JSON.stringify({
      level,
      message,
      timestamp,
      ...meta,
    });
  }
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File transport for production with daily rotation
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    // Separate error log
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
    }),
  ],
  // Hata yakalama için exitOnError: false
  exitOnError: false,
});


// Hata loglama yardımcı fonksiyonu
export const logError = (message: string, error: any, meta = {}) => {
  logger.error({
    message,
    error: error.message || error,
    ...meta,
  });
};

export default logger;
