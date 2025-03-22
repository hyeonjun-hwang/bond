"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

// Sequelize 인스턴스 생성
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// models 디렉토리의 모든 모델 파일 로드
fs.readdirSync(__dirname)
  .filter((file) => {
    // fs.readdirSync(__dirname)로 반환된 배열에서 파일 이름이 .으로 시작하지 않고 .js 확장자를 가지면서 현재 파일(index.js)이 아닌걸로 새 배열을 만듬
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const modelFunction = require(path.join(__dirname, file)); // models 디렉토리 내 모든 모델 파일 로드 (모델 파일들은 함수를 보내는 형태 (sequelize, DataTypes) => {...})
    const model = modelFunction(sequelize, Sequelize.DataTypes); // 모델 파일로 받은 함수를 호출하여 모델 인스턴스 생성
    db[model.name] = model; // 모델 인스턴스를 db 객체에 추가
  });

// 모델 간 관계 설정
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// const BondBasic = require("./bond_basic")(sequelize, Sequelize.DataTypes);
// console.log("BondBasic 모델 설정:", BondBasic.options);

// sequelize 인스턴스와 Sequelize 클래스를 db 객체에 추가
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// db 객체 내보내기
module.exports = db;
