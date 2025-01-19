"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 기존 인덱스 제거
    await queryInterface.removeIndex(
      "bond_prices",
      "idx_bond_prices_isin_bas_dt"
    );
    await queryInterface.removeIndex(
      "bond_prices",
      "idx_bond_prices_mrkt_isin_dt"
    );

    // unique constraint와 함께 새로운 인덱스 추가
    await queryInterface.addIndex(
      "bond_prices",
      ["bas_dt", "isin_cd", "mrkt_ctg"],
      {
        name: "uk_bond_prices_date_isin_market",
        unique: true,
      }
    );

    // 기존 인덱스 다시 추가 (성능을 위해)
    await queryInterface.addIndex(
      "bond_prices",
      ["mrkt_ctg", "isin_cd", "bas_dt"],
      {
        name: "idx_bond_prices_mrkt_isin_dt",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // unique constraint 제거
    await queryInterface.removeIndex(
      "bond_prices",
      "uk_bond_prices_date_isin_market"
    );

    // 기존 인덱스 복구
    await queryInterface.addIndex("bond_prices", ["isin_cd", "bas_dt"], {
      name: "idx_bond_prices_isin_bas_dt",
    });
  },
};
