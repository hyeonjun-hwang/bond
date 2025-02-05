const axios = require("axios");
const { getAPIFormatDate } = require("../formatters/dateFormatter");
const logger = require("../logger");
const BASE_URL =
  "http://apis.data.go.kr/1160100/service/GetBondSecuritiesInfoService/getBondPriceInfo";

class BondPriceApi {
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
      console.log(": API 요청 파라미터:", params);
      console.log(
        ": API 응답 헤더 : ",
        JSON.stringify(response.data.response.header, null, 2)
      );
      return response.data;
    } catch (error) {
      console.error(": API 에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`BondPrice API 호출 실패: ${error.message}`);
    }
  }

  formatData(item) {
    return {
      bas_dt: item.basDt,
      srtn_cd: item.srtnCd,
      isin_cd: item.isinCd,
      itms_nm: item.itmsNm,
      mrkt_ctg: item.mrktCtg,
      xp_yr_cnt: item.xpYrCnt,
      itms_ctg: item.itmsCtg,
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
  }
}

module.exports = BondPriceApi;
