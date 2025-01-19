"use strict";

module.exports = (sequelize, DataTypes) => {
  const BondIssue = sequelize.define(
    "BondIssue",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      bas_dt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "기준일자",
      },
      crno: {
        type: DataTypes.STRING(13),
        allowNull: true,
        comment: "법인등록번호",
      },
      scrs_itms_kcd: {
        type: DataTypes.STRING(4),
        allowNull: true,
        comment: "유가증권종류코드",
      },
      isin_cd: {
        type: DataTypes.STRING(12),
        allowNull: false,
        comment: "ISIN코드",
      },
      scrs_itms_kcd_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "유가증권종류명",
      },
      bond_isur_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "채권발행기관명",
      },
      isin_cd_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "ISIN코드명",
      },
      bond_issu_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "채권발행일자",
      },
      bond_issu_frmt_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "채권발행형태명",
      },
      bond_issu_amt: {
        type: DataTypes.DECIMAL(20, 0),
        allowNull: true,
        comment: "채권발행금액",
      },
      bond_issu_cur_cd: {
        type: DataTypes.STRING(3),
        allowNull: true,
        comment: "채권발행통화코드",
      },
      bond_issu_cur_cd_nm: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "채권발행통화명",
      },
      bond_expr_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "채권만기일자",
      },
      bond_pymt_amt: {
        type: DataTypes.DECIMAL(20, 0),
        allowNull: true,
        comment: "채권상환금액",
      },
      irt_chng_dcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "금리변동구분코드",
      },
      irt_chng_dcd_nm: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "금리변동구분명",
      },
      bond_srfc_inrt: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        comment: "채권표면이율",
      },
      bond_int_tcd: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "채권이자유형코드",
      },
      bond_int_tcd_nm: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "채권이자유형명",
      },
    },
    {
      tableName: "bond_issues",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          name: "idx_bond_issues_isin_cd",
          fields: ["isin_cd"],
        },
      ],
    }
  );

  BondIssue.associate = function (models) {
    BondIssue.hasMany(models.BondPrice, {
      foreignKey: "isin_cd",
      sourceKey: "isin_cd",
      as: "prices",
      constraints: false,
    });
  };

  return BondIssue;
};
