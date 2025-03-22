require("dotenv").config();
const axios = require("axios");
const { getAPIFormatDate } = require("../formatters/dateFormatter");

const BASE_URL =
  "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat";

class BondIssueApi2 {
  constructor(serviceKey) {
    this.serviceKey = serviceKey;
  }

  async fetchData(pageNo = 1, numOfRows = 1) {
    const params = {
      serviceKey: this.serviceKey,
      pageNo: pageNo.toString(),
      numOfRows: numOfRows.toString(),
      resultType: "json",
      basDt: getAPIFormatDate(),
    };

    try {
      console.log(
        `[bondIssue]\nAPI request : ${JSON.stringify(params, (key, value) =>
          key === "serviceKey" || key === "resultType" ? undefined : value
        )}`,
        `\n${"-".repeat(70)}`
      );

      const response = await axios.get(BASE_URL, { params });

      if (!response.data || !response.data.response) {
        // 예상 구조가 아니면 에러 던지기
        const error = new Error("API 응답 구조가 예상과 다릅니다");
        error.originalResponse = response.data;
        throw error;
      }

      console.log(
        `API response header : ${JSON.stringify(response.data.response.header)}`
      );
      console.log(
        `totalCount : ${JSON.stringify(
          response.data.response.body.totalCount,
          null,
          2
        )}`,
        `\npageNo : ${JSON.stringify(
          response.data.response.body.pageNo,
          null,
          2
        )}`,
        `\nnumOfRows : ${JSON.stringify(
          response.data.response.body.numOfRows,
          null,
          2
        )}`,
        `\n${"-".repeat(70)}`
      );
      return response.data?.response?.body;
    } catch (error) {
      console.error(error);
    }
  }

  formatData(item) {
    return {
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
      bond_issu_amt: item.bondIssuAmt ? parseFloat(item.bondIssuAmt) : null,
      bond_issu_cur_cd: item.bondIssuCurCd,
      bond_issu_cur_cd_nm: item.bondIssuCurCdNm,
      bond_expr_dt: item.bondExprDt?.replace(
        /(\d{4})(\d{2})(\d{2})/,
        "$1-$2-$3"
      ),
      bond_pymt_amt: item.bondPymtAmt ? parseFloat(item.bondPymtAmt) : null,
      irt_chng_dcd: item.irtChngDcd,
      irt_chng_dcd_nm: item.irtChngDcdNm,
      bond_srfc_inrt: item.bondSrfcInrt ? parseFloat(item.bondSrfcInrt) : null,
      bond_int_tcd: item.bondIntTcd,
      bond_int_tcd_nm: item.bondIntTcdNm,
    };
  }
}

// const bondIssueApi2 = new BondIssueApi2(
//   process.env.BOND_ISSUE_SERVICE_KEY_DECODING
// );

// async function fetchFormatRun() {
//   try {
//     const result = await bondIssueApi2.fetchData(1, 10); // (pageNo = 1, numOfRows = 1)
//     const data = result.items.item;
//     const formattedData = data.map((item) => bondIssueApi2.formatData(item));

//     console.log(JSON.stringify(formattedData, ["isin_cd", "isin_cd_nm"], 2));
//   } catch (error) {
//     console.error(error);
//   }
// }
// fetchFormatRun();

module.exports = BondIssueApi2;
