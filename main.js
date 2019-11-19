let path = require("path");
let express = require("express");
let app = express();
let bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let usersRouter = require("./routes/users");
let devicesRouter = require("./routes/devices");

app.use(express.static(path.join(__dirname, "public")));

app.use("/home", function(req, res) {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.use("/users", usersRouter);
app.use("/devices", devicesRouter);

app.use("/", function(req, res) {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.listen(3000);
