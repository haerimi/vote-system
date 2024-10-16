// mysql 모듈 소환
const mariadb = require('mysql2');

// DB와 연결 통로 생성
const conn = mariadb.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    database : 'surveys',
    dateStrings : true
});

conn.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

module.exports = conn; 