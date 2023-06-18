//Importing the modules from the library of express
const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

dotenv.config({ path: "./.env" });
const app = express();









// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});




const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});



const publicDirectory = path.join(__dirname, "./public");
console.log(__dirname);





app.use(express.static(publicDirectory));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));






connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL database:", error);
    throw error;
  }
  console.log("Connected to MySQL database!");
});


app.get("/", (req, res) => {
  res.render("login.ejs");
});



app.get("/register", (req, res) => {
  res.render("register.ejs");
});



app.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword.ejs");
});



app.post("/forgotpassword", (req, res) => {
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
          text: `You have requested to reset your password. Please click on the following link to reset your password: http://localhost:1000/resetpassword/${resetToken}`,
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

app.get("/resetpassword/:token", (req, res) => {
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

app.post("/resetpassword/:token", (req, res) => {
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

        res.send("Password reset successful");
      });
    } else {
      res.send("Invalid reset token");
    }
  });
});

//Adding the details in the database in authenticate table using bcrypt to secure the password
app.get("/adddetails", (req, res) => {
    const name = req.query.name;
    const email = req.query.email;
    const password = req.query.password;
  
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
        res.send("Data saved successfully");
      
      });
    });
  });
  
  app.post("/showdetails", (req, res) => {
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
          res.redirect("/welcome");
        } else {
          res.send({
            "code": 204,
            "success": "Email and password do not match"
  
          });
        }
      } else {
        res.send({
          "code": 206,
          "success": "Email does not exist"
        });
      }
    });
  
  });
  
  app.get("/welcome", (req, res) => {
    const username = req.session.username;
  
    if (username) {
      res.render("welcome.ejs", { username });
    } else {
      res.redirect("/"); // Redirect to the login page if the username is not found in the session
    }
  });
  
app.listen(1000, () => {
  console.log("Server is running on port 1000");
});



































































