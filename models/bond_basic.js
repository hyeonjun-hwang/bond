"use strict";

module.exports = (sequelize, DataTypes) => {
  const BondBasic = sequelize.define(
    "BondBasic",
    {
      // 기본키
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      // 기준일자 및 식별자
      bas_dt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "기준일자",
      },
      crno: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "법인등록번호",
      },
      isin_cd: {
        type: DataTypes.STRING(12),
        allowNull: false,
        comment: "국제채권식별번호",
      },
      // 채권 분류 정보
      scrs_itms_kcd: {
        type: DataTypes.STRING(4),
        allowNull: true,
        comment: "유가증권종류코드",
      },
      scrs_itms_kcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "유가증권종류명",
      },
      // 발행 관련 정보
      bond_isur_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "채권발행기관명",
      },
      isin_cd_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "채권명",
      },
      bond_issu_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "발행일",
      },
      bond_issu_amt: {
        type: DataTypes.DECIMAL(20, 0),
        allowNull: true,
        comment: "발행금액",
      },
      bond_issu_cur_cd: {
        type: DataTypes.STRING(3),
        allowNull: true,
        comment: "통화코드",
      },
      bond_issu_cur_cd_nm: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "통화명",
      },
      // 옵션 정보
      optn_tcd: {
        type: DataTypes.STRING(4),
        allowNull: true,
        comment: "옵션종류코드",
      },
      optn_tcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "옵션종류명",
      },
      // 기타 정보
      sic_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "표준산업분류명",
      },
      bond_expr_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "만기일",
      },
      // 이자 계산 관련
      int_cmpu_mcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "이자계산방법코드",
      },
      int_cmpu_mcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "이자계산방법명",
      },
      bond_pymt_amt: {
        type: DataTypes.DECIMAL(20, 0),
        allowNull: true,
        comment: "상환금액",
      },
      irt_chng_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "이자율변동구분코드",
      },
      irt_chng_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "이자율변동구분명",
      },
      bond_srfc_inrt: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        comment: "표면금리",
      },
      bond_bal: {
        type: DataTypes.DECIMAL(20, 0),
        allowNull: true,
        comment: "채권잔액",
      },
      // 보증 및 이자 관련
      grn_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "보증구분코드",
      },
      grn_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "보증구분명",
      },
      bond_int_tcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "채권이자유형코드",
      },
      bond_int_tcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "채권이자유형명",
      },
      // 순위 및 특수채권 관련
      bond_rnkn_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "채권순위구분코드",
      },
      bond_rnkn_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "채권순위구분명",
      },
      pclr_bond_kcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "특수채권종류코드",
      },
      pclr_bond_kcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "특수채권종류명",
      },
      // 상장 및 공모 관련
      lstg_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "상장일",
      },
      bond_offr_mcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "채권공모구분코드",
      },
      bond_offr_mcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "채권공모구분명",
      },
      // 과세 및 상환 관련
      txtn_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "과세구분코드",
      },
      txtn_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "과세구분명",
      },
      pamt_rdpt_mcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "원리금상환방법코드",
      },
      pamt_rdpt_mcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "원리금상환방법명",
      },
      // STRIPS 관련
      strips_psbl_yn: {
        type: DataTypes.STRING(1),
        allowNull: true,
        comment: "분리채권가능여부",
      },
      strips_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "분리채권명",
      },
      // 물가연동 관련
      pris_lnkg_bond_yn: {
        type: DataTypes.STRING(1),
        allowNull: true,
        comment: "물가연동채권여부",
      },
      // 지급 관련 기관
      piam_pay_inst_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "원리금지급기관명",
      },
      piam_pay_brof_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "원리금지급기관부서명",
      },
      // 자금 사용 관련
      cpt_usge_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "자금사용구분코드",
      },
      cpt_usge_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "자금사용구분명",
      },
      // 등록 및 관리 기관
      bond_reg_inst_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "채권등록기관구분코드",
      },
      bond_reg_inst_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "채권등록기관구분명",
      },
      issu_dpty_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "발행대리인명",
      },
      bond_undt_inst_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "채권인수기관명",
      },
      bond_grn_inst_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "채권보증기관명",
      },
      cpbd_mng_cmpy_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "CP/CD관리기관명",
      },
      // 기타 여부
      crfnd_yn: {
        type: DataTypes.STRING(1),
        allowNull: true,
        comment: "신용펀드여부",
      },
      prmnc_bond_yn: {
        type: DataTypes.STRING(1),
        allowNull: true,
        comment: "실적채권여부",
      },
      qib_trgt_scrt_yn: {
        type: DataTypes.STRING(1),
        allowNull: true,
        comment: "적격기관투자자대상증권여부",
      },
      prmnc_bond_tmn_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "실적채권종료일",
      },
      // 권리행사 관련
      rgt_exert_mnbd_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "권리행사주체구분코드",
      },
      rgt_exert_mnbd_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "권리행사주체구분명",
      },
      qib_tmn_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "적격기관투자자종료일",
      },
      // 이자지급 관련
      int_pay_cycl_ctt: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "이자지급주기내용",
      },
      nxtm_copn_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "차회이표일",
      },
      rbf_copn_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "직전이표일",
      },
      bnk_hldy_int_pydy_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "은행휴일이자지급일구분코드",
      },
      bnk_hldy_int_pydy_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "은행휴일이자지급일구분명",
      },
      sttr_hldy_int_pydy_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "법정휴일이자지급일구분코드",
      },
      sttr_hldy_int_pydy_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "법정휴일이자지급일구분명",
      },
      int_pay_mmnt_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "이자지급시기구분코드",
      },
      int_pay_mmnt_dcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "이자지급시기구분명",
      },
      elps_int_pay_yn: {
        type: DataTypes.STRING(1),
        allowNull: true,
        comment: "경과이자지급여부",
      },
      // 평가사 관련 코드
      kis_scrs_itms_kcd: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "한국신용평가유가증권종류코드",
      },
      kis_scrs_itms_kcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "한국신용평가유가증권종류명",
      },
      kbp_scrs_itms_kcd: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "한국채권평가유가증권종류코드",
      },
      kbp_scrs_itms_kcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "한국채권평가유가증권종류명",
      },
      nice_scrs_itms_kcd: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "나이스신용평가유가증권종류코드",
      },
      nice_scrs_itms_kcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "나이스신용평가유가증권종류명",
      },
      fn_scrs_itms_kcd: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "에프앤신용평가유가증권종류코드",
      },
      fn_scrs_itms_kcd_nm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "에프앤신용평가유가증권종류명",
      },
    },
    {
      tableName: "bond_basics",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          name: "idx_bond_basics_isin_cd",
          fields: ["isin_cd"],
        },
      ],
    }
  );

  BondBasic.associate = function (models) {
    BondBasic.hasMany(models.BondPrice, {
      foreignKey: "isin_cd",
      sourceKey: "isin_cd",
      as: "prices",
      constraints: false,
    });
  };

  return BondBasic;
};
