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

/********************* Route for update a user account information */
router.get("/update", userRoutes.getUserUpdate);
router.put("/update", userRoutes.postUserUpdate);

/********************* Route for weather forecast */
router.get("/weather-forecast", userRoutes.getWeatherForecast);
router.get(
  "/get-most-recent-activity-location",
  userRoutes.getMostRecentActivityLocation
);

module.exports = router;
