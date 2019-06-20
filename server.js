const controller = require('./controller.js');
const mysql = require('./common/mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const KEY_CONF = require('./keys.json'); // Keys json has to be in the server

var MySQLStore = require('express-mysql-session')(session);

var sessionStore = new MySQLStore({
  // Whether or not to automatically check for and clear expired sessions:
  clearExpired: true,
  // How frequently expired sessions will be cleared; milliseconds:
  checkExpirationInterval: 900000,
  // The maximum age of a valid session; milliseconds:
  expiration: 86400000
}, mysql.pool());

app.use(session({
  key: "user_me",
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  maxAge: 900000 //15 mins
}));

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
})); // to support URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));

// middleware function to check for logged-in users
var isUser = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
    return;
  }

  res.redirect('/');
};

var isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    next();
    return;
  }

  res.redirect('/');
};

app.get('/', function (req, res) {
  let sess = req.session;
  if (sess.user && sess.user.email) {
    if (sess.user.isAdmin) {
      res.redirect('/admin-home.html');
    } else {
      res.redirect('/user-home.html');
    }
  } else {
    req.session.destroy((err) => {
      res.writeHead(302, {
        'Location': '/login.html'
      });
      res.end();
    });
  }
});

app.get('/who', function (req, res) {
  let sess = req.session;
  if (sess.user) {
    sess.user.ip = req.ip;
    res.json(sess.user);
  } else {
    res.status(401).send('');
  }
});

app.post('/register/user', function (req, res) {
  controller.residentReg(req, res);
});

app.post('/register/apartment', function (req, res) {
  controller.apartmentReg(req, res);
});

app.get('/apartments', function (req, res) {
  controller.apartments(req, res);
});

app.post('/login', function (req, res) {
  controller.login(req, res);
});

app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return console.log(err);
      }
      res.redirect('/');
    });
  }
});

app.post('/maintance/add', isUser, isAdmin, function (req, res) {
  controller.addMaintanance(req, res);
});

app.post('/maintance/get', isUser, function (req, res) {
  controller.getMaintanance(req, res);
});

app.post('/expense/add', isUser, isAdmin, function (req, res) {
  controller.addExpenses(req, res);
});

app.get('/addressbook', isUser, isAdmin, function (req, res) {
  controller.getAddressBook(req, res);
});

app.post('/expense/get', function (req, res) {
  controller.getExpances(req, res);
});

var server;

if (process.env.NODE_ENV === 'production') {
  var sslOptions = {
    key: fs.readFileSync(KEY_CONF.key),
    cert: fs.readFileSync(KEY_CONF.crt)
  };

  server = https.createServer(sslOptions, app);
} else {
  server = http.createServer(app);
}

server.listen(5867, function () {
  console.log(`App is listening listening on port ${port}! >`, process.env.NODE_ENV);
});