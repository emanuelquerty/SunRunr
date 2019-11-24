let db = require("../database/db");

let deviceSchema = db.Schema({
  email: { type: String, required: true },
  deviceId: { type: String, required: true },
  apiKey: { type: String, required: true }
});

let deviceModel = db.model("device", deviceSchema);

module.exports = deviceModel;
