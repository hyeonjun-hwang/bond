const mongoose = require("mongoose");

const bondIssueSchema = new mongoose.Schema(
  {
    basDt: {
      type: String,
      required: true,
    },
    crno: {
      type: String,
      required: true,
    },
    bondIsurNm: {
      type: String,
      required: true,
    },
    bondIssuDt: {
      type: String,
      required: true,
    },
    scrsItmsKcd: {
      type: String,
    },
    scrsItmsKcdNm: {
      type: String,
    },
    isinCd: {
      type: String,
    },
    isinCdNm: {
      type: String,
    },
    bondIssuFrmtNm: {
      type: String,
    },
    bondExprDt: {
      type: String,
    },
    bondIssuCurCd: {
      type: String,
      default: "KRW",
    },
    bondIssuCurCdNm: {
      type: String,
      default: "KRW",
    },
    bondPymtAmt: {
      type: Number,
    },
    bondIssuAmt: {
      type: Number,
    },
    bondSrfcInrt: {
      type: Number,
    },
    irtChngDcd: {
      type: String,
    },
    irtChngDcdNm: {
      type: String,
    },
    bondIntTcd: {
      type: String,
    },
    bondIntTcdNm: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "bond_issuances",
  }
);

bondIssueSchema.index({ isinCd: 1 }, { unique: true });

module.exports = mongoose.model("BondIssue", bondIssueSchema);
