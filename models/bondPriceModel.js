const mongoose = require("mongoose");

const bondPriceSchema = new mongoose.Schema(
  {
    basDt: String, // 기준일자
    srtnCd: String, // 단축코드
    isinCd: {
      // ISIN코드 (국제 증권 식별 번호)
      type: String,
      index: true, // 조회 성능을 위한 인덱스 추가
    },
    itmsNm: String, // 종목명
    mrktCtg: String, // 시장구분
    xpYrCnt: String, // 경과년수
    itmsCtg: String, // 종목구분
    clprPrc: Number, // 종가
    clprVs: Number, // 대비
    clprBnfRt: Number, // 수익률
    mkpPrc: Number, // 시가
    mkpBnfRt: Number, // 시가수익률
    hiprPrc: Number, // 고가
    hiprBnfRt: Number, // 고가수익률
    loprPrc: Number, // 저가
    loprBnfRt: Number, // 저가수익률
    trqu: Number, // 거래량
    trPrc: Number, // 거래대금
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
    collection: "bond_prices",
  }
);

// 복합 인덱스 추가 (기준일자 + ISIN코드)
bondPriceSchema.index({ basDt: 1, isinCd: 1 });

const BondPrice = mongoose.model("BondPrice", bondPriceSchema);

module.exports = BondPrice;
