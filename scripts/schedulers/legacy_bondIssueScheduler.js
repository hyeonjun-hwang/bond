require("dotenv").config();
const mongoose = require("mongoose");
const cron = require("node-cron");
const axios = require("axios");
const BondIssue = require("../../models/bondIssueModel");
const logger = require("../utils/logger");
const connectDB = require("../../config/db"); // DB 연결 함수 import

// MongoDB 연결
connectDB()
  .then(() => {
    console.log("MongoDB Connected...");

    // MongoDB 연결 성공 후 스케줄러 시작
    if (
      process.env.NODE_ENV === "development" &&
      process.argv.includes("--test")
    ) {
      testScheduler();
    } else {
      startBondIssueScheduler();
    }
  })
  .catch((err) => {
    console.error("MongoDB 연결 실패:", err);
    process.exit(1);
  });

// 채권발행정보 수집 및 처리 함수
const fetchAndProcessBondData = async () => {
  try {
    const BASE_URL =
      //   "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat"; //채권발행정보
      "http://apis.data.go.kr/1160100/service/GetBondIssuInfoService/getBondBasiInfo"; //채권기본정보
    const numOfRows = 2500;

    const today = new Date()
      .toLocaleString("sv", { timeZone: "Asia/Seoul" })
      .split(" ")[0]
      .replace(/-/g, "");

    let allBondItems = [];
    let totalProcessed = 0;
    let totalNew = 0;
    let totalUpdated = 0;
    let currentPage = 1;
    let hasMoreData = true;

    console.log(`\n=== ${today} 채권 데이터 수집 시작 ===`);

    while (hasMoreData) {
      const params = {
        serviceKey: decodeURIComponent(
          process.env.BOND_ISSUE_SERVICE_KEY_ENCODING
        ),
        pageNo: currentPage.toString(),
        numOfRows: numOfRows.toString(),
        resultType: "json",
        basDt: today,
      };

      console.log(`\n${currentPage}페이지 처리 중...`);
      const response = await axios.get(BASE_URL, { params });

      if (!response.data.response?.body?.items?.item) {
        throw new Error("API 응답 데이터 형식이 올바르지 않습니다.");
      }

      const { totalCount } = response.data.response.body;
      const bondItems = Array.isArray(response.data.response.body.items.item)
        ? response.data.response.body.items.item
        : [response.data.response.body.items.item];

      for (const item of bondItems) {
        const existingDoc = await BondIssue.findOne({ isinCd: item.isinCd });
        if (existingDoc) {
          await BondIssue.findOneAndUpdate({ isinCd: item.isinCd }, item, {
            new: true,
          });
          totalUpdated++;
        } else {
          await BondIssue.create(item);
          totalNew++;
        }
      }

      totalProcessed += bondItems.length;
      allBondItems = allBondItems.concat(bondItems);

      // 진행상황 로깅
      console.log(`처리된 데이터: ${totalProcessed}/${totalCount}`);
      console.log(`신규: ${totalNew}, 업데이트: ${totalUpdated}`);

      hasMoreData = totalProcessed < parseInt(totalCount);
      currentPage++;
    }

    console.log(`\n=== ${today} 채권 데이터 수집 완료 ===`);
    console.log(`종료 시간: ${new Date().toLocaleString()}`);
    console.log(`총 처리 데이터: ${totalProcessed}`);
    console.log(`신규 저장: ${totalNew}`);
    console.log(`업데이트: ${totalUpdated}`);

    return {
      date: today,
      processResult: {
        processedCount: totalProcessed,
        newCount: totalNew,
        updateCount: totalUpdated,
      },
    };
  } catch (error) {
    console.error("채권 데이터 처리 중 오류:", error);
    throw error;
  }
};

// 채권발행정보 스케줄러 설정
const startBondIssueScheduler = () => {
  logger.info("채권발행정보 스케줄러 시작", {
    startTime: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    nodeVersion: process.version,
    timezone: process.env.TZ,
  });

  const scheduler = cron.schedule(
    // "0 */1 * * *", // 1시간 마다 실행
    // "*/30 * * * *", // 30분 마다 실행
    "0 0 * * *", // 매일 새벽 1시 마다 실행
    async () => {
      try {
        const startTime = new Date();
        logger.info("채권발행정보 갱신 작업 시작", {
          executionTime: startTime.toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
          }),
        });

        const result = await fetchAndProcessBondData();

        const endTime = new Date();
        const executionDuration = (endTime - startTime) / 1000;

        logger.info("채권발행정보 갱신 완료", {
          date: result.date,
          totalProcessed: result.processResult.processedCount,
          newCount: result.processResult.newCount,
          updateCount: result.processResult.updateCount,
          executionDuration: `${executionDuration}초`,
          nextExecutionTime: getNextExecutionTime().toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
          }),
        });
      } catch (error) {
        logger.error("채권발행정보 갱신 중 오류 발생", {
          error: error.message,
          stack: error.stack,
          time: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
        });
      }
    },
    {
      timezone: "Asia/Seoul",
      scheduled: true,
    }
  );

  // 다음 실행 시간 로깅
  logger.info("다음 스케줄러 실행 예정", {
    nextRun: getNextExecutionTime().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    }),
  });

  return scheduler;
};

// 다음 실행 시간을 계산하는 함수
function getNextExecutionTime() {
  const now = new Date();
  const next = new Date(now);

  // 다음 날 새벽 1시로 설정
  next.setDate(next.getDate() + 1);
  next.setHours(1);
  next.setMinutes(0);
  next.setSeconds(0);
  next.setMilliseconds(0);

  return next;
}

// // 30분 단위 테스트용 다음 실행 시간 계산 함수
// function getNextExecutionTime() {
//   const now = new Date();
//   const next = new Date(now);
//   const currentMinutes = now.getMinutes();
//   const minutesToAdd = 30 - (currentMinutes % 30);

//   next.setMinutes(now.getMinutes() + minutesToAdd);
//   next.setSeconds(0);
//   next.setMilliseconds(0);

//   return next;
// }

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

// 테스트용 테스트 실행 함수
const testScheduler = async () => {
  console.log("\n=== 테스트 실행 시작 ===");
  try {
    const startTime = new Date();
    const result = await fetchAndProcessBondData();
    const endTime = new Date();
    const executionDuration = (endTime - startTime) / 1000; // 초 단위

    console.log("\n=== 테스트 실행 결과 ===");
    console.log(`실행 시간: ${executionDuration}초`);
    console.log(
      "다음 정규 실행 시간:",
      getNextExecutionTime().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      })
    );
  } catch (error) {
    console.error("테스트 실행 중 오류 발생:", error);
  }
};

// 프로세스 종료 처리
process.on("SIGINT", () => {
  logger.info("채권발행정보 스케줄러 종료");
  process.exit(0);
});
