"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("bond_prices", "created_at");
    await queryInterface.removeColumn("bond_prices", "updated_at");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("bond_prices", "created_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now"),
    });
    await queryInterface.addColumn("bond_prices", "updated_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now"),
    });
  },
};
