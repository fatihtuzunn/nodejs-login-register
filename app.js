const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const User = require("./models/User");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;

mongoose.connect("mongodb://localhost/auth-demo");

function initializePassport(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

initializePassport(
  passport,
  email => User.findOne({email:email}),
  id => users.find(user => user.id === id)
)






app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "knights who say ni",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.session());
/* // use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
 */

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

app.post("/register", function (req, res) {
  async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const Users = new User({ 
        email: req.body.email, 
        name: req.body.name,
        password: hashedPassword
      })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  }
  

});

app.post("/login", function (req, res) {
  if (!req.body.username) {
    res.json({ success: false, message: "Username was not given" });
  } else {
    if (!req.body.password) {
      res.json({ success: false, message: "Password was not given" });
    } else {
      passport.authenticate("local", function (err, user, info) {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          if (!user) {
            res.json({
              success: false,
              message: "username or password incorrect",
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.json({ success: false, message: err });
              } else {
                const token = jwt.sign(
                  { userId: user._id, username: user.username },
                  secretkey,
                  { expiresIn: "24h" }
                );
                res.json({
                  success: true,
                  message: "Authentication successful",
                  token: token,
                });
              }
            });
          }
        }
      })(req, res);
    }
  }
});





const port = 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));