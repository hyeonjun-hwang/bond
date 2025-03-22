require("dotenv").config();
const cron = require("node-cron");
const { Sequelize } = require("sequelize");
const config = require("../../config/database.js")[
  process.env.NODE_ENV || "development"
];
const BondPriceApi = require("../utils/api/bondPriceApi");
const logger = require("../utils/logger");
const { getTodayDate } = require("../utils/formatters/dateFormatter");

const startBondPriceScheduler = () => {
  logger.info(`채권시세정보 스케줄러 시작 (${new Date().toLocaleString()})`);

  const bondPriceApi = new BondPriceApi(
    process.env.BOND_PRICE_SERVICE_KEY_ENCODING
  );

  // 스케줄러 인스턴스 생성
  const scheduler = cron.schedule(
    "30 23 * * *",
    async () => {
      console.log(
        `: 채권시세정보 수집 시작 (${new Date().toLocaleString("ko-KR")}) `
      );

      let totalProcessed = 0;
      let successCount = 0;
      let errorCount = 0;
      let pageNo = 1;
      let sequelize;

      try {
        sequelize = new Sequelize(
          config.database,
          config.username,
          config.password,
          {
            host: config.host,
            dialect: config.dialect,
            logging: false,
          }
        );

        const BondPrice = require("../../models/bond_price")(
          sequelize,
          Sequelize.DataTypes
        );

        while (true) {
          const response = await bondPriceApi.fetchData(pageNo);
          //   console.log(
          //     ": API 응답 전체 구조:",
          //     JSON.stringify(response, null, 2)
          //   );

          if (!response?.response?.body?.items?.item) {
            console.log(": API 응답에 데이터가 없습니다.");
            break;
          }

          const items = response.response.body.items.item;
          const itemCount = items.length;

          if (itemCount === 0) {
            console.log(": 더 이상 처리할 데이터가 없습니다.");
            break;
          }

          console.log(`: 페이지 ${pageNo} 처리 중...`);
          console.log(`: API 응답 데이터 {
            "totalCount": ${response.response.body.totalCount},
            "numOfRows": ${response.response.body.numOfRows},
            "pageNo": ${pageNo},
            "itemCount": ${itemCount}
          }`);

          for (const item of items) {
            try {
              const bondPriceData = bondPriceApi.formatData(item);
              await BondPrice.upsert(bondPriceData, {
                conflictFields: ["bas_dt", "isin_cd", "mrkt_ctg"],
              });
              successCount++;
            } catch (error) {
              console.error(
                `: 데이터 처리 중 오류 발생 (isin_cd: ${item.isinCd}):`,
                error
              );
              errorCount++;
            }
          }

          totalProcessed += itemCount;
          pageNo++;
        }
      } catch (error) {
        logger.error(": API 호출 중 오류 발생:", error);
      } finally {
        if (sequelize) {
          await sequelize.close();
          logger.info("DB 연결 종료");
        }
        logger.info(
          `채권시세정보 스케줄러 종료 (${new Date().toLocaleString()})`
        );
      }

      console.log(`: 채권시세정보 수집 완료 {
        "totalProcessed": ${totalProcessed},
        "successCount": ${successCount}, 
        "errorCount": ${errorCount},
        "completedAt": "${new Date().toLocaleString("ko-KR")}"
      }`);
    },
    {
      scheduled: true,
      timezone: "Asia/Seoul",
    }
  );

  // 프로세스 종료 시그널 처리
  process.on("SIGINT", () => {
    logger.info("채권시세정보 스케줄러 종료 요청 수신");
    scheduler.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("채권시세정보 스케줄러 종료 요청 수신");
    scheduler.stop();
    process.exit(0);
  });

  // 예기치 않은 에러 처리
  process.on("uncaughtException", (error) => {
    logger.error("예기치 않은 에러 발생:", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("처리되지 않은 Promise 거부:", reason);
  });

  // 스케줄러 상태 모니터링
  setInterval(() => {
    logger.info("채권시세정보 스케줄러 실행 중...");
  }, 12 * 60 * 60 * 1000); // 12시간마다 로그
};

// 스케줄러 시작
startBondPriceScheduler();

// 프로세스 유지
process.stdin.resume();
