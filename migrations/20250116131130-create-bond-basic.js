"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("bond_basics", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      bas_dt: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: "기준일자",
      },
      crno: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "법인등록번호",
      },
      isin_cd: {
        type: Sequelize.STRING(12),
        allowNull: false,
        comment: "국제채권식별번호",
      },
      scrs_itms_kcd: {
        type: Sequelize.STRING(4),
        allowNull: true,
        comment: "유가증권종류코드",
      },
      scrs_itms_kcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "유가증권종류명",
      },
      bond_isur_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "채권발행기관명",
      },
      isin_cd_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "채권명",
      },
      bond_issu_dt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "발행일자",
      },
      bond_issu_amt: {
        type: Sequelize.DECIMAL(20, 0),
        allowNull: true,
        comment: "발행금액",
      },
      bond_issu_cur_cd: {
        type: Sequelize.STRING(3),
        allowNull: true,
        comment: "통화코드",
      },
      optn_tcd: {
        type: Sequelize.STRING(4),
        allowNull: true,
        comment: "옵션구분코드",
      },
      optn_tcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "옵션구분명",
      },
      bond_issu_cur_cd_nm: {
        type: Sequelize.STRING(3),
        allowNull: true,
        comment: "통화명",
      },
      sic_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "업종명",
      },
      bond_expr_dt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "만기일자",
      },
      int_cmpu_mcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "이자계산방법코드",
      },
      int_cmpu_mcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "이자계산방법명",
      },
      bond_pymt_amt: {
        type: Sequelize.DECIMAL(20, 0),
        allowNull: true,
        comment: "상환금액",
      },
      irt_chng_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "금리변동구분코드",
      },
      irt_chng_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "금리변동구분명",
      },
      bond_srfc_inrt: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
        comment: "표면금리",
      },
      bond_bal: {
        type: Sequelize.DECIMAL(20, 0),
        allowNull: true,
        comment: "채권잔액",
      },
      grn_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "보증구분코드",
      },
      bond_int_tcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "채권이자유형코드",
      },
      bond_int_tcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "채권이자유형명",
      },
      grn_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "보증구분명",
      },
      bond_rnkn_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "채권순위구분코드",
      },
      bond_rnkn_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "채권순위구분명",
      },
      pclr_bond_kcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "특수채권종류코드",
      },
      pclr_bond_kcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "특수채권종류명",
      },
      lstg_dt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "상장일자",
      },
      bond_offr_mcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "채권모집방법코드",
      },
      bond_offr_mcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "채권모집방법명",
      },
      txtn_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "과세구분코드",
      },
      txtn_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "과세구분명",
      },
      pamt_rdpt_mcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "원리금상환방법코드",
      },
      pamt_rdpt_mcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "원리금상환방법명",
      },
      strips_psbl_yn: {
        type: Sequelize.STRING(1),
        allowNull: true,
        comment: "분리채권가능여부",
      },
      strips_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "분리채권명",
      },
      pris_lnkg_bond_yn: {
        type: Sequelize.STRING(1),
        allowNull: true,
        comment: "물가연동채권여부",
      },
      piam_pay_inst_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "원리금지급기관명",
      },
      piam_pay_brof_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "원리금지급영업점명",
      },
      cpt_usge_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "자금용도구분코드",
      },
      cpt_usge_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "자금용도구분명",
      },
      bond_reg_inst_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "채권등록기관구분코드",
      },
      bond_reg_inst_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "채권등록기관구분명",
      },
      issu_dpty_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "발행대리인명",
      },
      bond_undt_inst_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "채권인수기관명",
      },
      bond_grn_inst_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "채권보증기관명",
      },
      cpbd_mng_cmpy_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "전자단기사채관리기관명",
      },
      crfnd_yn: {
        type: Sequelize.STRING(1),
        allowNull: true,
        comment: "신용부도여부",
      },
      prmnc_bond_yn: {
        type: Sequelize.STRING(1),
        allowNull: true,
        comment: "실적채권여부",
      },
      qib_trgt_scrt_yn: {
        type: Sequelize.STRING(1),
        allowNull: true,
        comment: "적격기관투자자대상증권여부",
      },
      prmnc_bond_tmn_dt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "실적채권종료일자",
      },
      rgt_exert_mnbd_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "권리행사주체구분코드",
      },
      rgt_exert_mnbd_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "권리행사주체구분명",
      },
      qib_tmn_dt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "적격기관투자자종료일자",
      },
      int_pay_cycl_ctt: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "이자지급주기내용",
      },
      nxtm_copn_dt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "차회이표일",
      },
      rbf_copn_dt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "직전이표일",
      },
      bnk_hldy_int_pydy_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "은행휴일이자지급일구분코드",
      },
      bnk_hldy_int_pydy_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "은행휴일이자지급일구분명",
      },
      sttr_hldy_int_pydy_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "법정휴일이자지급일구분코드",
      },
      sttr_hldy_int_pydy_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "법정휴일이자지급일구분명",
      },
      int_pay_mmnt_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "이자지급시기구분코드",
      },
      int_pay_mmnt_dcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "이자지급시기구분명",
      },
      elps_int_pay_yn: {
        type: Sequelize.STRING(1),
        allowNull: true,
        comment: "경과이자지급여부",
      },
      kis_scrs_itms_kcd: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: "한국신용평가유가증권종류코드",
      },
      kis_scrs_itms_kcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "한국신용평가유가증권종류명",
      },
      kbp_scrs_itms_kcd: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: "한국채권평가유가증권종류코드",
      },
      kbp_scrs_itms_kcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "한국채권평가유가증권종류명",
      },
      nice_scrs_itms_kcd: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: "나이스신용평가유가증권종류코드",
      },
      nice_scrs_itms_kcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "나이스신용평가유가증권종류명",
      },
      fn_scrs_itms_kcd: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: "에프앤신용평가유가증권종류코드",
      },
      fn_scrs_itms_kcd_nm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "에프앤신용평가유가증권종류명",
      },
    });

    // // 인덱스 추가
    // await queryInterface.addIndex("bond_basics", ["isin_cd"], {
    //   name: "idx_bond_basics_isin_cd",
    // });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("bond_basics");
  },
};
