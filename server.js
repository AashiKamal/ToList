//Importing the required modules
const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const home = require("./routes/auth")
const password = require("./routes/password")
const details = require("./routes/details")





//Importing the dotenv file through dotenv module
dotenv.config({ path: "./.env" });
const app = express();





console.log(__dirname);

app.use(express.static('/public'));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true 
}));

app.use('/', home)
app.use('/password', password)
app.use('/details', details)


  app.get('/welcome', (req, res) => {
    // Assuming you have retrieved the user information from the database
    const user = req.body.email
    res.render('welcome.ejs', { user });
  });
  


//Server is listening to port numberss..
app.listen(1000, () => {
  console.log("Server is running on port 1000");
});



































































