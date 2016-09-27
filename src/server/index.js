const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');

const MongoStore = require('connect-mongo')(session);

const db = require('./db');
const dbName = 'messages';

const app = express();

let highestId = -1;
let isDbReady = false;

db.connect(dbName, function (err) {
  if (err) {
    console.error('Could not connect to the database');
    process.exit();
  }
  db.getHighestId(function (err, id) {
    if (err) {
      console.error('Unable to get the latest id');
      process.exit();
    } else {
      highestId = id;
      isDbReady = true;
    }

  });
});

const allowCORS = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

const checkDB = function (req, res, next) {
  if (isDbReady) {
    next();
  } else {
    res.status(503);
  }
};

app.use(bodyParser.json())
app.use(checkDB);

app.use(session({
  secret: 'popsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Needs HTTPS for secure cookies
  store: new MongoStore({ url: process.env.DB_URL })
}));

if (process.env.NODE_ENV === 'development') {
  // It's nice to run the client and server separately for development so you
  // can use the webpack-dev-server and nodemon for autoreloading of each one
  // separately but for production the client will be delivered from the same
  // domain
  app.use(allowCORS);
}

app.get('/chat', function (req, res) {
  db.readMessages(function (err, messages) {
    res.json(messages);
  });
});

app.post('/chat', function (req, res) {
  let message = req.body;
  message.senderId = req.session.id;
  message.id = ++highestId;
  db.writeMessage(message, function (err) {
    if (err) {
      res.status(503);
    } else {
      res.status(200);
    }
    res.send();
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
}

app.listen(8000, function () {
  console.log('Listening on 8000');
});
