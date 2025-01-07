const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/test2", async (req, res) => {
  try {
    const BASE_URL =
      "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat";

    // 쿼리 파라미터에서 값을 가져오거나 기본값 사용
    const params = {
      serviceKey: decodeURIComponent(
        process.env.BOND_ISSUE_SERVICE_KEY_ENCODING
      ),
      pageNo: req.query.pageNo || "1",
      numOfRows: req.query.numOfRows || "1000",
      resultType: "json",
      basDt: req.query.basDt || "20250107",
    };

    const response = await axios.get(BASE_URL, { params });

    if (!response.data.response?.body?.items?.item) {
      throw new Error("API 응답 데이터 형식이 올바르지 않습니다.");
    }

    const { pageNo, numOfRows, totalCount } = response.data.response.body;
    const bondItems = Array.isArray(response.data.response.body.items.item)
      ? response.data.response.body.items.item
      : [response.data.response.body.items.item];

    res.status(200).json({
      success: true,
      message: "채권 데이터 조회 완료",
      pagination: {
        pageNo: parseInt(pageNo),
        numOfRows: parseInt(numOfRows),
        totalCount: parseInt(totalCount),
      },
      processResult: {
        processedCount: bondItems.length,
        newCount: 0,
        updateCount: 0,
      },
      data: bondItems,
    });
  } catch (error) {
    console.error("채권 데이터 조회 중 오류:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
