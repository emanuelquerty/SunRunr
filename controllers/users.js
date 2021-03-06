let fs = require("fs");
let path = require("path");
let UserModel = require("../models/users");
let DeviceModel = require("../models/devices");
let ActivityModel = require("../models/activities");
let utilities = require("../utilities/users");
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
let fetch = require("node-fetch");

// Send the register.html middleware
exports.getUserRegister = function (req, res, next) {
  res.sendFile(path.join(__dirname, "..", "views", "register.html"));
};

// Register a user middleware
exports.postUserRegister = function (req, res, next) {
  if (
    req.body.hasOwnProperty("email") &&
    req.body.hasOwnProperty("password") &&
    req.body.hasOwnProperty("deviceId")
  ) {
    // Check if there is already an account using the given email
    UserModel.findOne({ email: req.body.email }, function (error, user) {
      if (user) {
        return res.json({
          msg: "The email is aready associated with an account",
          success: false,
        });
      }

      // // Ok to create the user with the given email
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
          if (err) {
            console.log(
              "ops ... something happended while trying to hash password"
            );
          }

          // Store hashed password in database.
          let newUser = new UserModel({
            email: req.body.email,
            hashedPassword: hash,
            UV_threshold: 12, // When user registers, user is not asked for UV, so we just set it initially to 12
          });

          newUser.save(function (error, User) {
            // Something happened with the server or database while creating the user
            if (error) {
              return res.json({
                msg: "Error creating account. Please contact support.",
                success: false,
              });
            }

            // Now save the device in device collection
            let API_KEY = utilities.getNewApikey();
            let newDevice = new DeviceModel({
              email: req.body.email,
              deviceId: req.body.deviceId,
              apiKey: API_KEY,
            });

            newDevice
              .save()
              .then((device) => {
                // User created successfully
                res.json({
                  msg: `Account Created Successfully.`,
                  success: true,
                  apiKey: API_KEY,
                });
              })
              .catch((error) => {
                console.log(error);
                console.log("could not save new device!");
              });
          });
        });
      }); // bcrypt.genSalt() method ends here
    });
  }
};

// Send the user login page
exports.getUserLogin = function (req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "login.html"));
};

exports.postUserLogin = function (req, res) {
  if (req.body.hasOwnProperty("email") && req.body.hasOwnProperty("password")) {
    var email = req.body.email;
    var password = req.body.password;

    UserModel.findOne({ email: email }, function (err, user) {
      if (err) {
        res.status(401).json({
          success: false,
          msg: "Error Authenticating. Please contact support.",
        });
      } else {
        // Could not find a user with the givene email
        if (!user) {
          return res.status(201).json({
            success: false,
            msg: "Email does not exist.",
          });
        }

        // Compare the two passwords
        // Load hash from your password DB.
        let hashedPassword = user.hashedPassword;
        bcrypt.compare(password, hashedPassword, function (err, valid) {
          if (err) {
            res.status(401).json({
              success: false,
              message: "Error authenticating. Please contact support.",
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
                msg: "email or password is incorrect",
              });
            }
          }
        });
      }
    });
  }
};

// Get user information given a valid token
exports.getUserRead = function (req, res) {
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

    UserModel.findOne({ email: decodedToken.email }, function (err, user) {
      if (err) {
        return res.status(200).json({
          success: false,
          message: "Error trying to find user. Please contact support",
        });
      } else {
        userStatus["success"] = true;
        userStatus["email"] = user.email;
        userStatus["uv_threshold"] = user.UV_threshold;

        // Find devices based on decoded token
        DeviceModel.find({ email: decodedToken.email }, function (
          err,
          devices
        ) {
          if (!err) {
            // Construct device list
            let deviceList = [];
            let apiKeyList = [];
            for (device of devices) {
              deviceList.push(device.deviceId);
              apiKeyList.push(device.apiKey);
            }

            userStatus["devices"] = deviceList;
            userStatus["apiKeys"] = apiKeyList;
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
};

// Send the update.html file middleware
exports.getUserUpdate = function (req, res, next) {
  res.sendFile(path.join(__dirname, "..", "views", "updateAccount.html"));
};

exports.postUserUpdate = function (req, res, next) {
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
        function (err, user) {
          if (err) {
            return res.status(200).json({
              success: false,
              message: "Error trying to change email. Please contact support",
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
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newPassword, salt, function (err, hash) {
          if (err) {
            console.log(
              "ops ... something happended while trying to hash password"
            );
          }

          UserModel.findOneAndUpdate(
            { email: decodedToken.email },
            { hashedPassword: hash },
            { useFindAndModify: false },
            function (err, user) {
              if (err) {
                let msg = {
                  success: false,
                  message:
                    "Error trying to change password. Please contact support",
                };

                res.status(201).json(msg);
              } else {
                let msg = {
                  success: true,
                  message: "Password changed successfully",
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
  } else if (req.body.hasOwnProperty("uv")) {
    let uv = req.body.uv;

    try {
      let secret = fs
        .readFileSync(path.join(__dirname, "..", "..", "jwtSecretkey.txt"))
        .toString();
      let decodedToken = jwt.decode(authToken, secret);

      UserModel.findOneAndUpdate(
        { email: decodedToken.email },
        { UV_threshold: uv },
        { useFindAndModify: false },
        function (err, user) {
          if (err) {
            let msg = {
              success: false,
              message:
                "Error trying to change uv threshold. Please contact support",
            };

            res.status(201).json(msg);
          } else {
            let msg = {
              success: true,
              message: "uv threshold changed successfully",
            };
            res.status(201).json(msg);
          }
        }
      );
    } catch (ex) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid authentication token." });
    }
  }
};

// Load weather-forecast.html
exports.getWeatherForecast = function (req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "weather-forecast.html"));
};

// Get 5 days ahead weather forecast from Open Weather Map API
exports.getWeatherForecastData = function (req, res) {
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

    // Get the most recent activity
    ActivityModel.find()
      .sort({ created_at: "desc" })
      .exec()
      .then((activities) => {
        let lat = 32.2319;
        let lon = 110.9501;
        if (activities.length > 0) {
          let mostRecentActivity = activities[0];
          lat = mostRecentActivity.dataEverySetInterval[0].latitude;
          lon = mostRecentActivity.dataEverySetInterval[0].longitude;
        }

        // Fetch the 5 days ahead weather forecast
        let weatherForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=045d7a604186991f3a06dfec6589cee1`;
        fetch(weatherForecastUrl)
          .then((response) => response.json())
          .then((response) => {
            // Check response
            console.log(response);

            let weatherForecastDays = utilities.getForecastDays(
              response,
              "weather"
            );
            res
              .status(201)
              .json({ success: true, forecastDays: weatherForecastDays });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (ex) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid authentication token." });
  }
};

exports.getUvForecastData = function (req, res) {
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

    // Get the most recent activity
    ActivityModel.find()
      .sort({ created_at: "desc" })
      .exec()
      .then((activities) => {
        let lat = 32.2319;
        let lon = 110.9501;
        if (activities.length > 0) {
          let mostRecentActivity = activities[0];
          lat = mostRecentActivity.dataEverySetInterval[0].latitude;
          lon = mostRecentActivity.dataEverySetInterval[0].longitude;
        }

        // Fetch the 5 days ahead uv forecast
        let uvForecastUrl = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&appid=045d7a604186991f3a06dfec6589cee1&cnt=4`;
        fetch(uvForecastUrl)
          .then((response) => {
            console.log(response);
            return response.json();
          })
          .then((response) => {
            console.log("____________________");
            console.log(response);

            let uvForecastDays = utilities.getForecastDays(response, "uv");
            res.status(201).json(uvForecastDays);
          })
          .catch((error) => {
            console.log(error);
          });
      });
  } catch (ex) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid authentication token." });
  }
};

// Sometimes at some point in the day, uv forecast won't fetch tomorrow forecast, so we fetch tomorrow forecast separetly
exports.getTomorrowUvData = function (req, res) {
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

    // Get the most recent activity
    ActivityModel.find()
      .sort({ created_at: "desc" })
      .exec()
      .then((activities) => {
        let lat = 32.2319;
        let lon = 110.9501;
        if (activities.length > 0) {
          let mostRecentActivity = activities[0];
          lat = mostRecentActivity.dataEverySetInterval[0].latitude;
          lon = mostRecentActivity.dataEverySetInterval[0].longitude;
        }

        // Fetch the 5 days ahead uv forecast
        let uvForecastUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=045d7a604186991f3a06dfec6589cee1&cnt=4`;
        fetch(uvForecastUrl)
          .then((response) => response.json())
          .then((response) => {
            let uvForecastDay = utilities.getForecastDays([response], "uv");
            res.status(201).json({ success: true, message: uvForecastDay });
          })
          .catch((error) => {
            console.log(error);
          });
      });
  } catch (ex) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid authentication token." });
  }
};

// Load activities-summary.html
exports.getActivitiesSummary = function (req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "activities-summary.html"));
};

// Load activity-detail.html
exports.getActivityDetail = function (req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "activity-detail.html"));
};

// Load weekly-summary.html
exports.getWeeklySummary = function (req, res) {
  res.sendFile(path.join(__dirname, "..", "views", "weekly-summary.html"));
};

// Get UV Threshold
exports.getUvThreshold = function (req, res) {
  if (
    req.body.hasOwnProperty("apiKey") &&
    req.body.hasOwnProperty("deviceId")
  ) {
    DeviceModel.findOne({ deviceId: req.body.deviceId }, function (
      error,
      device
    ) {
      if (error) {
        console.log(error);
      } else {
        let email = device.email;

        UserModel.findOne({ email: email }, function (error, user) {
          if (error) {
            console.log(error);
          } else {
            res
              .status(201)
              .json({ success: true, uv_threshold: user.UV_threshold });
          }
        });
      }
    });
  } else {
    res.status(401).json({
      success: false,
      msg: "invalid object format",
      correctFormat: { apiKey: "API KEY VALUE", deviceId: "DEVICE ID VALUE" },
    });
  }
};
