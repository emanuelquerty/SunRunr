let ActivityModel = require("../models/activities");
let DeviceModel = require("../models/devices");
let activityUtilities = require("../utilities/activities");
let path = require("path");
let fs = require("fs");
let jwt = require("jwt-simple");

/*************** Route for creating an activity */

exports.postActivityCreate = function(req, res, next) {
  let data = req.body;

  if (
    data.hasOwnProperty("dataEverySetInterval") &&
    data.hasOwnProperty("uv_exposure") &&
    data.hasOwnProperty("activityDuration") &&
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

        /** TODO: do the work to construct the activity model */
        activityUtilities.constructAndSaveActivityModel(data, res);
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
        dataEverySetInterval: [
          {
            lon: "longitude",
            lat: "latitude",
            GPS_speed: "GPS speed",
            uv: "ultra violet Index"
          }
        ],
        uv_exposure: "Sum of uv for each 15 second",
        activityDuration: "Duration of entire activity",
        deviceId: "device id",
        apiKey: "api key"
      }
    });
  }
};

exports.getActivitiesRead = function(req, res) {
  // Check for authentication token in x-auth header
  if (!req.headers["x-auth"]) {
    return res.redirect("/");
  }
  // Authenticatin token is set
  var authToken = req.headers["x-auth"];
  //   console.log(authToken);

  try {
    let secret = fs
      .readFileSync(path.join(__dirname, "..", "..", "jwtSecretkey.txt"))
      .toString();
    let decodedToken = jwt.decode(authToken, secret);

    // Get all activities for this user
    ActivityModel.find({ email: decodedToken.email }, function(
      error,
      activities
    ) {
      if (error) {
        console.log(error);
      } else {
        res.status(201).json({ success: true, message: activities });
      }
    });
  } catch (ex) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid authentication token." });
  }
};
