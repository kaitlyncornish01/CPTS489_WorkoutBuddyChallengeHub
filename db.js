const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hudson*ca202406", //change to your password
    database: "workout_app" 
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected!");
});

module.exports = db;