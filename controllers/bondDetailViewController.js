const asyncHandler = require("express-async-handler");
const { BondIssue, BondPrice } = require("../models");
const { Op } = require("sequelize");

const getBondDetail = asyncHandler(async (req, res) => {
  try {
    const isinCd = req.params.id;

    // 채권 기본 정보 조회
    const bondDetail = await BondIssue.findOne({
      where: { isin_cd: isinCd },
      attributes: [
        "isin_cd",
        "isin_cd_nm",
        "bond_issu_dt",
        "bond_expr_dt",
        "bond_srfc_inrt",
        "irt_chng_dcd_nm",
        "bond_issu_amt",
        "bond_isur_nm", // 채권발행기관명
        "scrs_itms_kcd_nm", // 유가증권종류명
        "bond_int_tcd_nm", // 채권 이자 유형
        "bond_issu_frmt_nm", // 채권 발행 형태
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
      bondIssuFrmtNm: bondDetail.bond_issu_frmt_nm, // 채권 발행 형태
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
