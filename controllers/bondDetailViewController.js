const asyncHandler = require("express-async-handler");
const { BondIssue, BondPrice, BondBasic } = require("../models");
const { Op } = require("sequelize");

const getBondDetail = asyncHandler(async (req, res) => {
  try {
    const isinCd = req.params.id;

    // 채권 기본 정보 조회
    const bondDetail = await BondBasic.findOne({
      where: { isin_cd: isinCd },
      attributes: [
        "isin_cd", // ISIN코드
        "isin_cd_nm", // ISIN코드명
        "bond_issu_dt", // 채권발행일
        "bond_expr_dt", // 채권만기일
        "bond_srfc_inrt", // 표면금리
        "irt_chng_dcd_nm", // 금리변동구분명
        "bond_issu_amt", // 채권발행금액
        "bond_isur_nm", // 채권발행기관명
        "scrs_itms_kcd_nm", // 유가증권종류명
        "bond_int_tcd_nm", // 채권 이자 유형
        "grn_dcd_nm", // 보증구분코드명
        "bond_rnkn_dcd_nm", // 채권순위구분코드명
        "optn_tcd_nm", // 옵션유형코드명
        "pclr_bond_kcd_nm", // 특이채권종류코드명
        "bond_offr_mcd_nm", // 채권모집방법코드명
        "lstg_dt", // 상장일자
        "strips_psbl_yn", // 스트립스 가능 여부
        "strips_nm", // 스트립스채권명
        "prmnc_bond_yn", // 영구채권여부
        "int_pay_cycl_ctt", // 이자 지급 주기
        "int_pay_mmnt_dcd_nm", // 이자지급시기구분코드명
        "crno", // 법인등록번호
        "sic_nm", // 표준산업분류명
        "pris_lnkg_bond_yn", // 물가연동채권여부
        "pamt_rdpt_mcd_nm", // 원금상환방법코드명
        "bond_reg_inst_dcd_nm", // 채권등록기관구분코드명
        "int_cmpu_mcd_nm", // 이자산정방법코드명
        "bond_pymt_amt", // 채권납입금액
        "bond_bal", // 채권잔액
        "kis_scrs_itms_kcd_nm", // 한국신용평가유가증권종목종류코드명
        "kbp_scrs_itms_kcd_nm", // 한국자산평가유가증권종목종류코드명
        "nice_scrs_itms_kcd_nm", // NICE평가정보유가증권종목종류코드명
        "fn_scrs_itms_kcd_nm", // FN유가증권종목종류코드명
      ],
      raw: true,
    });

    if (!bondDetail) {
      return res.status(404).render("error", {
        layout: "../views/layouts/main",
        title: "에러",
        message: "해당 채권을 찾을 수 없습니다.",
      });
    }

    // 최신 시세 정보 조회
    const latestPrice = await BondPrice.findOne({
      where: { isin_cd: isinCd },
      order: [["bas_dt", "DESC"]],
      attributes: [
        "bas_dt",
        "clpr_prc", // 종가
        "clpr_vs", // 전일대비
        "clpr_bnf_rt", // 수익률
      ],
      raw: true,
    });

    // 데이터 포맷팅
    const formattedBondDetail = {
      isinCd: bondDetail.isin_cd,
      isinCdNm: bondDetail.isin_cd_nm,
      bondIssuDt: bondDetail.bond_issu_dt.slice(2).replace(/-/g, "."),
      bondExprDt: bondDetail.bond_expr_dt.slice(2).replace(/-/g, "."),
      irtChngDcdNm: bondDetail.irt_chng_dcd_nm,
      bondSrfcInrt: bondDetail.bond_srfc_inrt,
      bondIssuAmt: Number(bondDetail.bond_issu_amt).toLocaleString(),
      bondIntTcdNm: bondDetail.bond_int_tcd_nm,
      // 새로 추가된 필드들
      bondIsurNm: bondDetail.bond_isur_nm, // 채권발행기관명
      scrsItmsKcdNm: bondDetail.scrs_itms_kcd_nm, // 유가증권종류명
      grnDcdNm: bondDetail.grn_dcd_nm, // 보증구분코드명
      bondRnknDcdNm: bondDetail.bond_rnkn_dcd_nm, // 채권순위구분코드명
      optnTcdNm: bondDetail.optn_tcd_nm, // 옵션유형코드명
      pclrBondKcdNm: bondDetail.pclr_bond_kcd_nm, // 특이채권종류코드명
      bondOffrMcdNm: bondDetail.bond_offr_mcd_nm, // 채권모집방법코드명
      lstgDt: bondDetail.lstg_dt
        ? bondDetail.lstg_dt.slice(2).replace(/-/g, ".")
        : "-", // 상장일자
      stripsPsblYn: bondDetail.strips_psbl_yn, // 스트립스 가능 여부
      stripsNm: bondDetail.strips_nm, // 스트립스채권명
      prmncBondYn: bondDetail.prmnc_bond_yn, // 영구채권여부
      intPayCyclCtt: bondDetail.int_pay_cycl_ctt, // 이자 지급 주기
      intPayMmntDcdNm: bondDetail.int_pay_mmnt_dcd_nm, // 이자지급시기구분코드명
      crno: bondDetail.crno, // 법인등록번호
      sicNm: bondDetail.sic_nm, // 표준산업분류명
      prisLnkgBondYn: bondDetail.pris_lnkg_bond_yn, // 물가연동채권여부
      pamtRdptMcdNm: bondDetail.pamt_rdpt_mcd_nm, // 원금상환방법코드명
      bondRegInstDcdNm: bondDetail.bond_reg_inst_dcd_nm, // 채권등록기관구분코드명
      intCmpuMcdNm: bondDetail.int_cmpu_mcd_nm, // 이자산정방법코드명
      bondPymtAmt: bondDetail.bond_pymt_amt, // 채권납입금액
      bondBal: bondDetail.bond_bal, // 채권잔액
      kisScrsItmsKcdNm: bondDetail.kis_scrs_itms_kcd_nm, // 한국신용평가유가증권종목종류코드명
      kbpScrsItmsKcdNm: bondDetail.kbp_scrs_itms_kcd_nm, // 한국자산평가유가증권종목종류코드명
      niceScrsItmsKcdNm: bondDetail.nice_scrs_itms_kcd_nm, // NICE평가정보유가증권종목종류코드명
      fnScrsItmsKcdNm: bondDetail.fn_scrs_itms_kcd_nm, // FN유가증권종목종류코드명
    };

    const formattedPriceInfo = latestPrice
      ? {
          basDt: latestPrice.bas_dt.slice(2).replace(/-/g, "."),
          clprPrc: Number(latestPrice.clpr_prc).toLocaleString("ko-KR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          clprVs: latestPrice.clpr_vs,
          clprBnfRt: latestPrice.clpr_bnf_rt,
        }
      : null;

    res.render("bond_detail", {
      layout: "../views/layouts/main",
      title: "채권 상세 정보",
      bondDetail: formattedBondDetail,
      priceInfo: formattedPriceInfo,
    });
  } catch (error) {
    console.error("채권 상세 정보 조회 중 오류:", error);
    throw error;
  }
});

module.exports = { getBondDetail };
