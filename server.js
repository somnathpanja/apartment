const controller = require('./controller.js');
const mysql = require('./common/mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');

var MySQLStore = require('express-mysql-session')(session);
var sessionStore = new MySQLStore({}, mysql.pool());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    maxAge: 1800000  //30 mins
}));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    let sess = req.session;
    if (sess.isAdmin) {
        res.redirect('/admin-home.html');
    } else if (sess.email) {
        res.redirect('/user-home.html');
    } else {
        res.writeHead(302, { 'Location': '/login.html' });
        res.end();
    }

    res.end();
});

app.get('/who', function (req, res) {
    let sess = req.session;
    if (sess.email) {
        res.json({
            isAdmin: sess.isAdmin,
            email: sess.email,
            uName: sess.uName,
            useId: sess.useId,
            aptId: sess.aptId,
            flatNumber: sess.flatNumber,
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });
    } else {
        res.status(401).send('');
    }
});

function validateSession(req, res, next) {
    next();
}

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
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});

app.post('/maintance/add', validateSession, function (req, res) {
    controller.addMaintanance(req, res);
});

app.post('/expense/add', validateSession, function (req, res) {
    controller.addExpenses(req, res);
});

app.route('/expense/year/:year/month/:month:/day/:day')
    .get(function (req, res) {
        res.send('Get a random book')
    }).post(function (req, res) {
        res.send('Add a book')
    }).put(function (req, res) {
        res.send('Update the book')
    });

const server = http.createServer(app);
server.listen(5867);