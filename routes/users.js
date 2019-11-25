let express = require("express");
let fs = require("fs");
let path = require("path");
let router = express.Router();
let UserModel = require("../models/users");
let DeviceModel = require("../models/devices");
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
let userRoutes = require("../controllers/users");

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  let newApikey = "";
  let alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

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

module.exports = router;
