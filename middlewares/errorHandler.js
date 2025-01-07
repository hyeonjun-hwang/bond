const errorHandler = (err, req, res, next) => {
  // 에러 로깅
  console.error("에러 발생:", err);

  // API 에러 응답 포맷 통일
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "서버 에러가 발생했습니다.",
    // 개발 환경에서만 스택 트레이스 노출
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
