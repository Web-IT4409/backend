const { Sequelize } = require("sequelize");

const dbConfig = {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: console.log,
};

const sequelize = new Sequelize(dbConfig);

// force update database theo model
sequelize.sync({ alter: true, force: false, indexes: false });

module.exports = sequelize;
