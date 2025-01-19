'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BondBasic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BondBasic.init({
    bas_dt: DataTypes.DATE,
    isin_cd: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BondBasic',
  });
  return BondBasic;
};