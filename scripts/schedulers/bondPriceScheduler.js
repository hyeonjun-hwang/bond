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

  cron.schedule(
    "0 7 * * *", // 매일 7시에 실행
    // "*/5 * * * *", // 테스트를 위해 5분 마다 실행
    // "*/30 * * * * *", // 테스트를 위해 30초마다 실행
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
      timezone: "Asia/Seoul", // 시간대 설정 추가
    }
  );
};

startBondPriceScheduler();
