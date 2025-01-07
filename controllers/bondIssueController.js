const axios = require("axios");
const BondIssue = require("../models/bondIssueModel");
const asyncHandler = require("express-async-handler");

const fetchBondIssueData = asyncHandler(async (req, res) => {
  try {
    const BASE_URL =
      "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat";
    const numOfRows = 2500; // 한 번에 가져올 최대 데이터 수

    // 한국 시간 기준으로 현재 날짜 가져오기
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

    console.log(`=== ${today} 채권 데이터 수집 시작 ===`);

    while (hasMoreData) {
      const params = {
        serviceKey: decodeURIComponent(
          process.env.BOND_ISSUE_SERVICE_KEY_ENCODING
        ),
        pageNo: currentPage.toString(),
        numOfRows: numOfRows.toString(),
        resultType: "json",
        basDt: today, // 현재 날짜 기준 데이터 조회
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
      allBondItems = allBondItems.concat(bondItems);

      // 다음 페이지 확인
      hasMoreData = totalProcessed < parseInt(totalCount);
      currentPage++;

      // 진행상황 로깅
      console.log(`처리된 데이터: ${totalProcessed}/${totalCount}`);
      console.log(`신규: ${totalNew}, 업데이트: ${totalUpdated}`);
    }

    console.log(`\n=== ${today} 채권 데이터 수집 완료 ===`);
    console.log(`종료 시간: ${new Date().toLocaleString()}`);
    console.log(`총 처리 데이터: ${totalProcessed}`);
    console.log(`신규 저장: ${totalNew}`);
    console.log(`업데이트: ${totalUpdated}`);

    res.status(200).json({
      success: true,
      message: "채권 데이터 갱신 완료",
      date: today,
      pagination: {
        pageNo: currentPage - 1,
        numOfRows,
        totalCount: totalProcessed,
      },
      processResult: {
        processedCount: totalProcessed,
        newCount: totalNew,
        updateCount: totalUpdated,
      },
      data: allBondItems,
    });
  } catch (error) {
    console.error("채권 데이터 처리 중 오류:", error);
    throw error;
  }
});

module.exports = {
  fetchBondIssueData,
};
