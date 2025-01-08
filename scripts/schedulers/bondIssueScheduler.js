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
      "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat";
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
  console.log("\n=== 채권발행정보 스케줄러 시작 ===");
  console.log(
    "현재 시간:",
    new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
  );
  console.log(
    "다음 실행 예정:",
    getNextExecutionTime().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
  );

  const scheduler = cron.schedule(
    "0 1 * * *", // 매일 새벽 1시
    async () => {
      // 이전 작업이 실행 중인지 확인하는 플래그
      if (global.isProcessing) {
        console.log("이전 작업이 아직 실행 중입니다.");
        return;
      }

      try {
        global.isProcessing = true;
        const startTime = new Date();

        const result = await fetchAndProcessBondData();

        const endTime = new Date();
        const executionDuration = (endTime - startTime) / 1000;

        console.log(`\n작업 완료 (소요시간: ${executionDuration}초)`);
        console.log(
          "다음 실행 예정:",
          getNextExecutionTime().toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
          })
        );
      } catch (error) {
        console.error("작업 실행 중 오류 발생:", error);
      } finally {
        global.isProcessing = false;
      }
    },
    {
      timezone: "Asia/Seoul",
      scheduled: true,
    }
  );

  return scheduler;
};

// 다음 실행 시간을 계산하는 함수
function getNextExecutionTime() {
  const now = new Date();
  const next = new Date(now);

  // 테스트용 설정(1분 후) 대신 새벽 1시로 설정
  next.setHours(1, 0, 0, 0); // 새벽 1시 00분 00초

  // 만약 현재 시간이 새벽 1시 이후라면 다음 날로 설정
  if (now.getHours() >= 1) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

// 스케줄러 상태 모니터링
setInterval(() => {
  logger.info("스케줄러 상태 체크", {
    currentTime: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    isRunning: true,
    nextRun: getNextExecutionTime().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    }),
  });
}, 1000 * 60 * 60); // 1시간마다 상태 체크

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
