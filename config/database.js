require("dotenv").config();

module.exports = {
  development: {
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "bond_service_dev",
    host: process.env.POSTGRES_HOST || "localhost",
    dialect: "postgres",
    timezone: "+09:00",
    logging: false,
  },
  test: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB || "bond_service_test",
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
    timezone: "+09:00",
    logging: false,
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
    timezone: "+09:00",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
