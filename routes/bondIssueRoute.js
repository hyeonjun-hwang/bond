const express = require("express");
const router = express.Router();
const { fetchBondIssueData } = require("../controllers/bondIssueController");

router.get("/bonds/issue", fetchBondIssueData);

module.exports = router;
