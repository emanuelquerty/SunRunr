let express = require("express");
let router = express.Router();
let activityRoutes = require("../controllers/activities");

/*************** Route for creating an activity */
router.post("/create", activityRoutes.postActivityCreate);

/*************** Route for geting all activities of a user an activity */
router.get("/read", activityRoutes.getActivitiesRead);
router.get("/read/:created_at", activityRoutes.getActivityRead);

router.post("/change_activity_type", activityRoutes.changeActivityType);

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

module.exports = router;
