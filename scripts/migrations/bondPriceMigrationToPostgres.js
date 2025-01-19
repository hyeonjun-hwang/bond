require("dotenv").config();
const axios = require("axios");
const { Sequelize } = require("sequelize");

const migrateBondPriceDataToPostgres = async () => {
  let sequelize;
  try {
    // 1. PostgreSQL 연결
    sequelize = new Sequelize(
      process.env.POSTGRES_DB,
      process.env.POSTGRES_USER,
      process.env.POSTGRES_PASSWORD,
      {
        host: process.env.POSTGRES_HOST,
        dialect: "postgres",
        logging: false, // 완전히 로깅 비활성화
      }
    );

    // Sequelize 모델 초기화 (한 번만)
    const models = require("../../models");
    const BondPrice = models.BondPrice;

    // 2. 기본 변수 설정
    const BASE_URL =
      "http://apis.data.go.kr/1160100/service/GetBondSecuritiesInfoService/getBondPriceInfo";
    const numOfRows = 9999;
    let totalProcessed = 0;
    let totalNew = 0;
    let currentPage = 1;
    let totalCount = 0;
    const TEST_MODE = false;

    // 3. 마이그레이션 시작 로그
    console.log("=== PostgreSQL 채권시세정보 마이그레이션 시작 ===");
    console.log(`시작 시간: ${new Date().toLocaleString()}`);

    // 현재 DB의 데이터 수 확인
    const currentDBCount = await BondPrice.count();
    console.log(`현재 DB 데이터 수: ${currentDBCount}`);

    // 4. 데이터 처리 루프
    while (true) {
      try {
        let pageSuccess = 0;
        let pageFailed = 0;

        // API 요청 파라미터 설정
        const params = {
          serviceKey: decodeURIComponent(
            process.env.BOND_PRICE_SERVICE_KEY_ENCODING
          ),
          pageNo: currentPage.toString(),
          numOfRows: numOfRows.toString(),
          resultType: "json",
        };

        console.log(`\n${currentPage}페이지 처리 중...`);
        const response = await axios.get(BASE_URL, { params });

        // 첫 페이지에서 전체 데이터 수 확인
        if (currentPage === 1) {
          totalCount = response.data?.response?.body?.totalCount || 0;
          console.log(`전체 데이터 수: ${totalCount}`);
        }

        // API 응답 구조 확인
        console.log("API 응답 구조:", {
          header: response.data?.response?.header,
          totalCount: response.data?.response?.body?.totalCount,
          numOfRows: response.data?.response?.body?.numOfRows,
          pageNo: response.data?.response?.body?.pageNo,
          itemsCount: response.data?.response?.body?.items?.item?.length || 0,
        });

        // API 응답 데이터 파싱
        const items = response.data?.response?.body?.items?.item || [];
        if (currentPage > Math.ceil(totalCount / numOfRows)) {
          console.log("모든 데이터 처리 완료");
          break;
        }

        // 데이터 변환 및 저장
        for (const item of items) {
          try {
            // PostgreSQL 형식에 맞게 데이터 변환
            const formatDate = (dateStr) => {
              return `${dateStr.slice(0, 4)}-${dateStr.slice(
                4,
                6
              )}-${dateStr.slice(6, 8)}`;
            };

            // 데이터 유효성 검사 및 상세 로깅
            const validateData = (item) => {
              const issues = [];

              if (!item.basDt) issues.push("basDt 없음");
              if (!item.isinCd) issues.push("isinCd 없음");

              // 숫자 필드 검증
              const numericFields = {
                clpr_prc: item.clprPrc,
                clpr_vs: item.clprVs,
                clpr_bnf_rt: item.clprBnfRt,
                mkp_prc: item.mkpPrc,
                mkp_bnf_rt: item.mkpBnfRt,
                hipr_prc: item.hiprPrc,
                hipr_bnf_rt: item.hiprBnfRt,
                lopr_prc: item.loprPrc,
                lopr_bnf_rt: item.loprBnfRt,
                tr_qu: item.trqu,
                tr_prc: item.trPrc,
              };

              Object.entries(numericFields).forEach(([field, value]) => {
                if (value && isNaN(parseFloat(value))) {
                  issues.push(`${field}: 숫자변환 실패 (${value})`);
                }
              });

              return issues;
            };

            const bondPriceData = {
              bas_dt: formatDate(item.basDt),
              isin_cd: item.isinCd,
              srtn_cd: item.srtnCd,
              itms_nm: item.itmsNm,
              mrkt_ctg: item.mrktCtg,
              clpr_prc: item.clprPrc ? parseFloat(item.clprPrc) : null,
              clpr_vs: item.clprVs ? parseFloat(item.clprVs) : null,
              clpr_bnf_rt: item.clprBnfRt ? parseFloat(item.clprBnfRt) : null,
              mkp_prc: item.mkpPrc ? parseFloat(item.mkpPrc) : null,
              mkp_bnf_rt: item.mkpBnfRt ? parseFloat(item.mkpBnfRt) : null,
              hipr_prc: item.hiprPrc ? parseFloat(item.hiprPrc) : null,
              hipr_bnf_rt: item.hiprBnfRt ? parseFloat(item.hiprBnfRt) : null,
              lopr_prc: item.loprPrc ? parseFloat(item.loprPrc) : null,
              lopr_bnf_rt: item.loprBnfRt ? parseFloat(item.loprBnfRt) : null,
              tr_qu: item.trqu ? parseFloat(item.trqu) : null,
              tr_prc: item.trPrc ? parseFloat(item.trPrc) : null,
            };

            const validationIssues = validateData(item);
            if (validationIssues.length > 0) {
              console.error(`\n데이터 검증 실패:
                - ISIN: ${item.isinCd}
                - 종목명: ${item.itmsNm}
                - 기준일: ${item.basDt}
                - 문제: ${validationIssues.join(", ")}
                - 원본 데이터: ${JSON.stringify(item, null, 2)}
              `);
              throw new Error("데이터 유효성 검사 실패");
            }

            // 데이터 저장 부분을 upsert로 변경
            await BondPrice.upsert(bondPriceData, {
              conflictFields: ["bas_dt", "isin_cd", "mrkt_ctg"], // unique constraint 필드 3개로 수정
            });
            totalNew++;
            totalProcessed++;
            pageSuccess++;
          } catch (error) {
            pageFailed++;
            console.error(
              `\n데이터 처리 중 오류:
              - ISIN: ${item.isinCd}
              - 종목명: ${item.itmsNm}
              - 기준일: ${item.basDt}
              - 에러: ${error.message}
              - 상세: ${JSON.stringify(error, null, 2)}`
            );
          }
        }

        // 페이지 처리 결과 출력
        console.log(`${currentPage}페이지 처리 결과:`);
        console.log(`- 성공: ${pageSuccess}개`);
        console.log(`- 실패: ${pageFailed}개`);
        console.log(`- 총 처리: ${pageSuccess + pageFailed}개`);
        console.log(
          `- 전체 진행률: ${((totalProcessed / totalCount) * 100).toFixed(2)}%`
        );
        console.log(
          `- 누적 처리: ${totalProcessed}/${totalCount} (실패: ${
            totalCount - totalProcessed
          })`
        );

        // API 호출 간격 추가 (1초)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        currentPage++;
      } catch (error) {
        console.error("API 요청 중 오류:", error.message);
        if (error.response?.status === 500) {
          console.log(
            `API 서버 오류 (페이지: ${currentPage}) - 1분 대기 후 재시도...`
          );
          await new Promise((resolve) => setTimeout(resolve, 60000));
          continue; // 현재 페이지 재시도
        }
        console.log(`치명적 오류로 마이그레이션 중단 (페이지: ${currentPage})`);
        break;
      }
    }

    // 6. 마이그레이션 완료 로그
    console.log("\n=== 채권시세정보 마이그레이션 완료 ===");
    console.log(`종료 시간: ${new Date().toLocaleString()}`);
    console.log(`총 처리 데이터: ${totalProcessed}`);
    console.log(`신규 저장: ${totalNew}`);
  } catch (error) {
    console.error("초기 설정 중 오류:", error);
  } finally {
    // 7. DB 연결 종료
    await sequelize.close();
  }
};

// 스크립트 실행
migrateBondPriceDataToPostgres();
