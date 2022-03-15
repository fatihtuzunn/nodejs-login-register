const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const User = require("./models/User");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt= require("bcrypt")
const flash = require("express-flash");

mongoose.connect("mongodb://localhost/auth-demo");
/* 
function initializePassport(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email);
    if (user == null) {
      return done(null, false, { message: "No user with that email" });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

initializePassport(
  passport,

  (email) => {
    const user = User.findOne({ email: email });
    user.email === email;
  },
  (id) => {
    const user = User.findOne({ id: id });
    user.id === id;
  }
); */
app.use(flash());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
passport.use(new LocalStrategy({ usernameField: "email" },
  function(email, password, done) {
    User.findOne({ email: email }, 
      async function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (await bcrypt.compare(password, user.password)) { return done(null, false); }
      return done(null, user);
    });
  }
));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//=======================
//      R O U T E S
//=======================
app.get("/", checkAuthenticated, (req, res) => {
  res.render("home");
});
app.get("/userprofile", checkNotAuthenticated, (req, res) => {
  res.render("userprofile");
});
//Auth Routes
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register");
});

// POST Routes

app.post("/register",  async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); 
     const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch(error) {
    console.log(error);
    res.redirect("/register");
  }
});




app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

const port = 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
