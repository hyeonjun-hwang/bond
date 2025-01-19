"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 불필요한 인덱스들 제거
    await queryInterface.removeIndex("bond_prices", "idx_bond_prices_isin_cd");
    await queryInterface.removeIndex(
      "bond_prices",
      "idx_bond_prices_mrkt_isin_dt"
    );
  },

  down: async (queryInterface, Sequelize) => {
    // 롤백시 인덱스 복구
    await queryInterface.addIndex("bond_prices", ["isin_cd"], {
      name: "idx_bond_prices_isin_cd",
    });
    await queryInterface.addIndex(
      "bond_prices",
      ["mrkt_ctg", "isin_cd", "bas_dt"],
      {
        name: "idx_bond_prices_mrkt_isin_dt",
      }
    );
  },
};
