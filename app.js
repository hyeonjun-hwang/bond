require("dotenv").config();
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./config/db");

connectDB();

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "./views");

// 메인 페이지 라우트
app.use("/", require("./routes/main"));

// 채권발행정보 요청 테스트용 라우트 추가
app.use("/api", require("./routes/test2Route"));

// 에러 핸들링 미들웨어 (맨 마지막에 추가)
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

app.use(express.static("public"));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
