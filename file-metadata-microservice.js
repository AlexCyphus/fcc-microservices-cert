/*

I can submit a form object that includes a file upload.
The from file input field has the "name" attribute set to "upfile". We rely on this in testing.
When I submit something, I will receive the file name, and size in bytes within the JSON response.

*/

'use strict';

var express = require('express');
var cors = require('cors');
var multer = require('multer')
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
var upload = multer({ dest: './public/data/uploads/' })

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/hello', function(req, res){
  res.json({greetings: "Hello, API"});
});

  app.post('/api/fileanalyse', upload.single('upfile'), function(req, res){
    const file = req.file
    const size = file.size
    const fileName = file.originalname
    res.json({name: fileName, size: size})
  });

app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});
