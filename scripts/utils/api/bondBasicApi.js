const axios = require("axios");
const { getAPIFormatDate } = require("../formatters/dateFormatter");

class BondBasicApi {
  constructor(serviceKey) {
    this.serviceKey = serviceKey;
    this.baseUrl =
      "http://apis.data.go.kr/1160100/service/GetBondBasInfoService/getBondBasInfo";
  }

  async fetchData(pageNo = 1) {
    try {
      const params = {
        serviceKey: decodeURIComponent(this.serviceKey),
        resultType: "json",
        numOfRows: 9999,
        pageNo: pageNo,
        basDt: getAPIFormatDate(),
      };

      const response = await axios.get(this.baseUrl, { params });
      return response.data?.response?.body;
    } catch (error) {
      throw new Error(`채권기본정보 API 호출 실패: ${error.message}`);
    }
  }

  formatData(item) {
    return {
      bas_dt: item.basDt.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
      crno: item.crno,
      isin_cd: item.isinCd,
      scrs_itms_kcd: item.scrsItmsKcd,
      scrs_itms_kcd_nm: item.scrsItmsKcdNm,
      bond_isur_nm: item.bondIsurNm,
      isin_cd_nm: item.isinCdNm,
      bond_issu_dt: item.bondIssuDt?.replace(
        /(\d{4})(\d{2})(\d{2})/,
        "$1-$2-$3"
      ),
      bond_issu_amt: item.bondIssuAmt,
      bond_issu_cur_cd: item.bondIssuCurCd,
      bond_issu_cur_cd_nm: item.bondIssuCurCdNm,
      optn_tcd: item.optnTcd,
      optn_tcd_nm: item.optnTcdNm,
      sic_nm: item.sicNm,
      bond_expr_dt: item.bondExprDt?.replace(
        /(\d{4})(\d{2})(\d{2})/,
        "$1-$2-$3"
      ),
      int_cmpu_mcd: item.intCmpuMcd,
      int_cmpu_mcd_nm: item.intCmpuMcdNm,
      bond_pymt_amt: item.bondPymtAmt,
      irt_chng_dcd: item.irtChngDcd,
      irt_chng_dcd_nm: item.irtChngDcdNm,
      bond_srfc_inrt: item.bondSrfcInrt,
      bond_bal: item.bondBal,
      grn_dcd: item.grnDcd,
      grn_dcd_nm: item.grnDcdNm,
      bond_int_tcd: item.bondIntTcd,
      bond_int_tcd_nm: item.bondIntTcdNm,
      bond_rnkn_dcd: item.bondRnknDcd,
      bond_rnkn_dcd_nm: item.bondRnknDcdNm,
      pclr_bond_kcd: item.pclrBondKcd,
      pclr_bond_kcd_nm: item.pclrBondKcdNm,
      lstg_dt: item.lstgDt?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
      bond_offr_mcd: item.bondOffrMcd,
      bond_offr_mcd_nm: item.bondOffrMcdNm,
      txtn_dcd: item.txtnDcd,
      txtn_dcd_nm: item.txtnDcdNm,
      pamt_rdpt_mcd: item.pamtRdptMcd,
      pamt_rdpt_mcd_nm: item.pamtRdptMcdNm,
      strips_psbl_yn: item.stripsPsblYn,
      strips_nm: item.stripsNm,
      pris_lnkg_bond_yn: item.prisLnkgBondYn,
      piam_pay_inst_nm: item.piamPayInstNm,
      piam_pay_brof_nm: item.piamPayBrofNm,
      cpt_usge_dcd: item.cptUsgeDcd,
      cpt_usge_dcd_nm: item.cptUsgeDcdNm,
      bond_reg_inst_dcd: item.bondRegInstDcd,
      bond_reg_inst_dcd_nm: item.bondRegInstDcdNm,
      issu_dpty_nm: item.issuDptyNm,
      bond_undt_inst_nm: item.bondUndtInstNm,
      bond_grn_inst_nm: item.bondGrnInstNm,
      cpbd_mng_cmpy_nm: item.cpbdMngCmpyNm,
      crfnd_yn: item.crfndYn,
      prmnc_bond_yn: item.prmncBondYn,
      qib_trgt_scrt_yn: item.qibTrgtScrtYn,
      prmnc_bond_tmn_dt: item.prmncBondTmnDt?.replace(
        /(\d{4})(\d{2})(\d{2})/,
        "$1-$2-$3"
      ),
      rgt_exert_mnbd_dcd: item.rgtExertMnbdDcd,
      rgt_exert_mnbd_dcd_nm: item.rgtExertMnbdDcdNm,
      qib_tmn_dt: item.qibTmnDt?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
      int_pay_cycl_ctt: item.intPayCyclCtt,
      nxtm_copn_dt: item.nxtmCopnDt?.replace(
        /(\d{4})(\d{2})(\d{2})/,
        "$1-$2-$3"
      ),
      rbf_copn_dt: item.rbfCopnDt?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
      bnk_hldy_int_pydy_dcd: item.bnkHldyIntPydyDcd,
      bnk_hldy_int_pydy_dcd_nm: item.bnkHldyIntPydyDcdNm,
      sttr_hldy_int_pydy_dcd: item.sttrHldyIntPydyDcd,
      sttr_hldy_int_pydy_dcd_nm: item.sttrHldyIntPydyDcdNm,
      int_pay_mmnt_dcd: item.intPayMmntDcd,
      int_pay_mmnt_dcd_nm: item.intPayMmntDcdNm,
      elps_int_pay_yn: item.elpsIntPayYn,
      kis_scrs_itms_kcd: item.kisScrsItmsKcd,
      kis_scrs_itms_kcd_nm: item.kisScrsItmsKcdNm,
      kbp_scrs_itms_kcd: item.kbpScrsItmsKcd,
      kbp_scrs_itms_kcd_nm: item.kbpScrsItmsKcdNm,
      nice_scrs_itms_kcd: item.niceScrsItmsKcd,
      nice_scrs_itms_kcd_nm: item.niceScrsItmsKcdNm,
      fn_scrs_itms_kcd: item.fnScrsItmsKcd,
      fn_scrs_itms_kcd_nm: item.fnScrsItmsKcdNm,
    };
  }
}

module.exports = BondBasicApi;
