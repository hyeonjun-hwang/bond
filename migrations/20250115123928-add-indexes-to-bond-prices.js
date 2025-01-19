"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 복합 인덱스 추가 (isin_cd + bas_dt)
    await queryInterface.addIndex("bond_prices", ["isin_cd", "bas_dt"], {
      name: "idx_bond_prices_isin_bas_dt",
    });

    // 시장구분별 조회를 위한 인덱스
    await queryInterface.addIndex(
      "bond_prices",
      ["mrkt_ctg", "isin_cd", "bas_dt"],
      {
        name: "idx_bond_prices_mrkt_isin_dt",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      "bond_prices",
      "idx_bond_prices_isin_bas_dt"
    );
    await queryInterface.removeIndex(
      "bond_prices",
      "idx_bond_prices_mrkt_isin_dt"
    );
  },
};
