let db = require("../database/db");

let activitySchema = db.Schema({
  dataEverySetInterval: [
    {
      longitude: { type: String, required: true },
      latitude: { type: String, required: true },
      GPS_speed: { type: String, required: true },
      uv: { type: String, required: true }
    }
  ],
  average_speed: { type: String, required: true },
  uv_exposure: { type: String, required: true },
  activityDuration: { type: String, required: true }, // saved in milliseconds
  caloriesBurned: { type: String, required: true },
  temperature: { type: String, required: true },
  humidity: { type: String, required: true },
  activityType: { type: String, required: true },
  deviceId: { type: String, required: true },
  created_at: { type: Date, required: true }, // saved in milliseconds (since Jan 1st 1970)
  email: { type: String, required: true }
});

let activityModel = db.model("activity", activitySchema);

module.exports = activityModel;
