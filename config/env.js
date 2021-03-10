console.log("-------configuration------");

const env = process.env.STAGE || "local"; // dev or production
const Config = require(`./${env}.env.json`); // dev.env.json or production.env.json
console.log(`CURRENT ENVIRONMENT: : ${env}`);
console.log(`Config : ${JSON.stringify(Config)}`);




module.exports = Config;
