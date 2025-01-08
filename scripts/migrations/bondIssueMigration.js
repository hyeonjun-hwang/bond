require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const BondIssue = require("../../models/bondIssueModel");

const migrateBondIssueData = async () => {
  try {
    // MongoDB 연결 (DB_URL로 변경)
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB 연결 성공");

    const BASE_URL =
      "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat";
    const numOfRows = 2500;

    // const today = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // 현재 날짜 - YYYYMMDD 형식
    const today = new Date("2025-01-08")
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ""); // 지정 날짜 - YYYYMMDD 형식

    let totalProcessed = 0;
    let totalNew = 0;
    let totalUpdated = 0;
    let currentPage = 1;
    let hasMoreData = true;

    console.log("=== 채권 데이터 마이그레이션 시작 ===");
    console.log(`시작 시간: ${new Date().toLocaleString()}`);

    while (hasMoreData) {
      // 전체 데이터 조회 파라미터
      const params = {
        serviceKey: decodeURIComponent(
          process.env.BOND_ISSUE_SERVICE_KEY_ENCODING
        ),
        pageNo: currentPage.toString(),
        numOfRows: numOfRows.toString(),
        resultType: "json",
        basDt: today, // 오늘 날짜 기준 데이터만 조회
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

      // MongoDB에 저장
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

      // 다음 페이지 확인
      hasMoreData = totalProcessed < parseInt(totalCount);
      currentPage++;

      // 진행상황 로깅
      console.log(`처리된 데이터: ${totalProcessed}/${totalCount}`);
      console.log(`신규: ${totalNew}, 업데이트: ${totalUpdated}`);
    }

    console.log("\n=== 채권 데이터 마이그레이션 완료 ===");
    console.log(`종료 시간: ${new Date().toLocaleString()}`);
    console.log(`총 처리 데이터: ${totalProcessed}`);
    console.log(`신규 저장: ${totalNew}`);
    console.log(`업데이트: ${totalUpdated}`);
  } catch (error) {
    console.error("마이그레이션 중 오류 발생:", error);
  } finally {
    // MongoDB 연결 종료
    await mongoose.disconnect();
    console.log("MongoDB 연결 종료");
    process.exit();
  }
};

// 스크립트 실행
migrateBondIssueData();
