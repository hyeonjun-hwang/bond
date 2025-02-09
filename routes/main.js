const express = require("express");
const router = express.Router();
const { getBondsList } = require("../controllers/bondViewController");
const { getHome } = require("../controllers/homeViewController");
const { getBondDetail } = require("../controllers/bondDetailViewController");
const {
  getBondDiscovery,
  getBondDiscoveryCredit,
} = require("../controllers/bondDiscoveryController");
router.get("/", getHome);

router.get("/bonds_list", getBondsList);
router.get("/bonds_list/:id", getBondDetail);
router.get("/bond_discovery", getBondDiscovery, getBondDiscoveryCredit);

module.exports = router;
