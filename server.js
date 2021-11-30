/*
Server.js
*/
const mongoose = require('mongoose');
const express = require('express');
const parser = require('body-parser')
const host = '147.182.199.110'; // Droplet ip not uploaded yet
const port = 5000;

const app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

const db  = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/dispatch';

// Set up default mongoose connection
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

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
  phone: Number,
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
app.post('/login', (req, res) => login(req, res))
app.get('/get/map', (req, res) => getMap(req, res))
app.post('/post/map', (req, res) => postMap(req, res))
app.get('/get/pins', (req, res) => getPins(req, res))
app.post('/post/pin', (req, res) => postPin(req, res))
app.get('/get/records', (req, res) => getRecords(req, res))
app.post('/add/user', (req, res) => addUser(req))

// Wide chat
app.get('/chat', (req, res) => getAllChat(req, res))
app.post('/chat/post', (req, res) => postAllChat(req))

// Redirect link
app.all('*', (req, res) => res.redirect('/'))
// Start server
app.listen(port, () => {console.log('SERVER STARTED');});

/*
This function adds a user to the database.
*/
function addUser(req) {
  let getUser = req.body;
  User.find({ username: getUser.username }).exec((error, results) => {
    if (results.length == 0) {
      user = new User({
        fname: getUser.fname,
        lname: getUser.lname,
        email: getUser.email,
        password: getUser.password,
        phone: getUser.phone,
        function: getUser.function,
        unit: getUser.unit
      });
      user.save((err) => { if (err) {console.log('ERROR SAVING')}});
      res.send("Account created");
      console.log('ACCOUNT CREATED');
    } else {
      res.send("Account already exists");
      console.log('USER ALREADY EXISTS');
    }
  });
}

/*
Logs in a user and creates a cookie
*/
function login(req, res) {
  var name = req.body.fname;
  let user = {
    fname: name,
    password: req.body.password
  };
  var servResp = {};
  User.find(user)
    .exec((error, results) => {
      if ( results.length==1 ) {
        let sessionKey = Math.floor(Math.random() * 1000);
        sessionKeys[name] = sessionKey;
        servResp.success = true;
        servResp.redirect = true;
        res.cookie("login", {fname: name, key: sessionKey}, { maxAge: sessionLength });
        res.send(servResp)
      } else {
        servResp.success = true;
        servResp.redirect = true;
        res.send(servResp)
        console.log('Invalid username or password.');
      }
    });
}

function getAllChat(req, res) {
  var msg = mongoose.model('ChatMessage', ChatMessageSchema );
  msg.find({}).sort({time : 1}).exec((error, results) =>{
    res.send(JSON.stringify(results))
  });
}

function postAllChat(req){
  let getMsg = req.body;
  chat = new ChatMessage({
    alias: 'Dispatcher',
    message: getMsg.msg,
    department: getMsg.department
  });
  chat.save((err) => { if (err) { console.log('An error occurred.') }});
}

function getMap(req, res) {

}

function postMap(req, res) {

}

function getPins(req, res) {

}

function postPin(req, res) {

}

function getRecords(req, res) {

}
