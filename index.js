const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser');

const app = express()

// Secure Headers
app.use(helmet())

// Enable JSON Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS Support
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(__dirname + '/public'));

app.use("/", require(__dirname + '/routes/index.js'));
app.use("/token", require(__dirname + '/routes/token.js'));

module.exports = app
