const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieModel = require("./models/cookie");
const cookieData = require("./data/cookies");
const bodyParser = require("body-parser");

const app = express();
require("dotenv").config();

// Bodyparser middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));

// DB config
const db = process.env.MONGODB_URL || "mongodb://localhost/webevaluator";

// connect to mongo
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Mongoose connected with db", db))
  .then(() => cookieModel.countDocuments())
  .then(count => {
    if (!count) {
      return cookieModel.insertMany(cookieData);
    }
  })
  .catch((err) => console.log(err));

var morgan = require('morgan')
var rfs = require('rotating-file-stream') // version 2.x
// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, './logs')
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

// app.get('/', function (req, res) {
//   res.send('hello, world!')
// })
// use routes
app.use("/api/status", require("./routes/status"));
app.use("/api/errors", require("./routes/errors"));
app.use("/api/cchecker", require("./routes/cookie"));
app.use("/api/screenshot", require("./routes/screenshot"));
app.use("/api/sniffer", require("./routes/sniffer"));
app.use("/api/pdf", require("./routes/pdf"));
// serve static assets if we are in production
if (process.env.NODE_ENV === "production") {
  // set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
} else {
  app.use(express.static("public"));
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server started on port ${port} on ${process.env.NODE_ENV} environment`));
