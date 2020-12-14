/*
I can POST a URL to [project_url]/api/shorturl/new and I will receive a shortened URL in the JSON response.
Example : {"original_url":"www.google.com","short_url":1}
If I pass an invalid URL that doesn't follow the http(s)://www.example.com(/more/routes) format, the JSON response will contain an error like {"error":"invalid URL"}
HINT: to be sure that the submitted url points to a valid site you can use the function dns.lookup(host, cb) from the dns core module.
When I visit the shortened URL, it will redirect me to my original link.
*/


'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');
var path = require('path');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
const MONGO_URI = '*****'

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// create schema
const linkSchema = new mongoose.Schema({
  numUrl: Number,
  fullUrl: String
});

// create Model
const Link = mongoose.model("Link", linkSchema);

app.post("/api/shorturl/new", (req, res) => {
  // check url is legit 
  let url = req.body.url.replace(/(^\w+:|^)\/\//, '');
  dns.lookup(url, (err, add, fam) => {
    if (err) {return res.json({"error":"invalid URL"});}
    else {
      // get latest number 
      Link.findOne().sort('-numUrl').exec(function(err, item) {
        if (err) console.log(err)
        let latestNum = item.numUrl + 1;

        // add new person 
        var newUrl = new Link({numUrl: latestNum, fullUrl: req.body.url});

        // save new person
        newUrl.save((err, data) => {
          if (err) return console.log(err)
          else return console.log(data)
        })
      return res.json({ original_url:req.body.url, short_url: latestNum })
      });
    }
  })
})

app.get("/api/shorturl/:num", (req, res) => {
  // get the num 
  let num = req.params.num;
  // get the url 
  Link.findOne({numUrl: num}).exec(function(err, item) {
    if (err) console.log(err)

    // add http
    var maybeHttp = item.fullUrl.substring(0,4)

    if (maybeHttp == "http"){
      res.redirect(item.fullUrl);
    }
    else {
      let newUrl = "http://" + item.fullUrl
      console.log(newUrl)
      res.redirect(newUrl)
    }
  });
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});