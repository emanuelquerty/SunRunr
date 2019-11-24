let db = require("../database/db");

let userSchema = db.Schema({
  email: { type: String, required: true },
  hashedPassword: { type: String, required: true }
});

let userModel = db.model("user", userSchema);

module.exports = userModel;
