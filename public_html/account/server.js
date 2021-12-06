/*
Server.js
*/
const mongoose = require('mongoose');
const express = require('express');
const parser = require('body-parser')
const cookieParser = require('cookie-parser');
const host = '147.182.199.110'; // Droplet ip not uploaded yet
const port = 5000;

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
// function addUser(req) {
//   let getUser = req.body;
//   User.find({ username: getUser.username }).exec((error, results) => {
//     if (results.length == 0) {
//       user = new User({
//         fname: getUser.fname,
//         lname: getUser.lname,
//         email: getUser.email,
//         password: getUser.password,
//         phone: getUser.phone,
//         function: getUser.function,
//         unit: getUser.unit
//       });
//       user.save((err) => { if (err) { console.log('ERROR SAVING') } });
//       res.send("Account created");
//       console.log('ACCOUNT CREATED');
//     } else {
//       res.send("Account already exists");
//       console.log('USER ALREADY EXISTS');
//     }
//   });
// }


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
// function login(req, res) {
//   var name = req.body.fname;
//   let user = {
//     fname: name,
//     password: req.body.password
//   };
//   var servResp = {};
//   User.find(user)
//     .exec((error, results) => {
//       if (results.length == 1) {
//         let sessionKey = Math.floor(Math.random() * 1000);
//         sessionKeys[name] = sessionKey;
//         servResp.success = true;
//         servResp.redirect = true;
//         res.cookie("login", { fname: name, key: sessionKey }, { maxAge: sessionLength });
//         res.send(servResp)
//       } else {
//         servResp.success = true;
//         servResp.redirect = true;
//         res.send(servResp)
//         console.log('Invalid username or password.');
//       }
//     });
// }
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

function postAllChat(req) {
  let getMsg = req.body;
  chat = new ChatMessage({
    alias: 'Dispatcher',
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
function getPins(req, res) {
  var pins = mongoose.model('Pin', PinSchema);
  pins.find({}).exec((error, results) => {//finds all pins. need to search for dates
    res.send(JSON.stringify(results))
  });
}
/*
This function posts the report into the db
*/
function postPin(req, res) {
  let getPin = req.body;
  pin = new Pin({
    title: getPin.title,
    lat: getPin.lat,
    long: getPin.long,
    description: getPin.report,
    department: getPin.department,
    time: getPin.time,
  });
  pin.save((err) => { if (err) { console.log('An error occurred.') } });
}

function getRecords(req, res) {

}