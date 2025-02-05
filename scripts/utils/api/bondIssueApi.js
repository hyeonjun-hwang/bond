const axios = require("axios");
const { getAPIFormatDate } = require("../formatters/dateFormatter");

const BASE_URL =
  "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat";

class BondIssueApi {
  constructor(serviceKey) {
    this.serviceKey = serviceKey;
  }

  async fetchData(pageNo = 1, numOfRows = 9999) {
    const params = {
      serviceKey: decodeURIComponent(this.serviceKey),
      pageNo: pageNo.toString(),
      numOfRows: numOfRows.toString(),
      resultType: "json",
      basDt: getAPIFormatDate(),
    };

    try {
      const response = await axios.get(BASE_URL, { params });
      // 전체 응답 구조 로깅
      console.log(
        "API 응답 해더 : ",
        JSON.stringify(response.data.response.header, null, 2)
      );
      return response.data?.response?.body;
    } catch (error) {
      // 에러 상세 정보 로깅
      console.error("API 에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`BondIssue API 호출 실패: ${error.message}`);
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

module.exports = BondIssueApi;
