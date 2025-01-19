"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // bond_basics에 인덱스 추가
    await queryInterface.addIndex("bond_basics", ["isin_cd"], {
      name: "idx_bond_basics_isin_cd",
      unique: true, // isin_cd는 유니크해야 함
    });

    // bond_prices에 인덱스 추가
    await queryInterface.addIndex("bond_prices", ["isin_cd"], {
      name: "idx_bond_prices_isin_cd", // 유니크하지 않음
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("bond_basics", "idx_bond_basics_isin_cd");
    await queryInterface.removeIndex("bond_prices", "idx_bond_prices_isin_cd");
  },
};
