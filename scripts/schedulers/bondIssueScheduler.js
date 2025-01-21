require("dotenv").config();
const cron = require("node-cron");
const { Sequelize } = require("sequelize");
const config = require("../../config/database.js")[
  process.env.NODE_ENV || "development"
];
const BondIssueApi = require("../utils/api/bondIssueApi");
const logger = require("../utils/logger");

const startBondIssueScheduler = () => {
  logger.info(
    `채권발행정보 스케줄러 시작 (${new Date().toLocaleString("ko-KR")})`
  );

  const bondIssueApi = new BondIssueApi(
    process.env.BOND_ISSUE_SERVICE_KEY_ENCODING
  );

  cron.schedule(
    "0 1 * * *", // 매일 1시에 실행
    // "*/5 * * * *", // 테스트용 5분 마다 실행
    async () => {
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

        const BondIssue = require("../../models/bond_issue")(
          sequelize,
          Sequelize.DataTypes
        );
        logger.info(
          `채권발행정보 수집 시작 (${new Date().toLocaleString("ko-KR")})`
        );

        let currentPage = 1;
        let totalProcessed = 0;
        let totalSuccess = 0;
        let totalError = 0;

        while (true) {
          try {
            const response = await bondIssueApi.fetchData(currentPage);
            const items = response?.items?.item || [];
            let pageSuccess = 0;
            let pageError = 0;

            if (items.length === 0) {
              logger.info("더 이상 처리할 데이터가 없습니다.");
              break;
            }

            for (const item of items) {
              try {
                const bondIssueData = bondIssueApi.formatData(item);
                await BondIssue.upsert(bondIssueData, {
                  conflictFields: ["isin_cd"],
                });
                pageSuccess++;
                totalSuccess++;
              } catch (error) {
                logger.error(
                  `데이터 처리 중 오류 발생 (isin_cd: ${item.isinCd}):`,
                  error
                );
                pageError++;
                totalError++;
              }
            }

            totalProcessed += items.length;
            logger.info({
              message: `페이지 ${currentPage} 처리 완료`,
              pageItems: items.length,
              pageSuccess,
              pageError,
              progress: `${totalProcessed}/${response.totalCount}`,
            });

            currentPage++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            logger.error(`페이지 ${currentPage} 처리 중 에러:`, error);
            break;
          }
        }

        logger.info({
          message: "채권발행정보 수집 완료",
          totalProcessed,
          successCount: totalSuccess,
          errorCount: totalError,
          completedAt: new Date().toLocaleString("ko-KR"),
        });
      } catch (error) {
        logger.error("스케줄러 실행 중 에러:", error);
      } finally {
        if (sequelize) {
          await sequelize.close();
          logger.info("DB 연결 종료");
        }
        logger.info(
          `채권발행정보 스케줄러 종료 (${new Date().toLocaleString("ko-KR")})`
        );
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Seoul",
    }
  );
};

// 스케줄러 시작
startBondIssueScheduler();
