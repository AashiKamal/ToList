const express = require('express');
const connection = require('../database/connection');
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');


const generateAuthToken = (email)=> {
    const expiresIn = 60 * 60; // an hour
    let token = jwt.sign({
        email: email,
    }, process.env.JWT_PRIVATE_TOKEN || "UNSECURED_JWT_PRIVATE_TOKEN", {expiresIn: expiresIn});
    
    return token;
}

// if token is valid and user trying to login or register render user to dashboard directly...
const auth = async function(req, res, next) {
    token = req.cookies.auth_token;
    if(!token) {
        return next();
    }
    try {
        const {email} = jwt.verify(token, process.env.JWT_PRIVATE_TOKEN || "UNSECURED_JWT_PRIVATE_TOKEN");
        
        connection.query(`select * from user where email = '${email}'`, (err, result) => {
            if (!result[0]) {
               return next();
            }  

            connection.query('SELECT * FROM user WHERE email = ?', [email], (error, result) => {
                let name = result[0].name;   
                res.render("welcome.ejs", {name});
            })

        })



    } catch (error) {
        return next();
    }
}

router.get('/showdetails', auth, (req, res) => {
    res.render('login.ejs', {error : ''})
})

const generateAuthToken = (email)=> {
    const expiresIn = 60 * 60; // an hour
    let token = jwt.sign({
        email: email,
    }, process.env.JWT_PRIVATE_TOKEN || "UNSECURED_JWT_PRIVATE_TOKEN", {expiresIn: expiresIn});
    
    return token;
}

// if token is valid and user trying to login or register render user to dashboard directly...
const auth = async function(req, res, next) {
    token = req.cookies.auth_token;
    if(!token) {
        return next();
    }
    try {
        const {email} = jwt.verify(token, process.env.JWT_PRIVATE_TOKEN || "UNSECURED_JWT_PRIVATE_TOKEN");
        
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


//Authentication is working here function is checking the details 
router.post("/showdetails", auth, (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    connection.query('SELECT * FROM user WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.error("Error ocurred while fetching user data:", error);
        return res.status(500).send("Error ocurred while fetching user data");
      }
  
      if (results.length > 0) {
        const comparision = await bcrypt.compare(password, results[0].password);
        if (comparision) {
          let maxAge = 60*60;
<<<<<<< HEAD
          
          const token = await generateAuthToken(email);

          res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge}); 
          
          connection.query('SELECT * FROM user WHERE email = ?', [email], (error, result) => {
=======
          
          const token = await generateAuthToken(email);

          res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge}); 
          
          connection.query('SELECT * FROM authenticate WHERE email = ?', [email], (error, result) => {
>>>>>>> 34fbd6fd3acfb47c3e294e8d047a45952814386d
            let name = results[0].name;   
            res.render("welcome.ejs", {name});
        })
        } else {
          let error = 'invalid username or password'
          res.render('login.ejs', {error});
        }
      } else {
        res.send({
          "code": 206,
          "success": "Email does not exist"
        });
      }
    });
  
  });

  
  module.exports.auth = auth
  module.exports = router