const sql = require("./db.js");

// constructor
class Employee {

  constructor(employees) {
    this.id = employees.id;
    this.email_id = employees.email.id;
    this.emp_id = employees.emp_id;
    this.clockify_id = employees.clockify_id;
  }

  static find() {
    return new Promise((resolve, reject) => {
      sql.query('SELECT * FROM employees', (err, res) => {
        if (err) {
          console.log("error: ", err);
          reject(err);
        }
        return resolve(res);
      });
    });
  }
}

module.exports = Employee; 