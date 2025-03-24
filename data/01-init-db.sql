-- Initialize database and users

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS cnweb;

-- Use the database
USE cnweb;

-- Create user with proper access (using literal password instead of variable)
CREATE USER IF NOT EXISTS 'cnweb'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';

-- Grant privileges to both user specifications
GRANT SELECT, INSERT, UPDATE, DELETE ON cnweb.* TO 'cnweb'@'%';
FLUSH PRIVILEGES;

-- Log the initialization
SELECT 'Database and users initialized successfully' AS 'Info'; 