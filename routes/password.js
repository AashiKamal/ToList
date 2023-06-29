const express = require('express')
const router = express.Router()
const nodemailer = require("nodemailer");
const connection = require('../database/connection')
const bcrypt = require('bcrypt')

router.get("/forgotpassword", (req, res) => {
    res.render("forgotpassword.ejs");
  });
  
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  
  router.post("/forgotpassword", (req, res) => {
    const email = req.body.email;
  
    // Check if the email exists in the database
    connection.query('SELECT * FROM authenticate WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.error("Error occurred while fetching user data:", error);
        return res.status(500).send("Error occurred while fetching user data");
      }
  
      if (results.length > 0) {
        // Generate a password reset token (you can use any method to generate a token)
        const resetToken = Math.random().toString(36).slice(-8);
  
        // Update the user's reset_token field in the database
        connection.query('UPDATE authenticate SET reset_token = ? WHERE email = ?', [resetToken, email], async (error, results) => {
          if (error) {
            console.error("Error occurred while updating reset token:", error);
            return res.status(500).send("Error occurred while updating reset token");
          }
  
          // Send the password reset email
          const mailOptions = {
            from: "1122siya1234@gmail.com",
            to: email,
            subject: "Password Reset",
            text: `You have requested to reset your password. Please click on the following link to reset your password: http://localhost:1000/password/resetpassword/${resetToken}`,
          };
  
          try {
            await transporter.sendMail(mailOptions);
            console.log("Password reset email sent. Please check your email.");
            res.send("Password reset email sent. Please check your email.");
          } catch (error) {
            console.error("Error occurred while sending password reset email:", error);
            res.status(500).send("Error occurred while sending password reset email");
          }
        });
      } else {
        res.send({
          "code": 206,
          "success": "Email does not exist",
        });
      }
    });
  });
  
  router.get("/resetpassword/:token", (req, res) => {
    const resetToken = req.params.token;
  
    // Check if the reset token exists in the database
    connection.query('SELECT * FROM authenticate WHERE reset_token = ?', [resetToken], (error, results) => {
      if (error) {
        console.error("Error occurred while fetching user data:", error);
        return res.status(500).send("Error occurred while fetching user data");
      }
  
      if (results.length > 0) {
        // Render the password reset page with the reset token
        res.render("resetpassword.ejs", { resetToken });
      } else {
        res.send("Invalid reset token");
      }
    });
  });
  
  router.post("/resetpassword/:token", (req, res) => {
    const resetToken = req.params.token;
    const newPassword = req.body.newPassword;
  
    // Check if the reset token exists in the database
    connection.query('SELECT * FROM authenticate WHERE reset_token = ?', [resetToken], async (error, results) => {
      if (error) {
        console.error("Error occurred while fetching user data:", error);
        return res.status(500).send("Error occurred while fetching user data");
      }
  
      if (results.length > 0) {
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
  
        // Update the user's password and reset_token fields in the database
        connection.query('UPDATE authenticate SET password = ?, reset_token = NULL WHERE reset_token = ?', [encryptedPassword, resetToken], async (error, results) => {
          if (error) {
            console.error("Error occurred while updating password:", error);
            return res.status(500).send("Error occurred while updating password");
          }
  
          res.redirect('/');
        });
      } else {
        res.send("Invalid reset token");
      }
    });
  });
  
  
  module.exports = router