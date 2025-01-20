const { BondIssue } = require("../models");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

// 캐싱을 적용한 버전
let cachedFilters = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1시간
let lastCacheTime = 0;

const getBondsList = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const period = req.query.period || "90";
    const intType = req.query.intType || "";
    const rateType = req.query.rateType || "";
    const searchTerm = req.query.search || "";

    // 검색 조건 구성
    let where = {};

    // 날짜 조건 처리
    if (period === "custom") {
      const customStartDate = req.query.startDate;
      const customEndDate = req.query.endDate;
      if (customStartDate && customEndDate) {
        where.bond_issu_dt = {
          [Op.between]: [
            customStartDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
            customEndDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
          ],
        };
      }
    } else if (period !== "all") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(period));
      where.bond_issu_dt = {
        [Op.between]: [startDate, endDate],
      };
    }

    // 필터 조건 추가
    if (intType) {
      where.bond_int_tcd_nm = intType;
    }
    if (rateType) {
      where.irt_chng_dcd_nm = rateType;
    }
    if (searchTerm) {
      where.isin_cd_nm = {
        [Op.iLike]: `%${searchTerm}%`,
      };
    }

    // 캐시된 필터 업데이트
    if (!cachedFilters || Date.now() - lastCacheTime > CACHE_DURATION) {
      cachedFilters = {
        intTypes: await BondIssue.findAll({
          attributes: [
            [
              sequelize.fn("DISTINCT", sequelize.col("bond_int_tcd_nm")),
              "bond_int_tcd_nm",
            ],
          ],
          raw: true,
        }).then((results) => results.map((r) => r.bond_int_tcd_nm)),
        rateTypes: await BondIssue.findAll({
          attributes: [
            [
              sequelize.fn("DISTINCT", sequelize.col("irt_chng_dcd_nm")),
              "irt_chng_dcd_nm",
            ],
          ],
          raw: true,
        }).then((results) => results.map((r) => r.irt_chng_dcd_nm)),
      };
      lastCacheTime = Date.now();
    }

    // 데이터 조회
    const { rows: bonds, count: total } = await BondIssue.findAndCountAll({
      where,
      attributes: [
        "isin_cd",
        "isin_cd_nm",
        "bond_issu_dt",
        "bond_expr_dt",
        "bond_srfc_inrt",
        "irt_chng_dcd_nm",
        "bond_int_tcd_nm",
      ],
      order: [["bond_issu_dt", "DESC"]],
      offset: (page - 1) * limit,
      limit: limit,
      raw: true,
    });

    // 날짜 포맷 변환
    const formattedBonds = bonds.map((bond) => ({
      ...bond,
      isinCd: bond.isin_cd,
      isinCdNm: bond.isin_cd_nm,
      bondIssuDt: bond.bond_issu_dt
        ? bond.bond_issu_dt.slice(2).replace(/-/g, ".")
        : "",
      bondExprDt: bond.bond_expr_dt
        ? bond.bond_expr_dt.slice(2).replace(/-/g, ".")
        : "",
      bondSrfcInrt: bond.bond_srfc_inrt,
      irtChngDcdNm: bond.irt_chng_dcd_nm,
      bondIntTcdNm: bond.bond_int_tcd_nm,
    }));

    res.render("bonds_list", {
      layout: "../views/layouts/main",
      title: "채권 리스트",
      bonds: formattedBonds,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
      dateRange: {
        start: period === "custom" ? req.query.startDate : undefined,
        end: period === "custom" ? req.query.endDate : undefined,
        period,
      },
      filters: {
        intType,
        rateType,
        searchTerm,
      },
      bondFilters: cachedFilters,
    });
  } catch (error) {
    console.error("채권 목록 조회 중 오류:", error);
    throw error;
  }
});

module.exports = {
  getBondsList,
};
