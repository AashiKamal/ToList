const express = require('express');
const connection = require('../database/connection');
const router = express.Router()
const bcrypt = require('bcrypt')



//Authentication is working here function is checking the details 
router.post("/showdetails", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    connection.query('SELECT * FROM authenticate WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.error("Error ocurred while fetching user data:", error);
        return res.status(500).send("Error ocurred while fetching user data");
      }
  
      if (results.length > 0) {
        const comparision = await bcrypt.compare(password, results[0].password);
        if (comparision) {
          req.session.username = results[0].name; // Store the username in the session
          
          connection.query('SELECT * FROM authenticate WHERE email = ?', [email], (error, result) => {
            let name = results[0].name; // Store the username in the session  
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

  module.exports = router