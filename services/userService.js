const mysqlConnection = require('../config/database/index');

const getUsers = (req, res) => {
    mysqlConnection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('fetching users err: ', err);
            res.status(500).json({ error: 'internal err' });
            return;
        }
        res.json(results);
    });
};

const createUser = (req, res) => {
    const { name, email } = req.body;
    mysqlConnection.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, results) => {
        if (err) {
            console.error('insert user err: ', err);
            res.status(500).json({ error: 'internal err' });
            return;
        }
        res.status(201).json({ message: 'user created successfully' });
    });
};

module.exports = {
    getUsers,
    createUser,
};