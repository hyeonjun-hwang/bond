"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("bond_issues", {
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
        type: Sequelize.STRING(13),
        allowNull: true,
        comment: "법인등록번호",
      },
      scrs_itms_kcd: {
        type: Sequelize.STRING(4),
        allowNull: true,
        comment: "유가증권종류코드",
      },
      isin_cd: {
        type: Sequelize.STRING(12),
        allowNull: false,
        comment: "ISIN코드",
      },
      scrs_itms_kcd_nm: {
        type: Sequelize.STRING(100),
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
        comment: "ISIN코드명",
      },
      bond_issu_dt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "채권발행일자",
      },
      bond_issu_frmt_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "채권발행형태명",
      },
      bond_issu_amt: {
        type: Sequelize.DECIMAL(20, 0),
        allowNull: true,
        comment: "채권발행금액",
      },
      bond_issu_cur_cd: {
        type: Sequelize.STRING(3),
        allowNull: true,
        comment: "채권발행통화코드",
      },
      bond_issu_cur_cd_nm: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: "채권발행통화명",
      },
      bond_expr_dt: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "채권만기일자",
      },
      bond_pymt_amt: {
        type: Sequelize.DECIMAL(20, 0),
        allowNull: true,
        comment: "채권상환금액",
      },
      irt_chng_dcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "금리변동구분코드",
      },
      irt_chng_dcd_nm: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "금리변동구분명",
      },
      bond_srfc_inrt: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
        comment: "채권표면이율",
      },
      bond_int_tcd: {
        type: Sequelize.STRING(2),
        allowNull: true,
        comment: "채권이자유형코드",
      },
      bond_int_tcd_nm: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "채권이자유형명",
      },
    });

    await queryInterface.addIndex("bond_issues", ["isin_cd"], {
      name: "idx_bond_issues_isin_cd",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("bond_issues", "idx_bond_issues_isin_cd");
    await queryInterface.dropTable("bond_issues");
  },
};
