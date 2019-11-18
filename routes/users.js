let express = require("express");
let fs = require("fs");
let path = require("path");
let router = express.Router();
let UserModel = require("../models/users");
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");

/********************** Register endpoints start here ********************************/
router.get("/register", function(req, res, next) {
  res.sendFile(path.join(__dirname, "..", "views", "register.html"));
});

router.post("/register", function(req, res, next) {
  if (
    req.body.hasOwnProperty("email") &&
    req.body.hasOwnProperty("password") &&
    req.body.hasOwnProperty("deviceID")
  ) {
    // Check if there is already an account using the given email
    UserModel.findOne({ email: req.body.email }, function(error, user) {
      if (user) {
        return res.json({
          msg: "The email is aready associated with an account",
          success: false
        });
      }

      // // Ok to create the user with the given email
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          if (err) {
            console.log(
              "ops ... something happended while trying to hash password"
            );
          }

          // Store hashed password in database.
          let User = new UserModel({
            email: req.body.email,
            hashedPassword: hash,
            deviceID: [req.body.deviceID]
          });

          User.save(function(error, User) {
            // Something happened with the server or database while creating the user
            if (error) {
              return res.json({
                msg: "Error creating account. Please contact support.",
                success: false
              });
            }

            // User created successfully
            res.json({ msg: "User has been saved", success: true });
          });
        });
      }); // bcrypt.genSalt() method ends here
    });
  }
});

/********************** Login endpoints start here ********************************/
router.get("/login", function(req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "login.html"));
});

router.post("/login", function(req, res) {
  if (req.body.hasOwnProperty("email") && req.body.hasOwnProperty("password")) {
    var email = req.body.email;
    var password = req.body.password;

    UserModel.findOne({ email: email }, function(err, user) {
      if (err) {
        res.status(401).json({
          success: false,
          msg: "Error Authenticating. Please contact support."
        });
      } else {
        // Could not find a user with the givene email
        if (!user) {
          return res.status(201).json({
            success: false,
            msg: "Email does not exist."
          });
        }

        // Compare the two passwords
        // Load hash from your password DB.
        let hashedPassword = user.hashedPassword;
        bcrypt.compare(password, hashedPassword, function(err, valid) {
          if (err) {
            res.status(401).json({
              success: false,
              message: "Error authenticating. Please contact support."
            });
          } else {
            if (valid === true) {
              var secret = fs
                .readFileSync(__dirname + "/../../jwtSecretkey.txt")
                .toString();

              var authToken = jwt.encode({ email: req.body.email }, secret);
              res.status(201).json({ success: true, authToken: authToken });
            } else {
              res.status(201).json({
                success: false,
                msg: "email or password is incorrect"
              });
            }
          }
        });
      }
    });
  }
});

module.exports = router;