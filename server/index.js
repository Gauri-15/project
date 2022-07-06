const mysql = require('mysql');
const express = require('express');;
const bodyParser = require('body-parser');
const config = require('./config');
const cors = require('cors');
const app = express();
const PORT = '0315';
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const cyrb53 = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const dbConn = mysql.createConnection(config.db);
dbConn.connect();

app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});

// Retrieve all users 
app.get('/users', function (req, res) {
    dbConn.query('SELECT * FROM users', function (error, results, fields) {
        if (error) return res.send({ error_code: error.code, error_message: error.message, error_query: error.sql });
        return res.send({ error: false, data: results, message: 'users list.' });
    });
});

// Retrieve user with param 
app.get('/user/:email', function (req, res) {
    let email = req.params.email;
    if (!email) {
        return res.status(400).send({ error: true, message: 'Please provide user params' });
    }
    if (email) {
        dbConn.query(`SELECT * FROM users where email="${email}"`, function (error, results, fields) {
            if (error) return res.send({ error_code: error.code, error_message: error.message, error_query: error.sql });
            return res.send({ error: false, data: results, message: 'users list.' });
        });
    }
});

// Add a new user  
app.post('/user', async function (req, res) {
    let user = req.body;
    // generate salt to hash password
    user.password = cyrb53(user.password);
    user.confirm_password = cyrb53(user.confirm_password);
    if (!user) {
        return res.status(400).send({ error: true, message: 'Please provide user' });
    }
    dbConn.query("INSERT INTO users SET ? ", { ...user }, function (error, results, fields) {
        if (error) return res.send({ error_code: error.code, error_message: error.message, error_query: error.sql });
        return res.send({ error: false, data: results, message: 'New user has been created successfully.' });
    });
});

// login a user  
app.post('/login', async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    // generate salt to hash password
    let hashedPass = cyrb53(password).toString();

    if (!email) {
        return res.status(400).send({ error: true, message: 'Please provide user data' });
    }
    if (email) {
        dbConn.query(`SELECT * FROM users where email="${email}"`, function (error, results, fields) {
            if (results.length > 0) {
                if (results[0].email === email) {
                    if (results[0].password === hashedPass) {
                        return res.send({ error: false, data: results[0], login: 'yes', message: 'user login successful' });
                    } else {
                        return res.status(400).send({ error: true, errorType: 'login_password_error' });
                    }
                } else {
                    return res.status(400).send({ error: true, errorType: 'login_email_error' });
                }
            } else {
                return res.status(400).send({ error: true, errorType: 'login_email_error' });
            }
            if (error) return res.send({ error_code: error.code, error_message: error.message, error_query: error.sql });
        });
    }
});

// update login status
app.put('/login_status', async function (req, res) {
    let email = req.body.email;
    let isLoggedIn = req.body.is_logged_in;
    dbConn.query(`UPDATE users SET is_logged_in=${isLoggedIn} WHERE users.email="${email}"`, function (errorMsg, resultData) {
        if (errorMsg) return res.send({ error_code: errorMsg.code, error_message: errorMsg.message, error_query: errorMsg.sql });
        return res.send({ error: false, data: resultData[0], message: 'user login successful' });
    });
});

// PRODUCTS API's 
// retrieve all products
app.get('/products', function (req, res) {
    dbConn.query('SELECT * FROM products', function (error, results, fields) {
        if (error) return res.send({ error_code: error.code, error_message: error.message, error_query: error.sql });
        return res.send({ error: false, data: results, message: 'users list.' });
    });
});

// retrieve products on basis of ID
app.get('/product/:id', function (req, res) {
    const id = req.params.id;
    dbConn.query(`SELECT * FROM products WHERE id =${id}`, function (error, results, fields) {
        if (error) return res.send({ error_code: error.code, error_message: error.message, error_query: error.sql });
        return res.send({ error: false, data: results, message: 'users list.' });
    });
});

// Checkout Api
app.post('/user_product', function (req, res) {
    let { user_id, product_list, total_price } = req.body.data;
    if (!req.body.data) {
        return res.status(400).send({ error: { user_id, product_list, total_price }, message: 'Please provide user and user_id' });
    }
    dbConn.query(`INSERT INTO user_products (user_id, product_list, total_price) VALUES (?,?,?)`, [user_id, product_list, total_price], function (error, results, fields) {
        if (error) return res.send({ error_code: error.code, error_message: error.message, error_query: error.sql });
        return res.send({ error: false, data: results, message: 'user has been updated successfully.' });
    });
});

// server start on port
app.listen(PORT, () => {
    console.log(`server started on port :${PORT}`);
});