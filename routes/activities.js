let express = require("express");
let router = express.Router();
let activityRoutes = require("../controllers/activities");

/*************** Route for creating an activity */
router.post("/create", activityRoutes.postActivityCreate);

/*************** Route for geting all activities of a user an activity */
router.get("/read", activityRoutes.getActivitiesRead);

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
