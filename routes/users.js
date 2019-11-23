let express = require("express");
let fs = require("fs");
let path = require("path");
let router = express.Router();
let UserModel = require("../models/users");
let DeviceModel = require("../models/devices");
let activityModel = require("../models/activities");
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
    req.body.hasOwnProperty("deviceId")
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
          let newUser = new UserModel({
            email: req.body.email,
            hashedPassword: hash,
            deviceID: [req.body.deviceId]
          });

          newUser.save(function(error, User) {
            // Something happened with the server or database while creating the user
            if (error) {
              return res.json({
                msg: "Error creating account. Please contact support.",
                success: false
              });
            }

            // Now save the device in device collection
            let newDevice = new DeviceModel({
              email: req.body.email,
              deviceID: req.body.deviceId
            });

            newDevice
              .save()
              .then(device => {
                // User created successfully
                res.json({ msg: "User has been saved", success: true });
              })
              .catch(error => {
                console.log("could not save new device!");
              });

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
              let secret = fs
                .readFileSync(
                  path.join(__dirname, "..", "..", "jwtSecretkey.txt")
                )
                .toString();

              let authToken = jwt.encode({ email: req.body.email }, secret);
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

// Get a user information given an authToken
router.get("/read", function(req, res) {
  // Check for authentication token in x-auth header
  if (!req.headers["x-auth"]) {
    return res.redirect("/");
  }

  // Authenticatin token is set
  var authToken = req.headers["x-auth"];

  try {
    let secret = fs
      .readFileSync(path.join(__dirname, "..", "..", "jwtSecretkey.txt"))
      .toString();
    let decodedToken = jwt.decode(authToken, secret);
    let userStatus = {};

    UserModel.findOne({ email: decodedToken.email }, function(err, user) {
      if (err) {
        return res.status(200).json({
          success: false,
          message: "Error trying to find user. Please contact support"
        });
      } else {
        userStatus["success"] = true;
        userStatus["email"] = user.email;

        // Find devices based on decoded token
        DeviceModel.find({ userEmail: decodedToken.email }, function(
          err,
          devices
        ) {
          if (!err) {
            // Construct device list
            let deviceList = [];
            for (device of devices) {
              deviceList.push({
                deviceId: device.deviceId
              });
            }
            userStatus["devices"] = deviceList;
          }

          return res.status(200).json(userStatus);
        });
      }
    });
  } catch (ex) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid authentication token." });
  }
});

/*************** Route for creating an activity */

router.post("/activity/create", function(req, res, next) {
  let data = req.body;
  console.log(data);

  if (
    data.hasOwnProperty("lon") &&
    data.hasOwnProperty("lat") &&
    data.hasOwnProperty("GPS_speed") &&
    data.hasOwnProperty("uv") &&
    data.hasOwnProperty("deviceId")
  ) {
    DeviceModel.findOne({ deviceID: data.deviceId })
      .then(device => {
        let newActivity = new activityModel({
          deviceID: device.deviceId,
          longitude: data.lon,
          latitude: data.lat,
          GPS_speed: data.GPS_speed,
          uv: data.uv
        });

        newActivity
          .save()
          .then(activity => {
            res
              .status(201)
              .json({ success: true, msg: "Activity Successfully saved!" });
          })
          .catch(error => {
            res.status(500).json({
              success: false,
              msg: "Could not save the activity. Please contact support."
            });
          });
      })
      .catch(error => {
        res.status(401).json({
          success: false,
          msg:
            "Something happened while looking for the device. Please contact support."
        });
      });
  } else {
    res.status(400).json({
      success: false,
      msg:
        "Bad format. Check your json object fields for missing or incorrectly named properties."
    });
  }
});

/********************* Route for update a user account information */

router.get("/account/update", function(req, res, next) {
  res.sendFile(path.join(__dirname, "..", "views", "updateAccount.html"));
});

router.post("/account/update", function(req, res, next) {
  // Check for authentication token in x-auth header
  if (!req.headers["x-auth"]) {
    return res.redirect("/");
  }
  // Authenticatin token is set
  var authToken = req.headers["x-auth"];

  // If email property is set, we want to update the user's email with the given email
  if (req.body.hasOwnProperty("email")) {
    let newEmail = req.body.email;

    try {
      let secret = fs
        .readFileSync(path.join(__dirname, "..", "..", "jwtSecretkey.txt"))
        .toString();
      let decodedToken = jwt.decode(authToken, secret);

      UserModel.findOneAndUpdate(
        { email: decodedToken.email },
        { email: newEmail },
        { useFindAndModify: false },
        function(err, user) {
          if (err) {
            return res.status(200).json({
              success: false,
              message: "Error trying to change email. Please contact support"
            });
          } else {
            // Creae new Token with the new updated email
            let secret = fs
              .readFileSync(
                path.join(__dirname, "..", "..", "jwtSecretkey.txt")
              )
              .toString();

            let authToken = jwt.encode({ email: req.body.email }, secret);
            res.status(201).json({ success: true, authToken: authToken });
          }
        }
      );
    } catch (ex) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid authentication token." });
    }
  } else if (req.body.hasOwnProperty("password")) {
    let newPassword = req.body.password;

    try {
      let secret = fs
        .readFileSync(path.join(__dirname, "..", "..", "jwtSecretkey.txt"))
        .toString();
      let decodedToken = jwt.decode(authToken, secret);

      // // Ok to create the user with the given email
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newPassword, salt, function(err, hash) {
          if (err) {
            console.log(
              "ops ... something happended while trying to hash password"
            );
          }

          UserModel.findOneAndUpdate(
            { email: decodedToken.email },
            { hashedPassword: hash },
            { useFindAndModify: false },
            function(err, user) {
              if (err) {
                let msg = {
                  success: false,
                  message: "Error trying to change. Please contact support"
                };

                res.status(201).json(msg);
              } else {
                let msg = {
                  success: true,
                  message: "Password changed successfully"
                };
                res.status(201).json(msg);
              }
            }
          );
        });
      }); // bcrypt.genSalt() method ends here
    } catch (ex) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid authentication token." });
    }
  } else if (req.body.hasOwnProperty("deviceId")) {
    try {
      let secret = fs
        .readFileSync(path.join(__dirname, "..", "..", "jwtSecretkey.txt"))
        .toString();
      let decodedToken = jwt.decode(authToken, secret);
      let deviceId = req.body.deviceId;

      let newDevide = new DeviceModel({
        email: decodedToken.email,
        deviceID: deviceId
      });

      newDevide
        .save()
        .then(device => {
          res
            .status(201)
            .json({ success: true, msg: "New device Added successfully" });
        })
        .catch(error => {
          console.log("Could not save the device");
        });
    } catch (ex) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid authentication token." });
    }

    let deviceId = req.body.deviceId;
    console.log(deviceId);
  }
});

module.exports = router;
