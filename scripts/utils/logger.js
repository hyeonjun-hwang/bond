const winston = require("winston");
const path = require("path");

// 로그 포맷 정의
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// 로거 생성
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  transports: [
    // 일반 로그 파일
    new winston.transports.File({
      filename: path.join("logs", "scheduler.log"),
      level: "info",
    }),
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join("logs", "scheduler-error.log"),
      level: "error",
    }),
    // 콘솔 출력
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

module.exports = logger;
