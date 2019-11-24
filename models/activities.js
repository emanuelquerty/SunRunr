let db = require("../database/db");

let activitySchema = db.Schema({
  deviceId: { type: String, required: true },
  longitude: { type: String, required: true },
  latitude: { type: String, required: true },
  GPS_speed: { type: String, required: true },
  uv: { type: String, required: true }
});

let activityModel = db.model("activity", activitySchema);

module.exports = activityModel;
