// require("dotenv").config();
// const mongoose = require("mongoose");
// const axios = require("axios");
// const BondIssue = require("../../models/bondIssueModel");
// const BondDetail = require("../../models/bondDetailModel");

// const CHUNK_SIZE = 100;
// const DELAY_MS = 100;

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const processBond = async (bond, baseURL) => {
//   try {
//     const url = `${baseURL}?serviceKey=${process.env.BOND_DETAIL_SERVICE_KEY_ENCODING}&isinCd=${bond.isinCd}&resultType=json`;

//     const response = await axios.get(url);

//     if (!response.data?.response?.body?.items) {
//       return { status: "error" };
//     }

//     const item = Array.isArray(response.data.response.body.items.item)
//       ? response.data.response.body.items.item[0]
//       : response.data.response.body.items.item;

//     if (!item) return { status: "error" };

//     const bondDetail = {
//       basDt: item.basDt,
//       crno: item.crno,
//       scrsItmsKcd: item.scrsItmsKcd,
//       isinCd: item.isinCd,
//       scrsItmsKcdNm: item.scrsItmsKcdNm,
//       bondIsurNm: item.bondIsurNm,
//       isinCdNm: item.isinCdNm,
//       bondIssuDt: item.bondIssuDt,
//       bondIssuAmt: item.bondIssuAmt,
//       bondIssuCurCd: item.bondIssuCurCd,
//       optnTcd: item.optnTcd,
//       optnTcdNm: item.optnTcdNm,
//       bondIssuCurCdNm: item.bondIssuCurCdNm,
//       sicNm: item.sicNm,
//       bondExprDt: item.bondExprDt,
//       intCmpuMcd: item.intCmpuMcd,
//       intCmpuMcdNm: item.intCmpuMcdNm,
//       bondPymtAmt: item.bondPymtAmt,
//       irtChngDcd: item.irtChngDcd,
//       irtChngDcdNm: item.irtChngDcdNm,
//       bondSrfcInrt: item.bondSrfcInrt,
//       bondBal: item.bondBal,
//       grnDcd: item.grnDcd,
//       bondIntTcd: item.bondIntTcd,
//       bondIntTcdNm: item.bondIntTcdNm,
//       grnDcdNm: item.grnDcdNm,
//       bondRnknDcd: item.bondRnknDcd,
//       bondRnknDcdNm: item.bondRnknDcdNm,
//       pclrBondKcd: item.pclrBondKcd,
//       pclrBondKcdNm: item.pclrBondKcdNm,
//       lstgDt: item.lstgDt,
//       bondOffrMcd: item.bondOffrMcd,
//       bondOffrMcdNm: item.bondOffrMcdNm,
//       txtnDcd: item.txtnDcd,
//       txtnDcdNm: item.txtnDcdNm,
//       pamtRdptMcd: item.pamtRdptMcd,
//       pamtRdptMcdNm: item.pamtRdptMcdNm,
//       stripsPsblYn: item.stripsPsblYn,
//       stripsNm: item.stripsNm,
//       prisLnkgBondYn: item.prisLnkgBondYn,
//       piamPayInstNm: item.piamPayInstNm,
//       piamPayBrofNm: item.piamPayBrofNm,
//       cptUsgeDcd: item.cptUsgeDcd,
//       cptUsgeDcdNm: item.cptUsgeDcdNm,
//       bondRegInstDcd: item.bondRegInstDcd,
//       bondRegInstDcdNm: item.bondRegInstDcdNm,
//       issuDptyNm: item.issuDptyNm,
//       bondUndtInstNm: item.bondUndtInstNm,
//       bondGrnInstNm: item.bondGrnInstNm,
//       cpbdMngCmpyNm: item.cpbdMngCmpyNm,
//       crfndYn: item.crfndYn,
//       prmncBondYn: item.prmncBondYn,
//       qibTrgtScrtYn: item.qibTrgtScrtYn,
//       prmncBondTmnDt: item.prmncBondTmnDt,
//       rgtExertMnbdDcd: item.rgtExertMnbdDcd,
//       rgtExertMnbdDcdNm: item.rgtExertMnbdDcdNm,
//       qibTmnDt: item.qibTmnDt,
//       intPayCyclCtt: item.intPayCyclCtt,
//       nxtmCopnDt: item.nxtmCopnDt,
//       rbfCopnDt: item.rbfCopnDt,
//       bnkHldyIntPydyDcd: item.bnkHldyIntPydyDcd,
//       bnkHldyIntPydyDcdNm: item.bnkHldyIntPydyDcdNm,
//       sttrHldyIntPydyDcd: item.sttrHldyIntPydyDcd,
//       sttrHldyIntPydyDcdNm: item.sttrHldyIntPydyDcdNm,
//       intPayMmntDcd: item.intPayMmntDcd,
//       intPayMmntDcdNm: item.intPayMmntDcdNm,
//       elpsIntPayYn: item.elpsIntPayYn,
//       kisScrsItmsKcd: item.kisScrsItmsKcd,
//       kisScrsItmsKcdNm: item.kisScrsItmsKcdNm,
//       kbpScrsItmsKcd: item.kbpScrsItmsKcd,
//       kbpScrsItmsKcdNm: item.kbpScrsItmsKcdNm,
//       niceScrsItmsKcd: item.niceScrsItmsKcd,
//       niceScrsItmsKcdNm: item.niceScrsItmsKcdNm,
//       fnScrsItmsKcd: item.fnScrsItmsKcd,
//       fnScrsItmsKcdNm: item.fnScrsItmsKcdNm,
//     };

//     const existingBond = await BondDetail.findOne({ isinCd: item.isinCd });
//     const result = await BondDetail.findOneAndUpdate(
//       { isinCd: item.isinCd },
//       bondDetail,
//       { upsert: true, new: true }
//     );

//     return {
//       status: existingBond ? "updated" : "created",
//     };
//   } catch (error) {
//     return { status: "error" };
//   }
// };

// const migrateBondDetails = async () => {
//   try {
//     await mongoose.connect(process.env.DB_URL);
//     console.log("MongoDB 연결 성공");

//     const bondIssues = await BondIssue.find({}, { isinCd: 1 });
//     const totalBonds = bondIssues.length;
//     console.log(`총 처리할 채권 수: ${totalBonds}`);

//     const baseURL =
//       "http://apis.data.go.kr/1160100/service/GetBondIssuInfoService/getBondBasiInfo";
//     let totalCreated = 0;
//     let totalUpdated = 0;
//     let totalErrors = 0;

//     for (let i = 0; i < bondIssues.length; i += CHUNK_SIZE) {
//       const chunk = bondIssues.slice(i, i + CHUNK_SIZE);

//       const promises = chunk.map((bond) => processBond(bond, baseURL));
//       const results = await Promise.all(promises);

//       const chunkStats = results.reduce(
//         (acc, result) => {
//           acc[result.status]++;
//           return acc;
//         },
//         { created: 0, updated: 0, error: 0 }
//       );

//       totalCreated += chunkStats.created;
//       totalUpdated += chunkStats.updated;
//       totalErrors += chunkStats.error;

//       console.log(
//         `\n=== 청크 처리 완료 [${i + 1}-${Math.min(
//           i + CHUNK_SIZE,
//           totalBonds
//         )}/${totalBonds}] ===`
//       );
//       console.log(
//         `진행률: ${(
//           (Math.min(i + CHUNK_SIZE, totalBonds) / totalBonds) *
//           100
//         ).toFixed(2)}%`
//       );
//       console.log(
//         `신규: ${chunkStats.created}, 갱신: ${chunkStats.updated}, 실패: ${chunkStats.error}`
//       );

//       await delay(DELAY_MS);
//     }

//     console.log("\n=== 마이그레이션 완료 ===");
//     console.log(`총 처리된 데이터: ${totalBonds}`);
//     console.log(
//       `총 신규: ${totalCreated}, 총 갱신: ${totalUpdated}, 총 실패: ${totalErrors}`
//     );
//   } catch (error) {
//     console.error("마이그레이션 실패:", error);
//   } finally {
//     await mongoose.disconnect();
//     process.exit(0);
//   }
// };

// migrateBondDetails();
