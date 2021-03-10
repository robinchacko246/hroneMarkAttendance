

const mysql     = require('mysql');
const util      = require('util');
const CONFIG = require("../config/env")


/*-- MySQL Connection Async/Await --*/
var pool = mysql.createPool({
    host: CONFIG.DATABASE.host
    ,port:CONFIG.DATABASE.port
    ,user: CONFIG.DATABASE.user
    ,password: CONFIG.DATABASE.password
    ,database: CONFIG.DATABASE.database
})
pool.query = util.promisify(pool.query);
pool.getConnection = util.promisify(pool.getConnection);

(async() =>{
    try{
      await pool.query('SELECT NOW() AS "theTime"');
      
     
      console.log("Mysql Connected Successfully");
    }catch(err){
      console.log(err);
    }
  })();
module.exports.pool = pool;

