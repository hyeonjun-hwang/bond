const { BondBasic } = require("../models");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const { getTodayDate } = require("../scripts/utils/formatters/dateFormatter");
const {
  calculateCreditRating,
} = require("../scripts/utils/formatters/creditRatingFormatter");
const sequelize = require("sequelize");

// 공통 필터 조건
const getBaseWhereCondition = () => ({
  bond_offr_mcd_nm: { [Op.like]: "%공모%" }, // 공모채권만 조회
  bond_expr_dt: { [Op.gt]: getTodayDate() }, // 만기가 지난 채권 제외
  bond_int_tcd_nm: { [Op.like]: "%이표채%" }, // 이표채만 조회
  lstg_dt: { [Op.not]: null }, // 상장일자가 있는 채권만 조회
});

// 공통 속성
const commonAttributes = [
  "isin_cd",
  "isin_cd_nm",
  "bond_srfc_inrt",
  "int_pay_cycl_ctt",
  "bond_issu_dt",
  "bond_expr_dt",
  "kis_scrs_itms_kcd_nm",
  "kbp_scrs_itms_kcd_nm",
  "nice_scrs_itms_kcd_nm",
  "fn_scrs_itms_kcd_nm",
];

// 데이터 포맷팅 함수
const formatBondData = (bond) => ({
  ...bond,
  bond_expr_dt: bond.bond_expr_dt.slice(2).replace(/-/g, "."),
  bond_issu_dt: bond.bond_issu_dt.slice(2).replace(/-/g, "."),
  bond_srfc_inrt: `${bond.bond_srfc_inrt}%`,
  int_pay_cycl_ctt: bond.int_pay_cycl_ctt,
  credit_rating: calculateCreditRating(
    bond.kis_scrs_itms_kcd_nm,
    bond.kbp_scrs_itms_kcd_nm,
    bond.nice_scrs_itms_kcd_nm,
    bond.fn_scrs_itms_kcd_nm
  ),
});

// 이자 지급 주기별 채권 조회
const getBondDiscovery = asyncHandler(async (req, res, next) => {
  try {
    const tab = req.query.tab || "all";
    const sort = req.query.sort || "date";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // 기본 필터 조건
    const where = getBaseWhereCondition();

    // 이자 지급 주기 필터
    if (tab !== "all") {
      where.int_pay_cycl_ctt = `${tab}개월`;
    }

    // 정렬 조건
    const order =
      sort === "date"
        ? [["bond_issu_dt", "DESC"]]
        : [["bond_srfc_inrt", "DESC"]];

    // 데이터 조회
    const total = await BondBasic.count({ where });
    const bonds = await BondBasic.findAll({
      where,
      attributes: commonAttributes,
      order,
      limit,
      offset,
      raw: true,
    });

    const formattedBonds = bonds.map(formatBondData);
    const totalBondsInCurrentTab = await BondBasic.count({ where });

    res.locals.periodicBonds = {
      bonds: formattedBonds,
      currentTab: tab,
      currentSort: sort,
      totalBondsInCurrentTab: totalBondsInCurrentTab.toLocaleString(),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };

    next();
  } catch (error) {
    console.error("채권 발견 페이지 조회 중 오류:", error);
    throw error;
  }
});

// 신용등급별 채권 조회
const getBondDiscoveryCredit = asyncHandler(async (req, res) => {
  try {
    const creditTab = req.query.creditTab || "all";
    const creditSort = req.query.creditSort || "date";
    const creditPage = parseInt(req.query.creditPage) || 1;
    const limit = 10;
    const offset = (creditPage - 1) * limit;

    // 기본 필터 조건
    const where = getBaseWhereCondition();

    // 신용등급 필터
    if (creditTab !== "all") {
      where[Op.or] = [
        { kis_scrs_itms_kcd_nm: { [Op.like]: `${creditTab}%` } },
        { kbp_scrs_itms_kcd_nm: { [Op.like]: `${creditTab}%` } },
        { nice_scrs_itms_kcd_nm: { [Op.like]: `${creditTab}%` } },
        { fn_scrs_itms_kcd_nm: { [Op.like]: `${creditTab}%` } },
      ];
    }

    // 정렬 조건
    const order =
      creditSort === "date"
        ? [["bond_issu_dt", "DESC"]]
        : [["bond_srfc_inrt", "DESC"]];

    // 데이터 조회
    const total = await BondBasic.count({ where });
    const bonds = await BondBasic.findAll({
      where,
      attributes: commonAttributes,
      order,
      limit,
      offset,
      raw: true,
    });

    const formattedBonds = bonds.map(formatBondData);
    const totalBondsInCurrentTab = await BondBasic.count({ where });

    res.render("bond_discovery", {
      layout: "../views/layouts/main",
      title: "채권 발견",
      periodicBonds: res.locals.periodicBonds,
      creditBonds: {
        bonds: formattedBonds,
        currentTab: creditTab,
        currentSort: creditSort,
        totalBondsInCurrentTab: totalBondsInCurrentTab.toLocaleString(),
        pagination: {
          page: creditPage,
          limit,
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("신용등급별 채권 조회 중 오류:", error);
    throw error;
  }
});

module.exports = { getBondDiscovery, getBondDiscoveryCredit };
