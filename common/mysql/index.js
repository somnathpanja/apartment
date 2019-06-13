if (global._con) {
    module.exports = global._con;
}

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'alpin.in',
    user: 'alpinin_admin',
    password: 'asdflkjh#123',
    database: 'alpinin_ssk'
});

function insert1(tableName, data) {
    let placeHolder = Object.keys(query).map(() => { return '?'; }).join(',');
    var q = `INSERT INTO ${tableName} (${Object.keys(query).join(',')}) VALUES (${placeHolder})`;

    pool.query(q, function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);
    });
}

function insert(tableName, data) {
    return new Promise(function (resolve, reject) {
        pool.query(`INSERT INTO ${tableName} SET ?`, data, function (error, results, fields) {
            if (error) return reject(error, results);
            resolve(results, fields);
        });
    });
}

function update(tableName, data, whereString) {
    return new Promise(function (resolve, reject) {
        let placeHolder = Object.keys(data).map((field) => { return field + '= ?'; }).join(',');
        let q = `UPDATE ${tableName} SET ${placeHolder}`;

        if (whereString) q += ' WHERE ' + whereString;

        pool.query(q, Object.values(data), function (error, results, fields) {
            if (error) return reject(error, results);
            resolve(results, fields);
        });
    });
}

function query(query, data = []) {
    return new Promise(function (resolve, reject) {
        pool.query(query, data, function (error, results, fields) {
            if (error) return reject(error, results);
            resolve(results, fields);
        });
    });
}

global._con = {
    insert,
    update,
    query,
    pool: function() {
        return pool;
    }
};

module.exports = global._con;

// pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
// q = 'INSERT INTO session (email, auth, isAdmin) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE auth = ?';

// q = 'INSERT INTO session (email, auth, isAdmin) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE auth = ?';
// db.query(q, [data.email, data.auth, data.isAdmin, data.auth]).then(() => {
//     res.status(200).send(data);
//     resolve();
// }).catch((err) => {
//     reject(err);
// });