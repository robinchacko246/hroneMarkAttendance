"use strict";

const { fetch } = require("../handler/fetch-clockify");

fetch();
// async function test() {
//   var body = {
//     "dateRangeStart": "2021-02-26T00:00:00.000",
//     "dateRangeEnd": "2021-02-26T23:59:59.000",
//     "detailedFilter": {
//       "page": 1,
//       "pageSize": 200
//     },
//     "users": {
//       "status": "ALL"
//     }
//   };


//   var data = await fetch(
//     {
//       body: JSON.stringify(body),
//     },

//   ).catch(console.log);



//   console.log("reponse", data);
// }

// setTimeout(() => {
//   test();
// }, 3000);
