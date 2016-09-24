const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');

const sampleData = require('./sample_data.json');

const app = express();

const allowCORS = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.use(allowCORS);
app.use(bodyParser.json())

app.use(session({
  secret: 'popsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Needs HTTPS for secure cookies
}));

app.get('/chat', function (req, res) {
  res.json(sampleData);
});

app.post('/chat', function (req, res) {
  let data = req.body;
  data.senderID = req.session.id;
  sampleData.push(data);
  res.status(200);
  res.send();
});

app.listen(8000, function () {
  console.log('Listening on 8000');
});
