const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/bond-detail-test", async (req, res) => {
  try {
    const baseURL =
      "http://apis.data.go.kr/1160100/service/GetBondIssuInfoService/getBondBasiInfo";

    // 기존 URL (주석처리)
    // const url = `${baseURL}?serviceKey=${process.env.BOND_DETAIL_SERVICE_KEY_ENCODING}&pageNo=1&numOfRows=10&resultType=json`;

    // 여러 isinCd로 테스트
    // const testIsinCds = ["KR103103AA33", "KR103104AA24", "KR103104AA32"].join(
    //   ","
    // );

    // const url = `${baseURL}?serviceKey=${process.env.BOND_DETAIL_SERVICE_KEY_ENCODING}&isinCd=${testIsinCds}&resultType=json`;
    const url = `${baseURL}?serviceKey=${process.env.BOND_DETAIL_SERVICE_KEY_ENCODING}&resultType=json&numOfRows=5`;

    console.log("실제 요청 URL:", url);

    const response = await axios.get(url);

    console.log("API 응답:", response.data);

    res.json(response.data);
  } catch (error) {
    console.error("API 요청 실패:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    res.status(500).json({
      error: "API 요청 실패",
      message: error.message,
      details: error.response?.data,
    });
  }
});

module.exports = router;
