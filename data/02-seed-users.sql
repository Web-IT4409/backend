-- MySQL seed script for creating sample users
-- All users have password: 123456
-- Hashed password is a bcrypt hash of "123456"

-- Check if users already exist
SET @user_count = (SELECT COUNT(*) FROM users);
SET @continue = IF(@user_count > 0, 'no', 'yes');

-- Only seed if there are no users
DELIMITER //
CREATE PROCEDURE seed_users_if_empty()
BEGIN
  IF @continue = 'yes' THEN
    -- Pre-hashed password using bcrypt (123456)
    SET @hashed_password = '$2b$10$FgOmyKZ.J/PHIuQqpSl1Hui/W/v1EE1RZ5XMoGldXWUxcZWGg5OXC';
    SET @current_timestamp = NOW();
    
    -- Insert 10 sample users
    INSERT INTO users (firstName, lastName, username, password, status, createdAt, updatedAt) VALUES 
    ('John', 'Doe', 'johndoe', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp),
    ('Jane', 'Smith', 'janesmith', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp),
    ('Michael', 'Johnson', 'mikejohnson', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp),
    ('Emily', 'Davis', 'emilydavis', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp),
    ('David', 'Wilson', 'davidwilson', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp),
    ('Sarah', 'Brown', 'sarahbrown', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp),
    ('Robert', 'Martinez', 'robertmartinez', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp),
    ('Jessica', 'Anderson', 'jessicaanderson', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp),
    ('Thomas', 'Taylor', 'thomastaylor', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp),
    ('Jennifer', 'Clark', 'jenniferclark', @hashed_password, 'ACTIVE', @current_timestamp, @current_timestamp);
    
    SELECT 'Successfully seeded 10 users with password: 123456' AS 'Info';
  ELSE
    SELECT CONCAT('Database already has ', @user_count, ' users. Skipping seeding.') AS 'Info';
    SELECT 'To reseed, please clear the users table first.' AS 'Info';
  END IF;
END //
DELIMITER ;

-- Execute the procedure
CALL seed_users_if_empty();

-- Clean up
DROP PROCEDURE IF EXISTS seed_users_if_empty; 