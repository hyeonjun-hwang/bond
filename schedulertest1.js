require("dotenv").config();
const cron = require("node-cron");
const { Sequelize } = require("sequelize");
const axios = require("axios");
// const config = require("../../config/database.js")[
//   process.env.NODE_ENV || "development"
// ];
// const BondIssueApi = require("../utils/api/bondIssueApi");
// const logger = require("../utils/logger");

const fetchAndStoreBondIssueData = async () => {
  try {
    let currentPage = 1;
    const baseUrl = "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat";
    const params = {
      serviceKey: process.env.BOND_ISSUE_SERVICE_KEY_DECODING,
      pageNo: currentPage,
      numOfRows: 10,
      resultType: "json",
      basDt: "20250303"
    };

    console.log(`스케줄러 시작, ${new Date().toLocaleString()}`);

    while (true) {
      try {
        params.pageNo = currentPage;
        const result = await axios.get(baseUrl, { params });
        const item = result?.data?.response?.body?.items?.item || [];
        
        // 첫 번째 루프에서만 header 정보 출력
        if (currentPage === 1) {
          console.log("API 응답 헤더 정보:");
          console.log(`res. header : ${JSON.stringify(result?.data?.response?.header)}`);
          console.log(`totalCount : ${JSON.stringify(result?.data?.response?.body?.totalCount)}`);
        }
        
        if (item.length === 0) {
          console.log("더 이상 처리할 데이터가 없습니다.");
          break;
        }

        const isinCdList = item.map(bond => bond.isinCd).join(', ');
        console.log(`--------------------------------`);
        console.log(`가져온 종목 : ${isinCdList}`);
        console.log(`페이지 : ${currentPage}`);

        currentPage++;

        await new Promise((resolve) => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(error);
        break;
      }
    }

  } catch (error) {
    console.log(error);
  } finally {
    console.log("finally ~ 끝");
  }
}

const startBondIssueScheduler = () => {
  cron.schedule(
    // "30 23 * * *", // 매일 오후 11시 30분에 실행
    "*/10 * * * * *", // 테스트용 10초 마다 실행
    fetchAndStoreBondIssueData,  
    {
      scheduled: true,
      timezone: "Asia/Seoul",
    }
  );
};


// 스케줄러 시작
startBondIssueScheduler();


// fetchAndStoreBondIssueData();
