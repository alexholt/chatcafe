const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');

const db = require('./db');

const app = express();

let highestId = -1;
let isDbReady = false;

db.connect(function () {
  db.getHighestId(function (err, id) {
    if (err) {
      console.error('Unable to get the latest id');
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
app.use(allowCORS);
app.use(checkDB);

app.use(session({
  secret: 'popsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Needs HTTPS for secure cookies
}));

app.get('/chat', function (req, res) {
  db.readMessages(function (messages) {
    res.json(messages);
  });
});

app.post('/chat', function (req, res) {
  let message = req.body;
  message.senderId = req.session.id;
  message.id = ++highestId;
  db.writeMessage(message, function (err) {
    if (err) {
      rest.status(503);
    } else {
      res.status(200);
    }
    res.send();
  });
});

if (process.env.NODE_ENV === 'production') {
  app.listen(80);
} else {
  app.listen(8000, function () {
    console.log('Listening on 8000');
  });
}
