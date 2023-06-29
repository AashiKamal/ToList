const mysql = require('mysql2')
require('dotenv').config()


const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL database:", error);
    throw error;
  }
  console.log("Connected to MySQL database!");
});

module.exports = connection