require("dotenv").config();
const cron = require("node-cron");

const scheduleBondIssue = cron.schedule(
  "*/5 * * * * *",
  () => {
    console.log("interval 5 sec", new Date().toLocaleString("ko-KR"));
  },
  {
    scheduled: false,
  }
);

scheduleBondIssue.start();
