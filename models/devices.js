let db = require("../database/db");

let deviceSchema = db.Schema({
  email: { type: String, require: true },
  deviceId: { type: String, require: true }
});

let deviceModel = db.model("device", deviceSchema);

module.exports = deviceModel;
