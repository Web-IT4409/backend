const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'cnweb',
    password: 'securepassword123',
    database: 'cnweb',
    logging: console.log
});

sequelize.sync({ force: false })

module.exports = sequelize;