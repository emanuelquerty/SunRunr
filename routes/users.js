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

/********************* Routes for activities summary */
router.get("/activities-summary", userRoutes.getActivitiesSummary);

/********************* Routes for activities summary */
router.get("/weekly-summary", userRoutes.getWeeklySummary);

module.exports = router;
