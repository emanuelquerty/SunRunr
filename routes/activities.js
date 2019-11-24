let express = require("express");
let router = express.Router();
let DeviceModel = require("../models/devices");
let activityModel = require("../models/activities");

/*************** Route for creating an activity */

router.post("/create", function(req, res, next) {
  let data = req.body;
  console.log(data);

  if (
    data.hasOwnProperty("lon") &&
    data.hasOwnProperty("lat") &&
    data.hasOwnProperty("GPS_speed") &&
    data.hasOwnProperty("uv") &&
    data.hasOwnProperty("deviceId") &&
    data.hasOwnProperty("apiKey")
  ) {
    DeviceModel.findOne({ deviceId: data.deviceId, apiKey: data.apiKey })
      .then(device => {
        if (!device) {
          return res.status(201).json({
            success: false,
            msg: "Device Not Registered or Wrong API KEY"
          });
        }

        let newActivity = new activityModel({
          deviceId: device.deviceId,
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
              .json({ success: true, msg: "Activity Successfully Saved!" });
          })
          .catch(error => {
            res.status(500).json({
              success: false,
              msg: "Could not save the activity. Please contact support."
            });
          });
      })
      .catch(error => {
        console.log(error);
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
        "Bad format. Check your json object fields for missing or incorrectly named properties.",
      correctFormat: {
        lon: "longitude",
        lat: "latitude",
        GPS_speed: "GPS speed",
        uv: "ultra violet Index",
        deviceId: "Device ID",
        apiKey: "api key"
      }
    });
  }
});

module.exports = router;
