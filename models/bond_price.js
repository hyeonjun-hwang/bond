"use strict";

module.exports = (sequelize, DataTypes) => {
  const BondPrice = sequelize.define(
    "BondPrice",
    {
      // 복합 기본키가 될 필드들
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      bas_dt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      isin_cd: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      // 나머지 필드들
      srtn_cd: {
        type: DataTypes.STRING(9),
        allowNull: true,
      },
      itms_nm: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      mrkt_ctg: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      clpr_prc: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      clpr_vs: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      clpr_bnf_rt: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
      },
      mkp_prc: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      mkp_bnf_rt: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
      },
      hipr_prc: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      hipr_bnf_rt: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
      },
      lopr_prc: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      lopr_bnf_rt: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
      },
      tr_qu: {
        type: DataTypes.DECIMAL(20, 0),
        allowNull: true,
      },
      tr_prc: {
        type: DataTypes.DECIMAL(20, 0),
        allowNull: true,
      },
    },
    {
      tableName: "bond_prices",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          name: "idx_bond_prices_isin_bas_dt",
          fields: ["isin_cd", "bas_dt"],
        },
        {
          name: "idx_bond_prices_mrkt_isin_dt",
          fields: ["mrkt_ctg", "isin_cd", "bas_dt"],
        },
      ],
      get() {
        const attributes = Object.assign({}, this.dataValues);
        return attributes;
      },
    }
  );

  BondPrice.associate = function (models) {
    BondPrice.belongsTo(models.BondBasic, {
      foreignKey: "isin_cd",
      targetKey: "isin_cd",
      as: "basic",
      constraints: false,
    });

    BondPrice.belongsTo(models.BondIssue, {
      foreignKey: "isin_cd",
      targetKey: "isin_cd",
      as: "issue",
      constraints: false,
    });
  };

  return BondPrice;
};
