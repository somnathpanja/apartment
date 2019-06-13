var db = require('./common/mysql')

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
        email: req.body.email,
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
        email: req.body.email,
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
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
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
                resolve();
            } else {
                q = `SELECT id, aptId, flatNumber, uName FROM user WHERE email = ? AND password = ?`;
                db.query(q, [req.body.email, req.body.password]).then((results) => {
                    if (results.length) {
                        data.useId = results[0].id;
                        data.aptId = results[0].aptId;
                        data.uName = results[0].uName;
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
            req.session.email = data.email;
            req.session.useId = data.useId;
            req.session.aptId = data.aptId;
            req.session.isAdmin = data.isAdmin;
            req.session.uName = data.uName;
            req.session.flatNumber = data.flatNumber;
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
 *                      fromDate: this.fromDate,
                        toDate: this.toDate,
                        byCheck: this.byCheck,
                        checkNumber: this.checkNumber,
                        amount: this.amount,
                        receivedBy: this.receivedBy
 */
function addMaintanance(req, res) {
    console.log('HI');
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
    console.log('HI');
}

module.exports = {
    addExpenses,
    addMaintanance,
    login,
    residentReg,
    apartmentReg
}