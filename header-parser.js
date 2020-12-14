/*

User Story:
1. I can get the IP address, preferred languages (from header Accept-Language)
and system infos (from header User-Agent) for my device.

*/
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// whoami
app.get("/api/whoami", function (req, res) {
  console.log(req.headers)
  let language = req.headers['accept-language']
  let ipaddress = req.headers['x-forwarded-for']
  let userAgent = req.headers['user-agent']
  res.json({
    ipaddress: ipaddress,
    language: language,
    software: userAgent
  })
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});