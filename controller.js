var db = require('./common/mysql');
var utils = require('./common/utils');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 *                      {aptName: this.aptName,
                        aptAddress: this.aptAddress,
                        email: this.email,
                        uName: this.uName,
                        uMobile: this.uMobile,
                        password: this.password}
 */
function apartmentReg(req, res) {
  let data = {
    name: req.body.aptName,
    address: req.body.aptAddress,
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    uName: req.body.uName,
    uMobile: req.body.uMobile
  };

  db.insert('apartment', data).then(() => {
    res.status(200).send('success');
  }).catch((err) => {
    res.status(500).send(err);
  });
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 *                      aptId: this.aptId,
                        flatNumber: this.flatNumber,
                        email: this.email,
                        uName: this.uName,
                        uMobile: this.uMobile,
                        password: this.password
 */
function residentReg(req, res) {
  let data = {
    aptId: Number(req.body.aptId),
    flatNumber: req.body.flatNumber,
    email: req.body.email.toLowerCase(),
    uName: req.body.uName,
    uMobile: req.body.uMobile,
    password: req.body.password
  };

  db.insert('user', data).then(() => {
    res.status(200).send('success');
  }).catch((err) => {
    res.status(500).send(err);
  });
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 *                      email: this.email,
                        password: this.password
 */
function login(req, res) {
  let data = {
    email: req.body.email,
    auth: uuidv4(),
    isAdmin: 0
  };

  let q = `SELECT id, uName FROM apartment WHERE email = ? AND password = ?`;

  db.query(q, [req.body.email, req.body.password]).then((results) => {
    return new Promise(function (resolve, reject) {
      if (results.length) {
        data.isAdmin = 1;
        data.uName = results[0].uName;
        data.aptId = results[0].id;
        data.isSuperAdmin = 1;
        resolve();
      } else {
        q = 'SELECT id, aptId, flatNumber, uName, isAdmin FROM user WHERE email = ? AND password = ?';
        db.query(q, [req.body.email, req.body.password]).then((results) => {
          if (results.length) {
            data.useId = results[0].id;
            data.aptId = results[0].aptId;
            data.uName = results[0].uName;
            data.isAdmin = results[0].isAdmin;
            data.flatNumber = results[0].flatNumber;
            resolve();
          } else {
            reject('Invalid login details!');
          }
        });
      }
    });
  }).then(function updateSession() {
    return new Promise(function (resolve, reject) {
      req.session.user = {
        email: data.email,
        useId: data.useId,
        aptId: data.aptId,
        isAdmin: data.isAdmin,
        isSuperAdmin: data.isSuperAdmin || 0,
        uName: data.uName,
        flatNumber: data.flatNumber
      };
      res.status(200).send('Success');
      resolve();
    });
  }).catch((err) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }

      res.status(500).send(err);
    });

  });
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
                        date: this.date,
                        byCheck: this.byCheck,
                        checkNumber: this.checkNumber,
                        amount: this.amount,
                        receivedBy: this.receivedBy
 */
function addMaintanance(req, res) {

  let date = new Date(req.body.date);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;

  let q = 'SELECT id FROM maintanance WHERE flatNumber = ? AND YEAR(date) = ? AND MONTH(date) = ?';

  db.query(q, [req.body.flatNumber, Number(year), Number(month)]).then((data) => {
    if (data.length > 0) {
      res.status(400).send('Already added maintanance for this Month!');
      return;
    }

    data = {
      date: utils.msToSQLDate(req.body.date),
      flatNumber: req.body.flatNumber,
      amount: Number(req.body.amount),
      receivedBy: req.body.receivedBy
    };

    if (req.body.byCheck) data.checkNumber = req.body.checkNumber;

    db.insert('maintanance', data).then(() => {
      res.status(200).send('success');
    }).catch((err) => {
      res.status(500).send(err);
    });

  }).catch((err) => {
    res.status(500).send(err);
  });
}

function getMaintanance(req, res) {
  let q = 'SELECT id, date, flatNumber, amount, receivedBy, checkNumber FROM maintanance WHERE flatNumber = ? AND YEAR(date) = ? AND MONTH(date) = ?';

  db.query(q, [req.session.user.flatNumber, Number(req.body.year), Number(req.body.month)]).then((data) => {
    res.json(data);
  }).catch((err) => {
    res.status(500).send(err);
  });
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 *                      date: this.date,
                        expenseFor: this.expenseFor,
                        amount: this.amount,
                        paidBy: this.paidBy
 */
function addExpenses(req, res) {
  let data = {
    date: utils.msToSQLDate(req.body.date),
    expenseFor: req.body.expenseFor,
    amount: Number(req.body.amount),
    paidBy: req.body.paidBy
  };

  if (req.body.byCheck) data.checkNumber = req.body.checkNumber;

  db.insert('expense', data).then(() => {
    res.status(200).send('success');
  }).catch((err) => {
    res.status(500).send(err);
  });
}


function getAddressBook(req, res) {
  db.query('SELECT flatNumber, uName, email, uMobile FROM user WHERE aptId=?', [req.session.user.aptId]).then((data) => {
    res.json(data);
  }).catch((err) => {
    res.status(500).send(err);
  });
}

function getExpances(req, res) {
  var range = utils.getMonthDateRange(Number(req.body.year), Number(req.body.month));
  let q = 'SELECT SUM(amount) amount FROM expense WHERE DATE(date) < ?';
  db.query(q, [utils.msToSQLDate(range.startDate.valueOf())]).then((carryOver) => {
    carryOver = carryOver[0];
    carryOver.amount = carryOver.amount || 0;
    carryOver.id = '#';
    carryOver.date = range.startDate.toDate();
    carryOver.expenseFor = 'CARRY-OVER';
    carryOver.paidBy = '-';
    carryOver.checkNumber = '-';

    let q = 'SELECT id, date, expenseFor, amount, paidBy, checkNumber FROM expense WHERE date >= ? AND date <= ? ORDER BY date';
    db.query(q, [utils.msToSQLDate(range.startDate.valueOf()), utils.msToSQLDate(range.endDate.valueOf())]).then((data) => {
      let totalExp = 0,
        income = 0;
      data.forEach(element => {
        if (element.amount < 0) {
          totalExp = totalExp + element.amount;
        } else {
          income = income + element.amount;
        }

      });

      data.unshift(carryOver);
      data.push({
        expenseFor: 'Total Expense (Rs.)',
        amount: -1 * totalExp
      });
      data.push({
        expenseFor: 'Cash on hand (Rs.)',
        amount: carryOver.amount + income + totalExp
      }); //total expense already in -ve

      res.json(data);
    }).catch((err) => {
      res.status(500).send(err);
    });
  }).catch((err) => {
    res.status(500).send(err);
  });
}

module.exports = {
  addExpenses,
  addMaintanance,
  login,
  residentReg,
  apartmentReg,
  getAddressBook,
  getExpances,
  getMaintanance
}