const BondIssue = require("../models/bondIssueModel");
const asyncHandler = require("express-async-handler");

// 캐싱을 적용한 버전
let cachedFilters = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1시간
let lastCacheTime = 0;

const getBondsList = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const period = req.query.period || "14";
    const intType = req.query.intType || "";
    const rateType = req.query.rateType || "";

    // 검색 조건 구성
    const query = {};

    // 기간 조건
    const endDate = new Date();
    const startDate = new Date();

    // 기간 설정
    if (period !== "all") {
      startDate.setDate(endDate.getDate() - parseInt(period));
    } else {
      // 전체 기간인 경우 매우 이전 날짜로 설정
      startDate.setFullYear(2000);
    }

    // 날짜 형식 변환 (YYYYMMDD)
    const endDateStr = endDate.toISOString().slice(0, 10).replace(/-/g, "");
    const startDateStr = startDate.toISOString().slice(0, 10).replace(/-/g, "");
    query.bondIssuDt = { $gte: startDateStr, $lte: endDateStr };

    // 이자지급방식 조건
    if (intType) {
      query.bondIntTcdNm = intType;
    }

    // 금리변동구분 조건
    if (rateType) {
      query.irtChngDcdNm = rateType;
    }

    // 캐시가 없거나 만료되었을 때만 DB 조회
    if (!cachedFilters || Date.now() - lastCacheTime > CACHE_DURATION) {
      cachedFilters = {
        intTypes: await BondIssue.distinct("bondIntTcdNm"),
        rateTypes: await BondIssue.distinct("irtChngDcdNm"),
      };
      lastCacheTime = Date.now();
    }

    // 캐시된 필터 사용
    const bondFilters = cachedFilters;

    // 데이터 조회
    const bonds = await BondIssue.find(query)
      .select(
        "isinCd isinCdNm bondIssuDt bondExprDt bondSrfcInrt irtChngDcdNm bondIntTcdNm"
      )
      .sort({ bondIssuDt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 날짜 형식 변환
    const formattedBonds = bonds.map((bond) => ({
      ...bond._doc,
      bondIssuDt: bond.bondIssuDt.replace(
        /(\d{4})(\d{2})(\d{2})/,
        (_, y, m, d) => `${y.slice(2)}.${m}.${d}`
      ),
      bondExprDt: bond.bondExprDt.replace(
        /(\d{4})(\d{2})(\d{2})/,
        (_, y, m, d) => `${y.slice(2)}.${m}.${d}`
      ),
    }));

    // 전체 데이터 수 조회
    const total = await BondIssue.countDocuments(query);

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
        start: startDateStr,
        end: endDateStr,
        period: period,
      },
      filters: {
        intType,
        rateType,
      },
      bondFilters,
    });
  } catch (error) {
    console.error("채권 목록 조회 중 오류:", error);
    throw error;
  }
});

module.exports = {
  getBondsList,
};
