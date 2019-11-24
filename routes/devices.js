let express = require("express");
let fs = require("fs");
let path = require("path");
let jwt = require("jwt-simple");
let router = express.Router();
let DeviceModel = require("../models/devices");

router.post("/update", function(req, res, next) {
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

      let newDevice = new DeviceModel({
        email: decodedToken.email,
        deviceId: deviceId
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
  } else if (
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
});

module.exports = router;
