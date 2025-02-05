require("dotenv").config();
const axios = require("axios");
const { Sequelize } = require("sequelize");
const config = require("../../config/database.js")[
  process.env.NODE_ENV || "development"
];

const BASE_URL =
  "http://apis.data.go.kr/1160100/service/GetBondIssuInfoService/getBondBasiInfo";
const MAX_RETRIES = 5;
const DELAY_BETWEEN_CALLS = 60000; // 60초

// 재시도 로직을 포함한 API 호출 함수
const fetchWithRetry = async (url, params, retries = MAX_RETRIES) => {
  try {
    const response = await axios.get(url, { params });

    return response.data?.response?.body || null;
  } catch (error) {
    if (retries > 0) {
      console.log(`API 호출 실패, ${retries}회 재시도...`);
      //   console.log(`응답 헤더 결과 코드: ${response.headers.resultCode}`);
      //   console.log(`응답 헤더 결과 메시지: ${response.headers.resultMsg}`);
      //   console.error(`${retries}회 재시도 에러 메시지 : ${error}`);
      //   const retryDelay = DELAY_BETWEEN_CALLS * (MAX_RETRIES - retries + 1);
      //   await new Promise((resolve) => setTimeout(resolve, retryDelay));
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_CALLS));
      return fetchWithRetry(url, params, retries - 1);
    }
    throw error;
  }
};

const migrateBondBasicDataToPostgres = async () => {
  try {
    // 1. PostgreSQL 연결
    const sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        dialect: config.dialect,
        logging: false,
      }
    );

    // 모델 초기화
    const BondBasic = require("../../models/bond_basic")(
      sequelize,
      Sequelize.DataTypes
    );
    console.log("BondBasic model:", BondBasic);
    console.log("Sequelize config:", sequelize.config);
    console.log("BondBasic table name:", BondBasic.tableName);

    console.log("=== PostgreSQL 채권기본정보 마이그레이션 시작 ===");
    console.log(`시작 시간: ${new Date().toLocaleString()}`);

    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    // let pageNo = 1; // 1페이지 부터 시작
    let pageNo = 4287; // 4287페이지 부터 시작
    let numOfRows = 5000;
    const errors = [];
    const processedIsinCodes = new Set();

    // 첫 페이지 요청으로 전체 건수 확인
    const firstPageParams = {
      serviceKey: decodeURIComponent(
        process.env.BOND_BASIC_SERVICE_KEY_ENCODING
      ),
      resultType: "json",
      numOfRows: numOfRows,
      pageNo: 1,
      //   basDt: "20240601", // 임시
    };

    const firstResponse = await fetchWithRetry(BASE_URL, firstPageParams);
    const totalCount = firstResponse?.totalCount;

    if (!totalCount) {
      throw new Error("API에서 전체 데이터 건수를 가져올 수 없습니다.");
    }

    console.log(`전체 데이터 건수: ${totalCount}`);
    const totalPages = Math.ceil(totalCount / firstPageParams.numOfRows);
    console.log(`총 페이지 수: ${totalPages}`);

    while (true) {
      const params = {
        serviceKey: decodeURIComponent(
          process.env.BOND_BASIC_SERVICE_KEY_ENCODING
        ),
        resultType: "json",
        numOfRows: numOfRows,
        pageNo: pageNo,
        // basDt: "20240601", // 임시
      };

      const response = await fetchWithRetry(BASE_URL, params);
      const items = response?.items?.item || [];

      //   if (items.length === 0 || pageNo > totalPages) {
      //     break;
      //   }

      console.log(
        `\n=== 페이지 ${pageNo}/${totalPages} 처리 시작 (${items.length}건) ===`
      );

      // 데이터 처리
      let pageSuccessCount = 0;
      let pageErrorCount = 0;

      for (const item of items) {
        try {
          if (processedIsinCodes.has(item.isinCd)) {
            continue;
          }
          processedIsinCodes.add(item.isinCd);

          const formatDate = (dateStr) => {
            return dateStr
              ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(
                  6,
                  8
                )}`
              : null;
          };

          const bondBasicData = {
            bas_dt: formatDate(item.basDt),
            crno: item.crno,
            isin_cd: item.isinCd,
            scrs_itms_kcd: item.scrsItmsKcd,
            scrs_itms_kcd_nm: item.scrsItmsKcdNm,
            bond_isur_nm: item.bondIsurNm,
            isin_cd_nm: item.isinCdNm,
            bond_issu_dt: formatDate(item.bondIssuDt),
            bond_issu_amt: item.bondIssuAmt,
            bond_issu_cur_cd: item.bondIssuCurCd,
            optn_tcd: item.optnTcd,
            optn_tcd_nm: item.optnTcdNm,
            bond_issu_cur_cd_nm: item.bondIssuCurCdNm,
            sic_nm: item.sicNm,
            bond_expr_dt: formatDate(item.bondExprDt),
            int_cmpu_mcd: item.intCmpuMcd,
            int_cmpu_mcd_nm: item.intCmpuMcdNm,
            bond_pymt_amt: item.bondPymtAmt,
            irt_chng_dcd: item.irtChngDcd,
            irt_chng_dcd_nm: item.irtChngDcdNm,
            bond_srfc_inrt: item.bondSrfcInrt,
            bond_bal: item.bondBal,
            grn_dcd: item.grnDcd,
            bond_int_tcd: item.bondIntTcd,
            bond_int_tcd_nm: item.bondIntTcdNm,
            grn_dcd_nm: item.grnDcdNm,
            bond_rnkn_dcd: item.bondRnknDcd,
            bond_rnkn_dcd_nm: item.bondRnknDcdNm,
            pclr_bond_kcd: item.pclrBondKcd,
            pclr_bond_kcd_nm: item.pclrBondKcdNm,
            lstg_dt: formatDate(item.lstgDt),
            bond_offr_mcd: item.bondOffrMcd,
            bond_offr_mcd_nm: item.bondOffrMcdNm,
            txtn_dcd: item.txtnDcd,
            txtn_dcd_nm: item.txtnDcdNm,
            pamt_rdpt_mcd: item.pamtRdptMcd,
            pamt_rdpt_mcd_nm: item.pamtRdptMcdNm,
            strips_psbl_yn: item.stripsPsblYn,
            strips_nm: item.stripsNm,
            pris_lnkg_bond_yn: item.prisLnkgBondYn,
            piam_pay_inst_nm: item.piamPayInstNm,
            piam_pay_brof_nm: item.piamPayBrofNm,
            cpt_usge_dcd: item.cptUsgeDcd,
            cpt_usge_dcd_nm: item.cptUsgeDcdNm,
            bond_reg_inst_dcd: item.bondRegInstDcd,
            bond_reg_inst_dcd_nm: item.bondRegInstDcdNm,
            issu_dpty_nm: item.issuDptyNm,
            bond_undt_inst_nm: item.bondUndtInstNm,
            bond_grn_inst_nm: item.bondGrnInstNm,
            cpbd_mng_cmpy_nm: item.cpbdMngCmpyNm,
            crfnd_yn: item.crfndYn,
            prmnc_bond_yn: item.prmncBondYn,
            qib_trgt_scrt_yn: item.qibTrgtScrtYn,
            prmnc_bond_tmn_dt: formatDate(item.prmncBondTmnDt),
            rgt_exert_mnbd_dcd: item.rgtExertMnbdDcd,
            rgt_exert_mnbd_dcd_nm: item.rgtExertMnbdDcdNm,
            qib_tmn_dt: formatDate(item.qibTmnDt),
            int_pay_cycl_ctt: item.intPayCyclCtt,
            nxtm_copn_dt: formatDate(item.nxtmCopnDt),
            rbf_copn_dt: formatDate(item.rbfCopnDt),
            bnk_hldy_int_pydy_dcd: item.bnkHldyIntPydyDcd,
            bnk_hldy_int_pydy_dcd_nm: item.bnkHldyIntPydyDcdNm,
            sttr_hldy_int_pydy_dcd: item.sttrHldyIntPydyDcd,
            sttr_hldy_int_pydy_dcd_nm: item.sttrHldyIntPydyDcdNm,
            int_pay_mmnt_dcd: item.intPayMmntDcd,
            int_pay_mmnt_dcd_nm: item.intPayMmntDcdNm,
            elps_int_pay_yn: item.elpsIntPayYn,
            kis_scrs_itms_kcd: item.kisScrsItmsKcd,
            kis_scrs_itms_kcd_nm: item.kisScrsItmsKcdNm,
            kbp_scrs_itms_kcd: item.kbpScrsItmsKcd,
            kbp_scrs_itms_kcd_nm: item.kbpScrsItmsKcdNm,
            nice_scrs_itms_kcd: item.niceScrsItmsKcd,
            nice_scrs_itms_kcd_nm: item.niceScrsItmsKcdNm,
            fn_scrs_itms_kcd: item.fnScrsItmsKcd,
            fn_scrs_itms_kcd_nm: item.fnScrsItmsKcdNm,
          };

          // 기존 데이터 존재 여부 확인 및 업데이트/생성
          const existingBond = await BondBasic.findOne({
            where: {
              isin_cd: item.isinCd,
            },
          });

          if (existingBond) {
            // 기존 데이터의 bas_dt와 새로운 데이터의 bas_dt 비교
            const existingDate = new Date(existingBond.bas_dt);
            const newDate = new Date(formatDate(item.basDt));

            // 새로운 데이터의 bas_dt가 더 최신일 경우에만 업데이트
            if (newDate > existingDate) {
              await existingBond.update(bondBasicData);
            }
          } else {
            await BondBasic.create(bondBasicData);
          }

          pageSuccessCount++;
          totalSuccessCount++;
        } catch (error) {
          pageErrorCount++;
          totalErrorCount++;
          errors.push({ isinCode: item.isinCd, error: error.message });
        }
      }

      console.log(`페이지 ${pageNo}/${totalPages} 처리 결과:
        - 성공: ${pageSuccessCount}
        - 실패: ${pageErrorCount}
        - 처리된 ISIN 수: ${processedIsinCodes.size}
        - 전체 진행률: ${((processedIsinCodes.size / totalCount) * 100).toFixed(
          2
        )}%
      `);

      pageNo++;

      if (pageNo > totalPages) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_CALLS));
    }

    console.log("\n=== 채권기본정보 마이그레이션 완료 ===");
    console.log(`최종 처리 결과:
    - 총 성공: ${totalSuccessCount}
    - 총 실패: ${totalErrorCount}
    - 총 처리된 ISIN 수: ${processedIsinCodes.size}
    `);

    if (errors.length > 0) {
      console.log("\n=== 실패한 채권 목록 ===");
      console.log(`총 ${errors.length}건의 오류 발생`);
      // 에러 요약 (처음 10개만)
      errors.slice(0, 10).forEach(({ isinCode, error }) => {
        console.log(`- ${isinCode}: ${error}`);
      });
      if (errors.length > 10) {
        console.log(`... 외 ${errors.length - 10}건`);
      }
    }

    console.log(`종료 시간: ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error("초기 설정 중 오류:", error);
  }
};

migrateBondBasicDataToPostgres();
