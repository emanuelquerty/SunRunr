let db = require("../database/db");

let userSchema = db.Schema({
  email: { type: String, require: true },
  hashedPassword: { type: String, require: true },
  deviceID: [{ type: String, require: true }]
});

let userModel = db.model("user", userSchema);

module.exports = userModel;
