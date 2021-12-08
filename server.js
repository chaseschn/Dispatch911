/*
Server.js
*/
const mongoose = require('mongoose');
const express = require('express');
const parser = require('body-parser')
const cookieParser = require('cookie-parser');
const host = '142.93.202.154'; // Kevin's Droplet
const port = 80;

const app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/home/*', authenticate);

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/dispatch';

// Set up default mongoose connection
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// USER SESSIONS
var sessions = {};
const LOGIN_TIME = 60000;

function filterSessions() {
  var now = Date.now();
  for (x in sessions) {
    username = x;
    time = sessions[x];
    if (time + LOGIN_TIME < now) {
      console.log('delete user session: ' + username);
      delete sessions[username];
    }
  }
}

setInterval(filterSessions, 2000);

function addSession(username) {
  var now = Date.now();
  sessions[username] = now;
}

function doesUserHaveSession(username) {
  return username in sessions;
}

function authenticate(req, res, next) {
  //console.log('test');
  var c = req.cookies;
  if (c && c.login)  {
    var fname = c.login.fname;
    if (doesUserHaveSession(fname)) {
      console.log('authenticating success!')
      addSession(fname);
      next();
    } else {
      res.redirect('/account/index.html'); //update this
    }
  } else {
      res.redirect('/account/index.html'); //update this
  }
}

/// SCHEMA
var Schema = mongoose.Schema;
// Chat SCHEMA
var ChatMessageSchema = new Schema({
  time: { type: Date, default: Date.now },
  department: String,
  alias: String,
  message: String
});
var ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
// User schema
var UserSchema = new Schema({
  fname: String,
  lname: String,
  email: String,
  password: String,
  phone: String,
  function: String,
  unit: String,
  pins: [Schema.Types.ObjectId],
  messages: [Schema.Types.ObjectId]
});
var User = mongoose.model('User', UserSchema);

// Pin schema
var PinSchema = new Schema({
  title: String,
  lat: Number,
  long: Number,
  description: String,
  department: String,
  color: String,
  time: String,
  endTime: String
});
var Pin = mongoose.model('Pin', PinSchema);

// Records Schema
var RecordSchema = new Schema({
  title: String,
  lat: Number,
  long: Number,
  description: String,
  department: String,
  time: String,
  endTime: String
});
var Record = mongoose.model('Record', RecordSchema);

/// OBJECTS
app.use(express.static('public_html'))
app.get('/account/login/:email/:password', (req, res) => login(req, res))
app.get('/get/map', (req, res) => getMap(req, res))
app.post('/post/map', (req, res) => postMap(req, res))
app.get('/get/pins', (req, res) => getPins(req, res))
app.post('/post/pin', (req, res) => postPin(req, res))
app.post('/update/pin', (req, res) => updatePin(req, res))
app.get('/get/records', (req, res) => getRecords(req, res))
app.post('/account/create/:fname/:lname/:email/:password/:phone/:functionVar/:unit', (req, res) => addUser(req,res))

// Wide chat
app.get('/chat', (req, res) => getAllChat(req, res))
app.post('/chat/post', (req, res) => postAllChat(req))

// Redirect link
app.all('*', (req, res) => res.redirect('/'))
// Start server
app.listen(port, () => { console.log('SERVER STARTED'); });

/*
This function adds a user to the database.
*/

function addUser(req,res) {
  User.find({fname: req.params.fname, lname: req.params.lname})
    .exec( function (err, results) {
      if (err) {
        return res.end('failed to create');
      } else if (results.length == 0) {
        var u = new User({
           fname: req.params.fname,
           lname: req.params.lname,
           email: req.params.email,
           password: req.params.password,
           phone: req.params.phone,
           function: req.params.functionVar,
           unit: req.params.unit,
         });
         u.save(
           function (err) {
             console.log('error: ' + err);
             if (err) { return res.end('Failed to create user!'); }
             else {res.end('Account Created');
             //res.redirect('/account/index.html');
             console.log("Adding User");}
           });
      } else {
        res.end('Name already taken');
      }
    });
  }

/*
Logs in a user and creates a cookie
*/
function login(req, res) {
  User.find({email: req.params.email, password: req.params.password})
  .exec( function (err, results) {
    if (err) {
      return res.end('failed to login');
    } else if (results.length == 1) {
      addSession(req.params.email);
      res.cookie("login", {email: req.params.email}, {maxAge: 120000});
      res.end('Login Successful');
    } else {
      res.end('incorrect number of results');
    }
  });
  function getAllChat(req, res) {
    var msg = mongoose.model('ChatMessage', ChatMessageSchema);
    msg.find({}).sort({ time: 1 }).exec((error, results) => {
      res.send(JSON.stringify(results))
    });
  }
}

function getAllChat(req, res) {
  var msg = mongoose.model('ChatMessage', ChatMessageSchema);
  msg.find({}).sort({ time: 1 }).exec((error, results) => {
    res.send(JSON.stringify(results))
  });
}

function postAllChat(req) {
  let getMsg = req.body;
  chat = new ChatMessage({
    alias: req.cookie.login.email,
    message: getMsg.msg,
    department: getMsg.department
  });
  chat.save((err) => { if (err) { console.log('An error occurred.') } });
}

function getMap(req, res) {

}

function postMap(req, res) {

}
/*
This function retrieves pins from db and send it users
*/
function getPins(req, res) {//Works! 12/08/2021 1012
  //console.log('reached getPins');
  var dateObj = new Date();
  currentDate = dateObj.toDateString(); // today's date; ex: 'Sun Dec 05 2021'
  //console.log(currentDate);
  var pins = mongoose.model('Pin', PinSchema);
  pins.find({ time: { $regex: currentDate } }).exec((error, results) => {//find pins today
    res.send(JSON.stringify(results))
  });
}
/*
This function posts the report into the db
*/
function postPin(req, res) {//Works: 12/08/2021 1012
  let getPin = req.body;
  console.log(getPin);
  console.log(getPin.depart);
  colorCode = '';
  if (getPin.depart == 'Fire') {
    colorCode = '#ff0000'//red
    //console.log('Fire red color')
  } else if (getPin.depart == 'Police') {
    colorCode = '#0000ff'//blue
    //console.log('Police blue color')
  } else {
    colorCode = '#00ff00'//green
    //console.log('Other colors!')
  }
  console.log(colorCode);
  pin = new Pin({
    title: getPin.title,
    lat: getPin.lat,
    long: getPin.long,
    description: getPin.description,
    department: getPin.depart,
    color: colorCode,
    time: getPin.time,
    endTime: '',
  });
  pin.save((err) => { if (err) { console.log('An error occurred.') } });
  console.log('saved');
}
//This updates the pins description and endTime
function updatePin(req, res) {//Works 12/08/2021 1033
  let getPin = req.body;
  searchId = req.body.id;
  newDescription = req.body.description;
  time = req.body.endTime;
  console.log('updating');
  console.log(searchId);
  var pins = mongoose.model('Pin', PinSchema);
  pins.findOneAndUpdate({ _id: searchId }, { $set: { description: newDescription, endTime: time } }, { new: true }, (err, results) => {
    if (err) {
      console.log('ERROR SAVING');
    };
    console.log(results)
  }
  );

}
function getRecords(req, res) {//Not working
  //console.log('reached getPins');
  dateSearch = req.body.searchDate // today's date; ex: 'Sun Dec 05 2021'
  //console.log(currentDate);
  var pins = mongoose.model('Pin', PinSchema);
  pins.find({ time: { $regex: dateSearch } }).exec((error, results) => {//find pins on date search
    res.send(JSON.stringify(results))
  });
}
