let mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/sunrunr", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

module.exports = mongoose;
