const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const User = require("./models/User");
const passport = require("passport");
const session = require("express-session");
var jwt = require('jsonwebtoken');
const LocalStrategy = require("passport-local").Strategy;

mongoose.connect("mongodb://localhost/auth-demo");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "knights who say ni",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy({
    usernameField: 'email', // map username to custom field, we call it email in our form
    passwordField: 'password',
    passReqToCallback: true // lets you access other params in req.body
  },
   (req, email, password, done) => {
    // Return false if user already exists - failureRedirect
    
  }
))
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



const port = 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

//=======================
//      R O U T E S
//=======================
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/userprofile", (req, res) => {
  res.render("userprofile");
});
//Auth Routes
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

// POST Routes

app.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.create(req.body);
    res.json({
      success: true,
      message: "Your account has been saved",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Your account could not be saved. Error: ",
      error,
    });
  }
});

app.post("/login", passport.authenticate('local', {
    failureRedirect: '/login?error=error',
    successRedirect: '/secret',
  }),
  (req, res) => {
    console.log(req.user);
  }
);