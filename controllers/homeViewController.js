const asyncHandler = require("express-async-handler");

const getHome = asyncHandler(async (req, res) => {
  res.render("home", {
    layout: "../views/layouts/main",
    title: "홈",
  });
});

module.exports = { getHome };
