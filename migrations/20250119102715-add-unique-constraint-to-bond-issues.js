"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("bond_issues", {
      fields: ["isin_cd"],
      type: "unique",
      name: "unique_isin_cd_on_bond_issues",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "bond_issues",
      "unique_isin_cd_on_bond_issues"
    );
  },
};
