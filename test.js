// API 호출 예제
// var request = require("request");

var url =
  "http://apis.data.go.kr/1160100/service/GetBondTradInfoService/getIssuIssuItemStat";
var queryParams =
  "?" +
  encodeURIComponent("serviceKey") +
  "=" +
  process.env.BOND_ISSUE_SERVICE_KEY_ENCODING; /* Service Key*/
queryParams +=
  "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1"); /* */
queryParams +=
  "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("1"); /* */
queryParams +=
  "&" +
  encodeURIComponent("resultType") +
  "=" +
  encodeURIComponent("xml"); /* */
queryParams +=
  "&" +
  encodeURIComponent("basDt") +
  "=" +
  encodeURIComponent("20220926"); /* */
queryParams +=
  "&" +
  encodeURIComponent("crno") +
  "=" +
  encodeURIComponent("1101350000937"); /* */
queryParams +=
  "&" +
  encodeURIComponent("bondIsurNm") +
  "=" +
  encodeURIComponent("한국산업은행"); /* */

console.log(url + queryParams);
