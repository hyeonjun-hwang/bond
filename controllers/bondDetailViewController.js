const asyncHandler = require("express-async-handler");
const BondDetail = require("../models/bondDetailModel");

const getBondDetail = asyncHandler(async (req, res) => {
  const isinCd = req.params.id;
  const bondDetail = await BondDetail.findOne({ isinCd: isinCd });

  if (!bondDetail) {
    return res.status(404).render("error", {
      layout: "../views/layouts/main",
      title: "에러",
      message: "해당 채권을 찾을 수 없습니다.",
    });
  }

  res.render("bond_detail", {
    layout: "../views/layouts/main",
    title: "채권 상세 정보",
    bondDetail,
  });
});

module.exports = { getBondDetail };
