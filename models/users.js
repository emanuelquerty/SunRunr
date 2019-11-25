let db = require("../database/db");

let userSchema = db.Schema({
  email: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  UV_threshold: { type: Number, required: false } // Not required, but will be set to 4 initially
});

let userModel = db.model("user", userSchema);

module.exports = userModel;
