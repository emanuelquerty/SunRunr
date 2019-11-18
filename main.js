let path = require("path");
let express = require("express");
let app = express();
let bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let usersRoute = require("./routes/users");

app.use(express.static(path.join(__dirname, "public")));

app.use("/home", function(req, res) {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});
app.use("/users", usersRoute);

app.listen(3000);
