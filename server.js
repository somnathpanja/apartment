const controller = require('./controller.js');
const express = require('express');
const app = express();

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.writeHead(302, { 'Location': '/login.html' });
    res.end();
});

function validateSession(req, res, next){
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

app.listen(8080);