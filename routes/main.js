const express = require("express");
const router = express.Router();
const { getBondsList } = require("../controllers/bondViewController");

router.get("/", getBondsList);

module.exports = router;
