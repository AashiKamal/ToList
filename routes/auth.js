//Importing module of nodejs and also from other file
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const connection = require('../database/connection')
const jwt = require('jsonwebtoken')


// if token is valid and user trying to login or register render user to dashboard directly...
const auth = async function(req, res, next) {
    token = req.cookies.auth_token;

    if(!token) {
        return next();
    }
    try {
        const info = await jwt.verify(token, process.env.JWT_PRIVATE_TOKEN || "UNSECURED_JWT_PRIVATE_TOKEN")
        const email = info.email
        console.log(email)
        connection.query(`select * from authenticate where email = '${email}'`, (err, result) => {
            if (!result[0]) {
               return next();
            }  

            connection.query('SELECT * FROM authenticate WHERE email = ?', [email], (error, result) => {
                let name = result[0].name;   
                res.render("welcome.ejs", {name});
            })

        })


    } catch (error) {
      
        return next();
    }
}


router.get("/", auth, (req, res) => {
  let error = ''
  res.render("login.ejs", {error});
});

router.get("/register", (req, res) => {
  let error = ''
  res.render("register.ejs", {error});
});


router.post("/adddetails", (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
  

      connection.query(`select * from authenticate where name = '${name}'`, (err, result) => {

          if(result[0] == undefined){
            bcrypt.hash(password, 10, (err, encryptedPassword) => {
              if (err) {
                console.error("Error hashing password:", err);
                return res.status(500).send("Error hashing password");
              }
          
              const query = "INSERT INTO authenticate (name, email, password) VALUES (?, ?, ?)";
              const values = [name, email, encryptedPassword];
          
              connection.query(query, values, (err, result) => {
                if (err) {
                  console.error("Error inserting data into the database:", err);
                  return res.status(500).send("Error inserting data into the database");
                }
          
                console.log("Data saved successfully");
                let error = ''
                res.render('login.ejs', {error});
              
              });
            });
          }

          else{
            let error = 'User Already Exist'
            res.render('register.ejs', {error})
          }
      })

  });

  
module.exports = router

