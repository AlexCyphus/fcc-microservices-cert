/**

I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.
I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. Returned will be the user object with also with the exercise fields added.
I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). Return will be the user object with added array log and count (total exercise count).
I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)

 */

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose');

mongoose.connect("*****" || "*****", { useNewUrlParser: true, useUnifiedTopology: true })

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// these are my only changes

// create user schema and model
const personSchema = new mongoose.Schema({
  username: {type: String, unique: true},
})

const Person = mongoose.model("Person", personSchema);
// create exercise schema and model 
const exerciseSchema = new mongoose.Schema({
  userId: {type: String},
  description: {type: String},
  duration: {type: Number},
  date: {type: Date}
})

const Exercise = mongoose.model("Exercise", exerciseSchema);


var userId;

app.post('/api/exercise/new-user', (req, res) => {
  var username = req.body.username;
  // get last entry
  var newUser = new Person({username: username})
  newUser.save((err, item) => {
    if (err) console.log(err)
    userId = item._id.toString()
    res.json(item)
  })
});

app.get("/api/exercise/users", (req, res) => {
  const allUsers = Person.find({}, (err, item) => {
    if (err) console.log(err)
    res.json(item)
  })
  console.log(allUsers);
})

app.post("/api/exercise/add", (req, res) => {
  const userId = req.body.userId;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  var date = new Date().toDateString();
  if (req.body.date){date = new Date(req.body.date).toDateString()}
  newExercise = new Exercise({userId, description, duration, date})
  newExercise.save((err, item) => {})
  Person.findById(userId).exec((err, item)=>{
    let data = {"username":item.username, "description":req.body.description,"duration": parseInt(req.body.duration),"_id":req.body.userId,"date": date};
    res.json(data)
  }); 
  

})

app.get("/api/exercise/log", (req, res) => {
  console.log('hello')
  let urlUserId = req.query.userId
  let dateFrom = req.query.from
  let dateTo = req.query.to
  let limit = req.query.limit

  // this is the only thing that needs finishing
  if (dateTo && dateFrom){
    console.log("date_to and from")
    if (limit){
    limit = parseInt(limit)
    Person.findById(urlUserId).exec((err, user) => {
      const cond = {userId: urlUserId, date: {$gte: Date.parse(dateFrom), $lt: Date.parse(dateTo)}}
      Exercise.find(cond).limit(limit).exec((err, item) => {
        if (err) console.log(err)
        let data = {_id: urlUserId, username: user.username, log: item}
        res.json(data)
      })
    });
    }
  // just dates
  Person.findById(urlUserId).exec((err, user) => {
    const cond = {userId: urlUserId, date: {$gte: Date.parse(dateFrom), $lt: Date.parse(dateTo)}}
    Exercise.find(cond).exec((err, item) => {
      if (err) console.log(err)
      let data = {_id: urlUserId, username: user.username, log: item}
      res.json(data)
    })
  });
  }


  // just limit
  else if (limit) {
    console.log(limit)
    limit = parseInt(limit);
    console.log(limit)
    Person.findById(urlUserId).exec((err, user) => {
      Exercise.find({ userId: urlUserId }).limit(limit).exec((err, item) => {
        let data = {_id: urlUserId, username: user.username, log: item}
        res.json(data)
      });
    });
  }

  // just userid
  else {
    Person.findById(urlUserId).exec((err, user) => {
      Exercise.find({ userId: urlUserId }).exec((err, item) => {
        let data = {_id: urlUserId, username: user.username, log: item}
        res.json(data)
      });
    });
  }
})

// end of my changes


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})
// end of changes

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})