let express = require("express");
let fs = require("fs");
let path = require("path");
let jwt = require("jwt-simple");
let router = express.Router();
let DeviceModel = require("../models/devices");

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  let newApikey = "";
  let alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

router.put("/update", function(req, res, next) {
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
      let API_KEY = getNewApikey();
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
