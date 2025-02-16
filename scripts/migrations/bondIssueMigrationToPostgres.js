require("dotenv").config();
const axios = require("axios");
const { Sequelize } = require("sequelize");
const config = require("../../config/database.js")[
  process.env.NODE_ENV || "development"
];

const BASE_URL =
  "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat";
const MAX_RETRIES = 3;
const DELAY_BETWEEN_CALLS = 1000;

const fetchWithRetry = async (url, params, retries = MAX_RETRIES) => {
  try {
    const response = await axios.get(url, { params });
    return response.data?.response?.body || null;
  } catch (error) {
    if (retries > 0) {
      console.log(`API 호출 실패, ${retries}회 재시도...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_CALLS));
      return fetchWithRetry(url, params, retries - 1);
    }
    throw error;
  }
};

const migrateBondIssueDataToPostgres = async () => {
  try {
    // PostgreSQL 연결
    const sequelize = new Sequelize(
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

    console.log("=== PostgreSQL 채권발행정보 마이그레이션 시작 ===");
    console.log(`시작 시간: ${new Date().toLocaleString()}`);

    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    let pageNo = 1;
    const errors = [];
    const processedIsinCodes = new Set();

    // 첫 페이지 요청으로 전체 건수 확인
    const firstPageParams = {
      serviceKey: decodeURIComponent(
        process.env.BOND_ISSUE_SERVICE_KEY_ENCODING
      ),
      resultType: "json",
      numOfRows: 9999,
      pageNo: 1,
    };

    const firstResponse = await fetchWithRetry(BASE_URL, firstPageParams);
    if (!firstResponse) {
      throw new Error("API 응답이 없습니다.");
    }

    const totalCount = firstResponse?.totalCount;
    // console.log("첫 페이지 응답:", JSON.stringify(firstResponse, null, 2));

    if (!totalCount) {
      throw new Error("API에서 전체 데이터 건수를 가져올 수 없습니다.");
    }

    console.log(`전체 데이터 건수: ${totalCount}`);
    const totalPages = Math.ceil(totalCount / firstPageParams.numOfRows);
    console.log(`총 페이지 수: ${totalPages}`);

    while (true) {
      const params = {
        serviceKey: decodeURIComponent(
          process.env.BOND_ISSUE_SERVICE_KEY_ENCODING
        ),
        resultType: "json",
        numOfRows: 9999,
        pageNo: pageNo,
        basDt: "20250216", // 임시
      };

      const response = await fetchWithRetry(BASE_URL, params);
      if (!response?.items?.item) {
        console.error("페이지 응답 오류:", JSON.stringify(response, null, 2));
        break;
      }
      const items = response?.items?.item || [];

      if (items.length === 0) {
        break;
      }

      console.log(
        `\n=== 페이지 ${pageNo}/${totalPages} 처리 중... (${items.length}건) ===`
      );

      let pageSuccessCount = 0;
      let pageErrorCount = 0;

      for (const item of items) {
        try {
          const bondIssueData = {
            bas_dt: item.basDt.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
            crno: item.crno,
            scrs_itms_kcd: item.scrsItmsKcd,
            isin_cd: item.isinCd,
            scrs_itms_kcd_nm: item.scrsItmsKcdNm,
            bond_isur_nm: item.bondIsurNm,
            isin_cd_nm: item.isinCdNm,
            bond_issu_dt: item.bondIssuDt?.replace(
              /(\d{4})(\d{2})(\d{2})/,
              "$1-$2-$3"
            ),
            bond_issu_frmt_nm: item.bondIssuFrmtNm,
            bond_issu_amt: item.bondIssuAmt,
            bond_issu_cur_cd: item.bondIssuCurCd,
            bond_issu_cur_cd_nm: item.bondIssuCurCdNm,
            bond_expr_dt: item.bondExprDt?.replace(
              /(\d{4})(\d{2})(\d{2})/,
              "$1-$2-$3"
            ),
            bond_pymt_amt: item.bondPymtAmt,
            irt_chng_dcd: item.irtChngDcd,
            irt_chng_dcd_nm: item.irtChngDcdNm,
            bond_srfc_inrt: item.bondSrfcInrt,
            bond_int_tcd: item.bondIntTcd,
            bond_int_tcd_nm: item.bondIntTcdNm,
          };

          processedIsinCodes.add(item.isinCd);

          const existingBond = await BondIssue.findOne({
            where: {
              isin_cd: item.isinCd,
            },
          });

          if (existingBond) {
            await existingBond.update(bondIssueData);
          } else {
            await BondIssue.create(bondIssueData);
          }

          pageSuccessCount++;
          totalSuccessCount++;
        } catch (error) {
          pageErrorCount++;
          totalErrorCount++;
          errors.push({ isinCode: item.isinCd, error: error.message });
        }
      }

      console.log(`처리 결과:
        성공: ${pageSuccessCount} / 실패: ${pageErrorCount}
        누적 처리: ${totalSuccessCount}건
        진행률: ${((totalSuccessCount / totalCount) * 100).toFixed(2)}%
      `);

      pageNo++;
      if (pageNo > totalPages) {
        console.log("모든 페이지 처리 완료");
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_CALLS));
    }

    console.log("\n=== 채권발행정보 마이그레이션 완료 ===");
    console.log(
      `최종 결과: 성공 ${totalSuccessCount}건 / 실패 ${totalErrorCount}건`
    );

    if (errors.length > 0) {
      console.log(`\n실패 건수: ${errors.length}`);
      if (errors.length > 0) {
        console.log(`첫 번째 에러 메시지: ${errors[0].error}`);
      }
    }

    console.log(`종료 시간: ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error("초기 설정 중 오류:", error);
  }
};

migrateBondIssueDataToPostgres();
