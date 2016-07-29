var mysql = require('mysql');
// create mySql connection move to its own module after.
function createConnection() {
    var connection = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'jarindr',
        database: 'shootdee',
    });
    return connection;
}

// for transaction
function rollback(cn, err, res) {
    cn.rollback(function() {
        console.log("connection rollback with error: " + err);
        res.send(err);
    });
}

function commit(cn, err) {
    cn.commit(function(err) {
        if (err) {
            cn.rollback(function() {
                throw err;
            });
        }
        console.log('Transaction Complete.');
        cn.release();
    });
}

//export the Sql
module.exports.createConnection = createConnection;
module.exports.rollback = rollback;
module.exports.commit = commit;
