let express = require("express");
let router = express.Router();
let DeviceModel = require("../models/devices");
let activityModel = require("../models/activities");

/*************** Route for creating an activity */
router.post("/create/test", function(req, res) {
  let data = req.body;
  data.created_at = Date.now();

  DeviceModel.findOne({ deviceId: data.deviceId, apiKey: data.apiKey })
    .then(device => {
      if (!device) {
        return res.status(201).json({
          success: false,
          msg: "Device Not Registered or Wrong API KEY"
        });
      }

      let newActivity = new activityModel(data);

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
});

router.post("/create", function(req, res, next) {
  let data = req.body;
  console.log(data);

  if (
    data.hasOwnProperty("lon") &&
    data.hasOwnProperty("lat") &&
    data.hasOwnProperty("GPS_speed") &&
    data.hasOwnProperty("uv") &&
    data.hasOwnProperty("deviceId") &&
    data.hasOwnProperty("apiKey") &&
    data.hasOwnProperty("duration")
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
          uv: data.uv,
          duration: data.duration,
          created_at: Date.now()
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
    res.status(201).json({
      success: false,
      msg:
        "Bad format! Check your json object fields for missing or incorrectly named properties.",
      correctFormat: {
        lon: "longitude",
        lat: "latitude",
        GPS_speed: "GPS speed",
        uv: "ultra violet Index",
        duration: "duration",
        deviceId: "Device ID",
        apiKey: "api key"
      }
    });
  }
});

// let correctFormat = {
//   dataEverySetInterval: [
//     {
//       lon: "longitude",
//       lat: "latitude",
//       GPS_speed: "GPS speed",
//       uv: "ultra violet Index"
//     }
//   ],
//   uv_exposure: "Sum of uv for each 15 second",
//   activityDuration: "Duration of entire activity",
//   apiKey: "api key"
// };

// {
//   "dataEverySetInterval": [
//     {
//       "longitude": "-110.962715",
//       "latitude": "32.284111",
//       "GPS_speed": "5.00",
//       "uv": "3.00"
//     },
//      {
//       "longitude": "-110.962715",
//       "latitude": "32.284111",
//       "GPS_speed": "3.00",
//       "uv": "5.00"
//     },
//     {
//       "longitude": "-110.962715",
//       "latitude": "32.284111",
//       "GPS_speed": "7.00",
//       "uv": "2.00"
//     },
//     {
//       "longitude": "-110.962715",
//       "latitude": "32.284111",
//       "GPS_speed": "2.00",
//       "uv": "4.00"
//     },
//     {
//       "longitude": "-110.962715",
//       "latitude": "32.284111",
//       "GPS_speed": "7.00",
//       "uv": "2.00"
//     }
//   ],
//   "average_speed": "4.8",
//   "uv_exposure": "16.00",
//   "activityDuration": "75000",
//   "caloriesBurned": "19",
//   "temperature": "276.35",
//   "humidity": "27",
//   "activityType": "walking",
//   "deviceId": "560046000e504b464d323520",
//   "apiKey" : "0DfF51dUta4OCc5jPJXKCEYn8CViBaae",
//   "created_at": ""
// }

module.exports = router;
