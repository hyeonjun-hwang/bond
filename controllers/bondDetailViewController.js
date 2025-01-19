const asyncHandler = require("express-async-handler");
const BondDetail = require("../models/bondDetailModel");
const BondPrice = require("../models/bondPriceModel");

const getBondDetail = asyncHandler(async (req, res) => {
  const isinCd = req.params.id;
  const bondPrice = await BondPrice.findOne({ isinCd: isinCd });

  if (!bondPrice) {
    return res.status(404).render("error", {
      layout: "../views/layouts/main",
      title: "에러",
      message: "해당 채권을 찾을 수 없습니다.",
    });
  }

  const latestPrice = await BondPrice.findOne({ isinCd: isinCd })
    .sort({ basDt: -1 })
    .limit(1);

  res.render("bond_detail", {
    layout: "../views/layouts/main",
    title: "채권 상세 정보",
    bondDetail,
    priceInfo: latestPrice || null,
  });
});

module.exports = { getBondDetail };
