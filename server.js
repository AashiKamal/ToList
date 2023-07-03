//Importing the required modules
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const home = require("./routes/auth")
const password = require("./routes/password")
const details = require("./routes/details")
const connection = require('./database/connection');

//Zam Secret



//Importing the dotenv file through dotenv module
dotenv.config({ path: "./.env" });
const app = express();



//Setting up the middlwware for handling the requests on a specifies Url
app.use(express.json());
app.use('/', express.static('public'));
app.set("view engine", "ejs");
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

app.get('/addTask', (req, res) => {

    connection.query(`insert into tasklist values('${req.query.name}', '${req.query.task}')`)
})

app.get('/gettask', (req, res) => {

    connection.query(`SELECT task from tasklist where name = '${req.query.name}'`, (err, result) => {

        res.json(result)
    })
})

app.get('/deltask', (req, res) => {

    let name = req.query.name
    let task = req.query.task
    connection.query(`delete from tasklist where name = '${name}' and task = '${task}'`)
})

app.get('/welcome', (req, res) => {
  // retrieved the user information from the database
  const user = req.body.email
  res.render('welcome.ejs', { user });
});

app.get('/logout', (req, res) => {
    res.cookie('auth_token', "", {maxAge: 1});
    res.redirect('/');
});

//Server is listening to port numberss..
app.listen(1000, () => {
  console.log("Server is running on port 1000");
});



































































