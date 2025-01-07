require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");
const logger = require("../utils/logger");

// 채권발행정보 API 호출 함수
const fetchBondIssueData = async () => {
  try {
    const response = await axios.get(
      `${process.env.API_BASE_URL}/api/bonds/issue`
    );
    return response.data;
  } catch (error) {
    throw new Error(`채권발행정보 API 호출 실패: ${error.message}`);
  }
};

// 채권발행정보 스케줄러 설정
const startBondIssueScheduler = () => {
  logger.info("채권발행정보 스케줄러 시작");

  // 매일 새벽 1시 실행
  cron.schedule(
    "0 1 * * *",
    async () => {
      try {
        logger.info("채권발행정보 갱신 작업 시작");

        const result = await fetchBondIssueData();

        logger.info("채권발행정보 갱신 완료", {
          date: result.date,
          totalProcessed: result.processResult.processedCount,
          newCount: result.processResult.newCount,
          updateCount: result.processResult.updateCount,
        });
      } catch (error) {
        logger.error("채권발행정보 갱신 중 오류 발생", {
          error: error.message,
          stack: error.stack,
        });
      }
    },
    {
      timezone: "Asia/Seoul",
      scheduled: true,
    }
  );
};

// 스케줄러 시작
startBondIssueScheduler();

// 프로세스 종료 처리
process.on("SIGINT", () => {
  logger.info("채권발행정보 스케줄러 종료");
  process.exit(0);
});
