const winston = require("winston");
const path = require("path");

// 로그 포맷 정의
const logFormat = winston.format.combine(
  // 1. 타임스탬프 추가: YYYY-MM-DD HH:mm:ss 형식
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),

  // 2. 로그 메시지 형식 정의
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
    }`;
  })
);

// winston 로거 생성 및 설정
const logger = winston.createLogger({
  // 위에서 정의한 포맷 사용
  format: logFormat,

  // 로그 저장 방식 정의
  transports: [
    // 1. 에러 로그 파일
    new winston.transports.File({
      filename: path.join("logs", "scheduler-error.log"), // 저장 위치
      level: "error", // 에러 레벨만 저장
    }),

    // 2. 일반 로그 파일 (모든 레벨)일반 로그
    new winston.transports.File({
      filename: path.join("logs", "scheduler.log"), // 저장 위치
    }),

    // 3. 콘솔 출력
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // 콘솔 출력 색상 적용
        logFormat
      ),
    }),
  ],
});

module.exports = logger;
