require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const seedFilePath = path.join(__dirname, "../../resources/seed.sql");
const seedSQL = fs.readFileSync(seedFilePath, "utf8");

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("mysql connected");
    await connection.query(seedSQL);
    console.log("database seeded");
  } catch (err) {
    console.error("database seeding err:", err);
  } finally {
    await connection.end();
    console.log("database connection closed");
  }
}

module.exports = { seedDatabase };
