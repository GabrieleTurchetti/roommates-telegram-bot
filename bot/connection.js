const mysql = require('mysql')

const conn = mysql.createConnection({
    host: 'host',
    user: 'user',
    password: 'password',
    database: 'database'
})

conn.connect(function(err) {
    try{} catch {}
})

exports.conn = conn