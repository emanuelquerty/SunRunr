let db = require("../database/db");

let activitySchema = db.Schema({
  deviceID: { type: String, require: true },
  longitude: { type: String, require: true },
  latitude: { type: String, require: true },
  GPS_speed: { type: String, require: true },
  uv: { type: String, require: true }
});

let activityModel = db.model("ativity", activitySchema);

module.exports = activityModel;
