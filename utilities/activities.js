let fetch = require("node-fetch");
let activityModel = require("../models/activities");
let deviceModel = require("../models/devices");

exports.constructAndSaveActivityModel = function(data, res) {
  let average_speed = 0;
  let dataEverySetInterval = data.dataEverySetInterval;

  // Find the average speed in miles per hour (initially given in knots)
  for (let i = 0; i < dataEverySetInterval.length; i++) {
    average_speed += parseInt(dataEverySetInterval[i].GPS_speed);
  }
  average_speed = (average_speed / dataEverySetInterval.length) * 1.15078;

  // Find distance travelled from average speed and duration (activity duration is given in milliseconds)
  let activityDurationInHours = data.activityDuration / 1000 / 3600;
  let distance_travelled = average_speed * activityDurationInHours;

  // Assume activity type from average speed (in miles per hour)
  let activityType = "";
  if (average_speed <= 4) {
    activityType = "Walking";
  } else if (average_speed > 4 && average_speed <= 8.3) {
    activityType = "Running";
  } else {
    activityType = "Biking";
  }

  // Find calories burned from distance travelled (assuming activity type from average speed)
  let caloriesBurned = 0;
  if (activityType === "Walking") {
    caloriesBurned = distance_travelled * 70;
  } else if (activityType === "Running") {
    caloriesBurned = distance_travelled * 100;
  } else {
    caloriesBurned = distance_travelled * 49;
  }

  // Finally fecth humidity and temperature
  let lat = dataEverySetInterval[0].lat;
  let lon = dataEverySetInterval[0].lon;

  // Fetch the 5 days ahead weather forecast
  let currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=045d7a604186991f3a06dfec6589cee1`;
  fetch(currentWeatherUrl)
    .then(response => response.json())
    .then(response => {
      //   console.log(response);
      let temperature = response.main.temp;
      let humidity = response.main.humidity;

      // Finally, find the email of the user associated with this device
      deviceModel.findOne({ deviceId: data.deviceId }, function(error, device) {
        if (error) {
          console.log(error);
        } else {
          let ActivityModelObject = {
            dataEverySetInterval,
            average_speed,
            uv_exposure: data.uv_exposure,
            activityDuration: data.activityDuration, // in milliseconds
            caloriesBurned,
            temperature,
            humidity,
            activityType,
            deviceId: data.deviceId,
            created_at: new Date().setDate(new Date().getDate() - 3), // in milliseconds
            email: device.email
          };

          // Save the new activity
          let newActivity = new activityModel(ActivityModelObject);

          newActivity
            .save()
            .then(activity => {
              res
                .status(201)
                .json({ success: true, msg: "Activity Successfully Saved!" });
            })
            .catch(error => {
              console.log(error);
              res.status(500).json({
                success: false,
                msg: "Could not save the activity. Please contact support."
              });
            }); // Save acivity method chain ends here
        }
      });
    })
    .catch(error => {
      console.log(error);
    });
};
