require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const BondDetail = require("../../models/bondDetailModel");

const migrateBondDetailData = async () => {
  try {
    // 1. MongoDB 연결
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB 연결 성공");

    // 2. 기본 변수 설정
    const BASE_URL =
      "http://apis.data.go.kr/1160100/service/GetBondIssuInfoService/getBondBasiInfo";
    const numOfRows = 9999; // 한 페이지당 가져올 데이터 수
    const today = new Date("2025-01-07")
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ""); // 지정 날짜 - YYYYMMDD 형식
    let totalProcessed = 0; // 전체 처리된 데이터 수
    let totalNew = 0; // 새로 생성된 데이터 수
    let totalUpdated = 0; // 업데이트된 데이터 수
    let currentPage = 1; // 현재 페이지
    let hasMoreData = true; // 더 가져올 데이터 있는지 확인

    // 3. 마이그레이션 시작 로그
    console.log("=== 채권기본정보 마이그레이션 시작 ===");
    console.log(`시작 시간: ${new Date().toLocaleString()}`);

    // 4. 데이터 가져오기 및 처리 루프
    while (hasMoreData) {
      try {
        // 4-1. API 요청 파라미터 설정
        const params = {
          serviceKey: decodeURIComponent(
            process.env.BOND_DETAIL_SERVICE_KEY_ENCODING
          ),
          pageNo: currentPage.toString(),
          numOfRows: numOfRows.toString(),
          resultType: "json",
          basDt: today,
        };

        // 4-2. 현재 페이지 처리 시작 로그
        console.log(`\n${currentPage}페이지 처리 중...`);

        // 4-3. API 요청 실행
        const response = await axios.get(BASE_URL, { params });

        // 4-4. API 응답 데이터 확인
        if (!response.data?.response?.body) {
          // Optional Chaining 사용
          // response.data가 존재하는지
          // response.data.response가 존재하는지
          // response.data.response.body가 존재하는지
          console.error(
            // 위 세가지 중 중 하나라도 실패하면 전체 응답 구조를 출력(JSON.stringify)
            "API 응답 전체 구조:",
            JSON.stringify(response.data, null, 2) // null,2는 보기 좋게 포맷팅
          );
          throw new Error("API 응답에 body가 없습니다.");
        }

        // 4-5. 응답 데이터 구조 확인 및 로깅
        const responseBody = response.data.response.body;
        console.log("페이지 응답 구조:", {
          totalCount: responseBody.totalCount,
          numOfRows: responseBody.numOfRows,
          pageNo: responseBody.pageNo,
          hasItems: !!responseBody.items,
        });

        // 4-6. 데이터가 없는 경우 종료
        if (!responseBody.items) {
          console.log("더 이상 데이터가 없습니다.");
          break;
        }

        // 4-7. 응답 데이터 배열 형식 확인 및 변환
        const bondItems = Array.isArray(responseBody.items.item) // Array.isArray()는 배열인지 확인(true, false)하는 메서드
          ? responseBody.items.item // 이미 배열이면 그대로 사용 (?는 true 일때)
          : [responseBody.items.item]; // 배열이 아니면 배열로 변환 (:는 false 일때)

        // 4-8. 페이지 데이터 없음 체크
        if (!bondItems.length) {
          console.log("페이지에 데이터가 없습니다.");
          break;
        }

        let pageProcessed = 0; // 현재 페이지에서 처리된 데이터 수

        // 4-9. 각 채권 데이터 MongoDB에 저장
        for (const item of bondItems) {
          try {
            // 기존 데이터 확인
            const existingDoc = await BondDetail.findOne({
              isinCd: item.isinCd, // isinCd를 unique key로 사용
            });

            // 데이터 저장 로직
            if (existingDoc) {
              // 기존 데이터가 있는 경우 업데이트
              await BondDetail.findOneAndUpdate(
                { isinCd: item.isinCd }, // 검색 조건
                item, // 새로운 데이터
                { new: true } // 업데이트된 문서 반환
              );
              totalUpdated++;
            } else {
              // 새로운 데이터 생성
              await BondDetail.create(item);
              totalNew++;
            }
            pageProcessed++; // 처리된 데이터 카운트 증가
          } catch (dbError) {
            // 개별 데이터 저장 실패 시 에러 처리
            console.error(
              `데이터 저장 중 오류 (isinCd: ${item.isinCd}):`,
              dbError.message
            );
          }
        }

        // 4-10. 처리 현황 업데이트
        totalProcessed += pageProcessed;
        console.log(
          `처리된 데이터: ${totalProcessed}/${responseBody.totalCount}`
        );
        console.log(`신규: ${totalNew}, 업데이트: ${totalUpdated}`);

        // 4-11. 다음 페이지 존재 여부 확인
        hasMoreData = totalProcessed < parseInt(responseBody.totalCount);
        currentPage++;

        // 4-12. API 호출 간 딜레이
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (pageError) {
        // 4-13. 페이지 처리 중 에러 발생 시
        console.error(`${currentPage}페이지 처리 중 오류:`, pageError.message);
        if (pageError.response) {
          console.error("API 에러 응답:", pageError.response.data);
        }
        // 에러 발생해도 다음 페이지 계속 시도
        currentPage++;
        continue;
      }
    }

    // 5. 마이그레이션 완료 로그
    console.log("\n=== 채권 데이터 마이그레이션 완료 ===");
    console.log(`종료 시간: ${new Date().toLocaleString()}`);
    console.log(`총 처리 데이터: ${totalProcessed}`);
    console.log(`신규 저장: ${totalNew}`);
    console.log(`업데이트: ${totalUpdated}`);
  } catch (error) {
    // 6. 전체 프로세스 에러 처리
    console.error("마이그레이션 중 오류 발생:", error);
  } finally {
    // 7. MongoDB 연결 종료
    await mongoose.disconnect();
    console.log("MongoDB 연결 종료");
  }
};

// 스크립트 실행
migrateBondDetailData();
