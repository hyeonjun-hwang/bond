// const now = new Date();
// const next = new Date(now);
// console.log(`now : ${now}`);
// console.log(`next : ${next}`);

// const today = new Date("2025-01-11")
//   .toISOString()
//   .slice(0, 10)
//   .replace(/-/g, ""); // 지정 날짜 - YYYYMMDD 형식

// console.log(today);

// ------------------------------------------------------------

// 채권기본정보 API 요청 테스트
require("dotenv").config();
const axios = require("axios");

let totalProcessed = 0;
let totalNew = 0;
let totalUpdated = 0;
let currentPage = 1;
let hasMoreData = true;

const BASE_URL =
  "http://apis.data.go.kr/1160100/service/GetBondIssuInfoService/getBondBasiInfo";
const numOfRows = 9999;

// const today = new Date("2025-01-11")
//   .toISOString()
//   .slice(0, 10)
//   .replace(/-/g, ""); // 지정 날짜 - YYYYMMDD 형식

const params = {
  serviceKey: decodeURIComponent(process.env.BOND_DETAIL_SERVICE_KEY_ENCODING),
  pageNo: currentPage.toString(),
  numOfRows: numOfRows.toString(),
  resultType: "json",
  //   basDt: today,
};

console.log(BASE_URL, { params });
