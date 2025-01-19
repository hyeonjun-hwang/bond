require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const BondPrice = require("../../models/bondPriceModel");

const migrateBondPriceData = async () => {
  try {
    // 1. MongoDB 연결
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB 연결 성공");

    // 2. 기본 변수 설정
    const BASE_URL =
      "http://apis.data.go.kr/1160100/service/GetBondSecuritiesInfoService/getBondPriceInfo";
    const numOfRows = 9999; // 한 페이지당 가져올 데이터 수
    // const today = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // 오늘 날짜 - YYYYMMDD 형식
    let totalProcessed = 0;
    let totalNew = 0;
    let totalUpdated = 0;
    let currentPage = 1;
    let hasMoreData = true;
    const itmsNm = "KR6019802F16"; //하나캐피탈447-1

    // 3. 마이그레이션 시작 로그
    console.log("=== 채권시세정보 마이그레이션 시작 ===");
    console.log(`시작 시간: ${new Date().toLocaleString()}`);

    // 4. 데이터 가져오기 및 처리 루프
    while (hasMoreData) {
      try {
        // 4-1. API 요청 파라미터 설정
        const params = {
          serviceKey: decodeURIComponent(
            process.env.BOND_PRICE_SERVICE_KEY_ENCODING
          ),
          pageNo: currentPage.toString(),
          numOfRows: numOfRows.toString(),
          resultType: "json",
          //   basDt: today,
          itmsNm: itmsNm,
        };

        console.log(`\n${currentPage}페이지 처리 중...`);

        const response = await axios.get(BASE_URL, { params });

        if (!response.data?.response?.body) {
          console.error(
            "API 응답 전체 구조:",
            JSON.stringify(response.data, null, 2)
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

        const priceItems = Array.isArray(responseBody.items.item)
          ? responseBody.items.item
          : [responseBody.items.item];

        if (!priceItems.length) {
          console.log("페이지에 데이터가 없습니다.");
          break;
        }

        let pageProcessed = 0;

        // 4-9. 각 시세 데이터 MongoDB에 저장
        for (const item of priceItems) {
          try {
            // 숫자형 필드 변환
            const processedItem = {
              ...item,
              clprPrc: Number(item.clprPrc),
              clprVs: Number(item.clprVs),
              clprBnfRt: Number(item.clprBnfRt),
              mkpPrc: Number(item.mkpPrc),
              mkpBnfRt: Number(item.mkpBnfRt),
              hiprPrc: Number(item.hiprPrc),
              hiprBnfRt: Number(item.hiprBnfRt),
              loprPrc: Number(item.loprPrc),
              loprBnfRt: Number(item.loprBnfRt),
              trqu: Number(item.trqu),
              trPrc: Number(item.trPrc),
            };

            // 기존 데이터 확인 (같은 날짜, 같은 종목의 데이터가 있는지)
            const existingDoc = await BondPrice.findOne({
              basDt: item.basDt,
              isinCd: item.isinCd,
            });

            if (existingDoc) {
              await BondPrice.findOneAndUpdate(
                { basDt: item.basDt, isinCd: item.isinCd },
                processedItem,
                { new: true }
              );
              totalUpdated++;
            } else {
              await BondPrice.create(processedItem);
              totalNew++;
            }
            pageProcessed++;
          } catch (dbError) {
            console.error(
              `데이터 저장 중 오류 (isinCd: ${item.isinCd}, basDt: ${item.basDt}):`,
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

        // API 호출 간 딜레이
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (pageError) {
        console.error(`${currentPage}페이지 처리 중 오류:`, pageError.message);
        if (pageError.response) {
          console.error("API 에러 응답:", pageError.response.data);
        }
        currentPage++;
        continue;
      }
    }

    // 5. 마이그레이션 완료 로그
    console.log("\n=== 채권시세정보 마이그레이션 완료 ===");
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
migrateBondPriceData();
