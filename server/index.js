const express = require('express');
const mysql = require('mysql');
const { createDatabase, createTable } = require('./db');

const app = express();

// database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shopwebsite',
});

db.connect((err) => {
    if (err) {
        throw error;
    }
    console.log('mysql connected...');
});

if (db) {
    createDatabase(app, db);
    const isTableCreated = createTable(app, db);
    console.log(isTableCreated);
}


// server start on port
app.listen('0315', () => {
    console.log('server started on port 0315');
});