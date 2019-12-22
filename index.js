// Express and Body-Parser Setup
const express = require("express");
const app = express();
const models = require("./models");
const bodyParser = require("body-parser");

var pbkdf2 = require("pbkdf2");
var crypto = require("crypto");
var salt = crypto.randomBytes(20).toString("hex");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  console.log(req.method, req.path);
  next();
});

function encryptionPassword(req, res, next) {
  var key = pbkdf2.pbkdf2Sync(req.body.password, salt, 36000, 256, "sha256");
  var hash = key.toString("hex");

  req.body.password = `pbkdf2_sha256$36000$${salt}$${hash}`;
  next();
}

// Passport Setup
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

app.get("/success", (req, res) => {
  res.send("Welcome " + req.query.username + " You Have Logged In!");
});
app.get("/error", (req, res) => {
  res.send("Error Logging In");
});

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  models.user.findOne({ where: { id: id } }).then(function(user) {
    cb(null, user);
  });
});

// Passport Local Authentication
const localStrategy = require("passport-local").Strategy;

passport.use(
  new localStrategy(function(username, password, done) {
    models.user
      .findOne({
        where: {
          username: username
        }
      })
      .then(function(user) {
        if (!user) {
          return done(null, false);
        }
        if (user.password != password) {
          return done(null, user);
        }
        return done(null, user);
      })
      .catch(function(err) {
        return done(err);
      });
  })
);

app.post(
  "/",
  passport.authenticate("local", { failureRedirect: "/error" }),
  function(req, res) {
    res.redirect("/success?username=" + req.user.username);
  }
);

app.post("/register", encryptionPassword, function(req, res) {
  models.user
    .create({ username: req.body.username, password: req.body.password })
    .then(function(user) {
      res.send(user);
    });
});

app.post("/login", encryptionPassword, function(req, res) {
  models.user
    .findOne({
      where: { username: req.body.username, password: req.body.password }
    })
    .then(function(user) {
      console.log("There was an User");
      console.log(user);
      res.send(user);
    });
});

// Passport Facebook Auth
const FacebookStrategy = require("passport-facebook").Strategy;

const FACEBOOK_APP_ID = "Your App ID";
const FACEBOOK_APP_SECRET = "Your App Secret";

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/error" }),
  function(req, res) {
    res.redirect("/success");
  }
);

// Passport Github Auth
const GithubStrategy = require("passport-github").Strategy;

const GITHUB_CLIENT_ID = "Your App ID";
const GITHUB_CLIENT_SECRET = "Your App Secret";

passport.use(
  new FacebookStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/error" }),
  function(req, res) {
    res.redirect("/success");
  }
);

// Dynamic Port Setting
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("App Listening on Port " + port));
