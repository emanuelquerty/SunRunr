let express = require("express");
let router = express.Router();
let Device = require("../models/devices");

router.post("/register", function(req, res) {
  if (req.body.hasOwnProperty("email") && req.body.hasOwnProperty("deviceID")) {
    let email = req.body.email;
    let deviceID = req.body.deviceID;

    console.log(email);
    console.log(deviceID);

    Device.findOne({ email: email, deviceID: deviceID })
      .then(device => {
        if (device) {
          console.log(device);
          return res.status(201).json({
            success: false,
            msg: "The device already exists. Try a different device"
          });
        }

        // OK to add the device
        let newDevice = new Device({
          email: email,
          deviceID: deviceID
        });

        newDevice.save(function(error, device) {
          if (error) {
            return res
              .status(400)
              .json("Error adding the device. Please contact support...");
          }

          // Device saved
          res.status(201).json({
            success: true,
            msg: `The device ${device.deviceID} was added successfully`
          });
        });
      })
      .catch(error => {
        res
          .status(400)
          .json("Error adding the device. Please contact support!");
      });
  }
});

module.exports = router;
