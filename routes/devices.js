let express = require("express");
let router = express.Router();
let devicesRoutes = require("../controllers/devices");

/************************ Routes for replace and add a new device ********************/
router.put("/replace", devicesRoutes.putDeviceReplace);
router.put("/add", devicesRoutes.putDeviceAdd);

module.exports = router;
