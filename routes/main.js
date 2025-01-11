const express = require("express");
const router = express.Router();
const { getBondsList } = require("../controllers/bondViewController");
const { getHome } = require("../controllers/homeViewController");
const { getBondDetail } = require("../controllers/bondDetailViewController");

router.get("/", getHome);

router.get("/bonds_list", getBondsList);
router.get("/bonds_list/:id", getBondDetail);

module.exports = router;
