let fs = require("fs");
let path = require("path");
let jwt = require("jwt-simple");
let DeviceModel = require("../models/devices");
let userUtilities = require("../utilities/users");

// Middleware for replacing a device with a new one
exports.putDeviceReplace = function(req, res, next) {
  // Check for authentication token in x-auth header
  if (!req.headers["x-auth"]) {
    return res.redirect("/");
  }
  // Authenticatin token is set
  var authToken = req.headers["x-auth"];

  if (
    req.body.hasOwnProperty("newDeviceId") &&
    req.body.hasOwnProperty("oldDeviceId")
  ) {
    let newDeviceId = req.body.newDeviceId;
    let oldDeviceId = req.body.oldDeviceId;

    let secret = fs
      .readFileSync(path.join(__dirname, "..", "..", "jwtSecretkey.txt"))
      .toString();
    let decodedToken = jwt.decode(authToken, secret);

    DeviceModel.findOneAndUpdate(
      { email: decodedToken.email, deviceId: oldDeviceId },
      { deviceId: newDeviceId },
      { useFindAndModify: false }
    )
      .then(device => {
        res.status(201).json({
          success: true,
          msg: `Device ${oldDeviceId} replaced with device ${newDeviceId}`
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
};

// Middleware for adding a device
exports.putDeviceAdd = function(req, res, next) {
  // Check for authentication token in x-auth header
  if (!req.headers["x-auth"]) {
    return res.redirect("/");
  }
  // Authenticatin token is set
  var authToken = req.headers["x-auth"];

  if (
    req.body.hasOwnProperty("newDeviceId") &&
    !req.body.hasOwnProperty("oldDeviceId")
  ) {
    try {
      let secret = fs
        .readFileSync(path.join(__dirname, "..", "..", "jwtSecretkey.txt"))
        .toString();
      let decodedToken = jwt.decode(authToken, secret);
      let deviceId = req.body.newDeviceId;

      // Get api key and save the new device
      let API_KEY = userUtilities.getNewApikey();
      let newDevice = new DeviceModel({
        email: decodedToken.email,
        deviceId: deviceId,
        apiKey: API_KEY
      });

      newDevice
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
  } else {
    console.log("Invalid data format or missing one or more properties!");
  }
};
