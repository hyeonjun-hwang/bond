"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("bond_prices", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      bas_dt: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: "기준일자 (YYYYMMDD)",
      },
      isin_cd: {
        type: Sequelize.STRING(12),
        allowNull: false,
        comment: "국제 채권 식별 번호",
      },

      // 기타 필드들
      srtn_cd: {
        type: Sequelize.STRING(9),
        allowNull: true,
        comment: "단축코드",
      },
      itms_nm: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "종목명",
      },
      mrkt_ctg: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "시장구분",
      },
      clpr_prc: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
        comment: "종가",
      },
      clpr_vs: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
        comment: "전일대비",
      },
      clpr_bnf_rt: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
        comment: "수익률",
      },
      mkp_prc: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
        comment: "시가",
      },
      mkp_bnf_rt: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
        comment: "시가수익률",
      },
      hipr_prc: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
        comment: "고가",
      },
      hipr_bnf_rt: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
        comment: "고가수익률",
      },
      lopr_prc: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
        comment: "저가",
      },
      lopr_bnf_rt: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
        comment: "저가수익률",
      },
      tr_qu: {
        type: Sequelize.DECIMAL(20, 0),
        allowNull: true,
        comment: "거래량",
      },
      tr_prc: {
        type: Sequelize.DECIMAL(20, 0),
        allowNull: true,
        comment: "거래대금",
      },

      // 타임스탬프
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("bond_prices");
  },
};
