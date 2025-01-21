require("dotenv").config();
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const db = require("./models"); // Sequelize 모델 import

// 테스트용 라우트 추가
const test2Router = require("./routes/test2Route");

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "./views");

// 메인 페이지 라우트
app.use("/", require("./routes/main"));

// 테스트용 라우트 사용
app.use("/api", require("./routes/test2Route"));

// 에러 핸들링 미들웨어 (맨 마지막에 추가)
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

app.use(express.static("public"));

const port = process.env.PORT || 3000;

// DB 연결 확인 후 서버 시작
db.sequelize
  .authenticate()
  .then(() => {
    console.log("🟢 Database connection has been established successfully.");

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Unable to connect to the database:", err);
  });
