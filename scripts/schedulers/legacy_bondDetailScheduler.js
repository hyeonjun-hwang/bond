require("dotenv").config();
const mongoose = require("mongoose");
const cron = require("node-cron");
const axios = require("axios");
const BondDetail = require("../../models/bondDetailModel");
const logger = require("../utils/logger");
const connectDB = require("../../config/db");

// MongoDB 연결
connectDB()
  .then(() => {
    console.log("MongoDB Connected...");
    if (
      process.env.NODE_ENV === "development" &&
      process.argv.includes("--test")
    ) {
      testScheduler();
    } else {
      startBondDetailScheduler();
    }
  })
  .catch((err) => {
    console.error("MongoDB 연결 실패:", err);
    process.exit(1);
  });

// 채권기본정보 수집 및 처리 함수
const fetchAndProcessBondData = async () => {
  try {
    const BASE_URL =
      "http://apis.data.go.kr/1160100/service/GetBondIssuInfoService/getBondBasiInfo";
    const numOfRows = 9999;

    const today = new Date()
      .toLocaleString("sv", { timeZone: "Asia/Seoul" })
      .split(" ")[0]
      .replace(/-/g, "");

    let totalProcessed = 0;
    let totalNew = 0;
    let totalUpdated = 0;
    let currentPage = 1;
    let hasMoreData = true;

    logger.info("채권기본정보 수집 시작");

    while (hasMoreData) {
      try {
        const params = {
          serviceKey: decodeURIComponent(
            process.env.BOND_DETAIL_SERVICE_KEY_ENCODING
          ),
          pageNo: currentPage.toString(),
          numOfRows: numOfRows.toString(),
          resultType: "json",
          basDt: today,
        };

        logger.info(`${currentPage}페이지 처리 중...`);
        const response = await axios.get(BASE_URL, { params });

        if (!response.data?.response?.body) {
          throw new Error("API 응답에 body가 없습니다.");
        }

        const responseBody = response.data.response.body;
        if (!responseBody.items) {
          logger.info("더 이상 데이터가 없습니다.");
          break;
        }

        const bondItems = Array.isArray(responseBody.items.item)
          ? responseBody.items.item
          : [responseBody.items.item];

        if (!bondItems.length) {
          logger.info("페이지에 데이터가 없습니다.");
          break;
        }

        let pageProcessed = 0;

        for (const item of bondItems) {
          try {
            const existingDoc = await BondDetail.findOne({
              isinCd: item.isinCd,
            });
            if (existingDoc) {
              await BondDetail.findOneAndUpdate({ isinCd: item.isinCd }, item, {
                new: true,
              });
              totalUpdated++;
            } else {
              await BondDetail.create(item);
              totalNew++;
            }
            pageProcessed++;
          } catch (dbError) {
            logger.error(
              `데이터 저장 중 오류 (isinCd: ${item.isinCd}):`,
              dbError
            );
          }
        }

        totalProcessed += pageProcessed;
        logger.info(
          `처리 현황: ${totalProcessed}/${responseBody.totalCount} (신규: ${totalNew}, 업데이트: ${totalUpdated})`
        );

        hasMoreData = totalProcessed < parseInt(responseBody.totalCount);
        currentPage++;

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (pageError) {
        logger.error(`${currentPage}페이지 처리 중 오류:`, pageError);
        currentPage++;
        continue;
      }
    }

    return {
      processResult: {
        processedCount: totalProcessed,
        newCount: totalNew,
        updateCount: totalUpdated,
      },
    };
  } catch (error) {
    logger.error("채권기본정보 처리 중 오류:", error);
    throw error;
  }
};

// 채권기본정보 스케줄러 설정
const startBondDetailScheduler = () => {
  logger.info("채권기본정보 스케줄러 시작", {
    startTime: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    nodeVersion: process.version,
    timezone: process.env.TZ,
  });

  const scheduler = cron.schedule(
    "0 0 * * *", // 매일 새벽 1시 실행
    async () => {
      try {
        const startTime = new Date();
        logger.info("채권기본정보 갱신 작업 시작");

        const result = await fetchAndProcessBondData();

        const endTime = new Date();
        const executionDuration = (endTime - startTime) / 1000;

        logger.info("채권기본정보 갱신 완료", {
          totalProcessed: result.processResult.processedCount,
          newCount: result.processResult.newCount,
          updateCount: result.processResult.updateCount,
          executionDuration: `${executionDuration}초`,
          nextExecutionTime: getNextExecutionTime().toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
          }),
        });
      } catch (error) {
        logger.error("채권기본정보 갱신 중 오류 발생", {
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

  logger.info("다음 스케줄러 실행 예정", {
    nextRun: getNextExecutionTime().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    }),
  });

  return scheduler;
};

// 다음 실행 시간 계산 함수
function getNextExecutionTime() {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(1);
  next.setMinutes(0);
  next.setSeconds(0);
  next.setMilliseconds(0);
  return next;
}

// 테스트 실행 함수
const testScheduler = async () => {
  logger.info("=== 테스트 실행 시작 ===");
  try {
    const startTime = new Date();
    const result = await fetchAndProcessBondData();
    const endTime = new Date();
    const executionDuration = (endTime - startTime) / 1000;

    logger.info("=== 테스트 실행 결과 ===", {
      executionDuration: `${executionDuration}초`,
      ...result.processResult,
      nextExecutionTime: getNextExecutionTime().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      }),
    });
  } catch (error) {
    logger.error("테스트 실행 중 오류 발생:", error);
  }
};

// 스케줄러 상태 모니터링
// setInterval(() => {
//   logger.info("스케줄러 상태 체크", {
//     currentTime: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
//     isRunning: true,
//     nextRun: getNextExecutionTime().toLocaleString("ko-KR", {
//       timeZone: "Asia/Seoul",
//     }),
//   });
// }, 1000 * 60 * 60 * 12); // 12시간마다 체크

// 프로세스 종료 처리
process.on("SIGINT", () => {
  logger.info("채권기본정보 스케줄러 종료");
  process.exit(0);
});
