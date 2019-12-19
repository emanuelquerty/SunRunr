let express = require("express");
let router = express.Router();
let userRoutes = require("../controllers/users");

/********************** Register endpoints start here ********************************/
router.get("/register", userRoutes.getUserRegister);
router.post("/register", userRoutes.postUserRegister);

/********************** Login endpoints start here ********************************/
router.get("/login", userRoutes.getUserLogin);
router.post("/login", userRoutes.postUserLogin);

// Get a user information given an authToken
router.get("/read", userRoutes.getUserRead);

/********************* Routes for update a user account information */
router.get("/update", userRoutes.getUserUpdate);
router.put("/update", userRoutes.postUserUpdate);

/********************* Routes for weather forecast */
router.get("/weather-forecast", userRoutes.getWeatherForecast);
router.get("/read/weather-forecast", userRoutes.getWeatherForecastData);
router.get("/read/uv-forecast", userRoutes.getUvForecastData);
router.get("/read/uv-tomorrow", userRoutes.getTomorrowUvData);

/********************* Routes for activities summary */
router.get("/activities-summary", userRoutes.getActivitiesSummary);

/********************* Routes for activity detail */
router.get("/activity-detail/:created_at", userRoutes.getActivityDetail);

/********************* Routes for activities summary */
router.get("/weekly-summary", userRoutes.getWeeklySummary);

/********************* Routes for getting UV Threshold from the device */
router.get("/uv_threshold", userRoutes.getUvThreshold);

module.exports = router;
