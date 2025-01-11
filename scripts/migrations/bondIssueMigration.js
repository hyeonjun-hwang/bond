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
    const today = new Date("2025-01-11")
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
      try {
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

        // API 응답 구조 확인
        if (!response.data?.response?.body) {
          // Optional Chaining 사용
          console.error(
            "API 응답 전체 구조:",
            JSON.stringify(response.data, null, 2) // 보기 좋게 포맷팅
          );
          throw new Error("API 응답에 body가 없습니다.");
        }

        const responseBody = response.data.response.body;
        console.log("페이지 응답 구조:", {
          totalCount: responseBody.totalCount,
          numOfRows: responseBody.numOfRows,
          pageNo: responseBody.pageNo,
          hasItems: !!responseBody.items,
        });

        if (!responseBody.items) {
          console.log("더 이상 데이터가 없습니다.");
          break;
        }

        const bondItems = Array.isArray(responseBody.items.item)
          ? responseBody.items.item
          : [responseBody.items.item];

        if (!bondItems.length) {
          console.log("페이지에 데이터가 없습니다.");
          break;
        }

        let pageProcessed = 0;

        // MongoDB에 저장
        for (const item of bondItems) {
          try {
            const existingDoc = await BondIssue.findOne({
              isinCd: item.isinCd,
            });
            if (existingDoc) {
              await BondIssue.findOneAndUpdate({ isinCd: item.isinCd }, item, {
                new: true,
              });
              totalUpdated++;
            } else {
              await BondIssue.create(item);
              totalNew++;
            }
            pageProcessed++;
          } catch (dbError) {
            console.error(
              `데이터 저장 중 오류 (isinCd: ${item.isinCd}):`,
              dbError.message
            );
          }
        }

        totalProcessed += pageProcessed;
        console.log(
          `처리된 데이터: ${totalProcessed}/${responseBody.totalCount}`
        );
        console.log(`신규: ${totalNew}, 업데이트: ${totalUpdated}`);

        hasMoreData = totalProcessed < parseInt(responseBody.totalCount);
        currentPage++;

        // API 호출 간 짧은 딜레이
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (pageError) {
        console.error(`${currentPage}페이지 처리 중 오류:`, pageError.message);
        if (pageError.response) {
          console.error("API 에러 응답:", pageError.response.data);
        }
        // 에러 발생해도 다음 페이지 계속 시도
        currentPage++;
        continue;
      }
    }

    console.log("\n=== 채권 데이터 마이그레이션 완료 ===");
    console.log(`종료 시간: ${new Date().toLocaleString()}`);
    console.log(`총 처리 데이터: ${totalProcessed}`);
    console.log(`신규 저장: ${totalNew}`);
    console.log(`업데이트: ${totalUpdated}`);
  } catch (error) {
    console.error("마이그레이션 중 오류 발생:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB 연결 종료");
  }
};

// 스크립트 실행
migrateBondIssueData();
