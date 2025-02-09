const { BondBasic } = require("../models");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const { getTodayDate } = require("../scripts/utils/formatters/dateFormatter");
const {
  calculateCreditRating,
} = require("../scripts/utils/formatters/creditRatingFormatter");
const sequelize = require("sequelize");

const getBondDiscovery = asyncHandler(async (req, res) => {
  try {
    const tab = req.query.tab || "all";
    const sort = req.query.sort || "date";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // 기본 필터 조건
    const where = {
      bond_offr_mcd_nm: { [Op.like]: "%공모%" }, // 공모채권만 조회
      bond_expr_dt: { [Op.gt]: getTodayDate() }, // 만기가 지난 채권 제외
      bond_int_tcd_nm: { [Op.like]: "%이표채%" }, // 이표채만 조회
      lstg_dt: { [Op.not]: null }, // 상장일자가 있는 채권만 조회
    };

    // 이자 지급 주기 필터 (전체가 아닐 경우에만 적용)
    if (tab !== "all") {
      where.int_pay_cycl_ctt = `${tab}개월`;
    }

    // // 디버깅을 위한 로그 추가
    // console.log("=== 필터 조건 확인 ===");
    // console.log("선택된 탭:", tab);
    // console.log("WHERE 조건:", JSON.stringify(where, null, 2));

    // 실제 데이터 확인
    // const distinctPayCycl = await BondBasic.findAll({
    //   attributes: [
    //     [
    //       sequelize.fn("DISTINCT", sequelize.col("int_pay_cycl_ctt")),
    //       "int_pay_cycl_ctt",
    //     ],
    //   ],
    //   raw: true,
    // });
    // console.log("DB의 이자지급주기 종류:", distinctPayCycl);

    // 먼저 조건별로 데이터 확인
    // console.log("=== 데이터 확인 ===");
    // const distinctOffrMcd = await BondBasic.findAll({
    //   attributes: [
    //     [
    //       sequelize.fn("DISTINCT", sequelize.col("bond_offr_mcd_nm")),
    //       "bond_offr_mcd_nm",
    //     ],
    //   ],
    //   raw: true,
    // });
    // console.log("채권모집방법 종류:", distinctOffrMcd);

    // const distinctIntTcd = await BondBasic.findAll({
    //   attributes: [
    //     [
    //       sequelize.fn("DISTINCT", sequelize.col("bond_int_tcd_nm")),
    //       "bond_int_tcd_nm",
    //     ],
    //   ],
    //   raw: true,
    // });
    // console.log("이자유형 종류:", distinctIntTcd);

    // const distinctPayCycl = await BondBasic.findAll({
    //   attributes: [
    //     [
    //       sequelize.fn("DISTINCT", sequelize.col("int_pay_cycl_ctt")),
    //       "int_pay_cycl_ctt",
    //     ],
    //   ],
    //   raw: true,
    // });
    // console.log("이자지급주기 종류:", distinctPayCycl);

    // 정렬 조건
    const order =
      sort === "date"
        ? [["bond_issu_dt", "DESC"]]
        : [["bond_srfc_inrt", "DESC"]];

    // console.log("=== 쿼리 조건 ===");
    // console.log("WHERE:", JSON.stringify(where, null, 2));
    // console.log("ORDER:", JSON.stringify(order, null, 2));

    // 페이지네이션을 위한 전체 데이터 수 조회
    const total = await BondBasic.count({ where });

    const bonds = await BondBasic.findAll({
      where,
      attributes: [
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
      ],
      order,
      limit,
      offset,
      raw: true,
    });

    // // 먼저 전체 데이터 수 확인
    // console.log("전체 채권 수:", total);

    // // 필터 적용된 데이터 수 확인
    // const filteredCount = await BondBasic.count({ where });
    // console.log("필터 적용 후 채권 수:", filteredCount);

    // console.log("조회된 채권 수:", bonds.length);
    // if (bonds.length > 0) {
    //   console.log("첫 번째 채권 데이터:", JSON.stringify(bonds[0], null, 2));
    // }

    // 데이터 포맷팅
    const formattedBonds = bonds.map((bond) => ({
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
    }));

    // 현재 탭의 전체 채권 수 조회
    const totalBondsInCurrentTab = await BondBasic.count({ where });

    res.render("bond_discovery", {
      layout: "../views/layouts/main",
      title: "채권 발견",
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
    });
  } catch (error) {
    console.error("채권 발견 페이지 조회 중 오류:", error);
    throw error;
  }
});

const getBondDiscoveryCredit = asyncHandler(async (req, res) => {
  res.render("bond_discovery", {
    layout: "../views/layouts/main",
    title: "채권 발견",
  });
});

module.exports = { getBondDiscovery, getBondDiscoveryCredit };
