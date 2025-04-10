-- Create database if not exists
CREATE DATABASE IF NOT EXISTS cnweb;

-- Use the database
USE cnweb;

-- Create tables (add your table creation scripts here)
-- Example:
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'BANNED', 'INACTIVE', 'INVESTIGATE') DEFAULT 'ACTIVE',
    hashtags JSON DEFAULT ('[]'),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    content TEXT,
    mediaUrl JSON,
    visibility ENUM('PUBLIC', 'PRIVATE') DEFAULT 'PUBLIC',
    likesCount INT DEFAULT 0,
    status ENUM('ACTIVE', 'HIDDEN', 'DELETED') DEFAULT 'ACTIVE',
    hashtags JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    postId INT,
    mediaURL VARCHAR(255),
    content TEXT,
    likesCount INT DEFAULT 0,
    status ENUM('ACTIVE', 'PENDING', 'DELETED') DEFAULT 'ACTIVE',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friend_requests (
    id VARCHAR(36) PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_friends (
    id VARCHAR(36) PRIMARY KEY,
    user_id_1 INT,
    user_id_2 INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    postId INT NULL,
    commentId INT NULL,
    type ENUM('LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY', 'CARE') NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    visibility ENUM('public', 'private') DEFAULT 'public',
    userId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    groupId INT,
    userId INT,
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (groupId) REFERENCES `groups`(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    adminId INT,
    groupId INT,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (groupId) REFERENCES `groups`(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts_to_group_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    content TEXT,
    mediaUrl JSON,
    groupId INT,
    adminId INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (groupId) REFERENCES `groups`(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS groupPosts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    mediaUrl JSON,
    userId INT,
    groupId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (groupId) REFERENCES `groups`(id) ON DELETE CASCADE
);

-- Insert sample data
-- 1. Users
INSERT INTO users (firstName, lastName, username, password, status, hashtags, createdAt, updatedAt) VALUES
('Nguyen', 'Van A', 'nguyenvana', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'ACTIVE', '["developer", "tech"]', NOW(), NOW()),
('Tran', 'Thi B', 'tranthib', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'ACTIVE', '["designer", "art"]', NOW(), NOW()),
('Le', 'Van C', 'levanc', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'INACTIVE', '["student", "education"]', NOW(), NOW()),
('Pham', 'Thi D', 'phamthid', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'ACTIVE', '["photography", "travel"]', NOW(), NOW()),
('Hoang', 'Van E', 'hoangvane', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'BANNED', '["gaming", "esports"]', NOW(), NOW()),
('Mai', 'Thi F', 'maithif', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'ACTIVE', '["music", "singer"]', NOW(), NOW()),
('Do', 'Van G', 'dovang', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'INVESTIGATE', '["business", "entrepreneur"]', NOW(), NOW()),
('Vu', 'Thi H', 'vuthih', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'ACTIVE', '["fitness", "health"]', NOW(), NOW()),
('Bui', 'Van I', 'buivani', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'ACTIVE', '["cooking", "food"]', NOW(), NOW()),
('Ly', 'Thi K', 'lythik', '$2a$10$6xvZy1swR0A8yCzQg7vQvOWABRkwgZsH8f8p9DWUZFCDVDJhB0SYi', 'ACTIVE', '["fashion", "style"]', NOW(), NOW());

-- 2. Posts
INSERT INTO posts (userId, content, mediaUrl, visibility, likesCount, status, hashtags, createdAt, updatedAt) VALUES
(1, 'Chia se ve cong nghe moi', '["image1.jpg", "video1.mp4"]', 'PUBLIC', 0, 'ACTIVE', '["tech", "innovation"]', NOW(), NOW()),
(2, 'Thiet ke moi nhat cua toi', '["design1.jpg"]', 'PUBLIC', 0, 'ACTIVE', '["design", "art"]', NOW(), NOW()),
(3, 'Bai hoc hom nay', '["lesson1.pdf"]', 'PRIVATE', 0, 'ACTIVE', '["education", "learning"]', NOW(), NOW()),
(4, 'Chuyen du lich tuyet voi', '["travel1.jpg", "travel2.jpg"]', 'PUBLIC', 0, 'ACTIVE', '["travel", "adventure"]', NOW(), NOW()),
(5, 'Game moi nhat', '["game1.jpg"]', 'PRIVATE', 0, 'ACTIVE', '["gaming", "esports"]', NOW(), NOW());

-- 3. Comments
INSERT INTO comments (userId, postId, mediaURL, content, likesCount, status, createdAt, updatedAt) VALUES
(2, 1, '', 'Bai viet rat hay!', 0, 'ACTIVE', NOW(), NOW()),
(3, 1, '', 'Cam on chia se', 0, 'ACTIVE', NOW(), NOW()),
(4, 2, 'comment1.jpg', 'Thiet ke dep qua!', 0, 'ACTIVE', NOW(), NOW()),
(5, 2, '', 'Tuyet voi!', 0, 'PENDING', NOW(), NOW()),
(6, 3, '', 'Bai hoc rat bo ich', 0, 'ACTIVE', NOW(), NOW());

-- 4. Friend Requests
INSERT INTO friend_requests (id, sender_id, receiver_id, status, createdAt, updatedAt) VALUES
(UUID(), 1, 2, 'pending', NOW(), NOW()),
(UUID(), 2, 3, 'accepted', NOW(), NOW()),
(UUID(), 3, 4, 'declined', NOW(), NOW()),
(UUID(), 4, 5, 'pending', NOW(), NOW()),
(UUID(), 5, 6, 'accepted', NOW(), NOW());

-- 5. User Friends
INSERT INTO user_friends (id, user_id_1, user_id_2, createdAt) VALUES
(UUID(), 1, 3, NOW()),
(UUID(), 2, 4, NOW()),
(UUID(), 3, 5, NOW()),
(UUID(), 4, 6, NOW()),
(UUID(), 5, 7, NOW());

-- 6. Emotions cho Posts
INSERT INTO emotions (userId, postId, commentId, type, createdAt, updatedAt) VALUES
(2, 1, NULL, 'LIKE', NOW(), NOW()),
(3, 2, NULL, 'LOVE', NOW(), NOW()),
(4, 3, NULL, 'WOW', NOW(), NOW()),
(5, 4, NULL, 'HAHA', NOW(), NOW()),
(6, 5, NULL, 'SAD', NOW(), NOW());

-- 7. Emotions cho Comments
INSERT INTO emotions (userId, postId, commentId, type, createdAt, updatedAt) VALUES
(7, NULL, 1, 'ANGRY', NOW(), NOW()),
(8, NULL, 2, 'CARE', NOW(), NOW()),
(9, NULL, 3, 'LIKE', NOW(), NOW()),
(10, NULL, 4, 'LOVE', NOW(), NOW()),
(1, NULL, 5, 'WOW', NOW(), NOW());

-- 8. Groups
INSERT INTO `groups` (name, description, image, visibility, userId, createdAt, updatedAt) VALUES
('Nguoi yeu cong nghe', 'Nhom danh cho nhung nguoi yeu thich cong nghe', 'tech_group.jpg', 'public', 1, NOW(), NOW()),
('Thiet ke va nghe thuat', 'Nhom cho nhung nguoi sang tao', 'art_group.jpg', 'public', 2, NOW(), NOW()),
('Nhom hoc tap', 'Hoc tap cung nhau', 'study_group.jpg', 'private', 3, NOW(), NOW()),
('Nhom du lich', 'Chia se kinh nghiem du lich', 'travel_group.jpg', 'public', 4, NOW(), NOW()),
('Cong dong game thu', 'Nhom cho game thu', 'gaming_group.jpg', 'private', 5, NOW(), NOW());

-- 9. Group Members
INSERT INTO group_members (groupId, userId, joinedAt) VALUES
-- Tech Enthusiasts members
(1, 1, NOW()),
(1, 2, NOW()),
(1, 3, NOW()),
-- Art & Design members
(2, 2, NOW()),
(2, 4, NOW()),
(2, 6, NOW()),
-- Study Group members
(3, 3, NOW()),
(3, 1, NOW()),
(3, 7, NOW()),
-- Travel Buddies members
(4, 4, NOW()),
(4, 8, NOW()),
(4, 9, NOW()),
-- Gaming Community members
(5, 5, NOW()),
(5, 6, NOW()),
(5, 10, NOW());

-- 10. Group Requests
INSERT INTO group_requests (userId, adminId, groupId, status, createdAt, updatedAt) VALUES
(6, 1, 1, 'pending', NOW(), NOW()),
(7, 2, 2, 'pending', NOW(), NOW()),
(8, 3, 3, 'accepted', NOW(), NOW()),
(9, 4, 4, 'accepted', NOW(), NOW()),
(10, 5, 5, 'declined', NOW(), NOW());

-- 11. Posts to Group Requests
INSERT INTO posts_to_group_requests (userId, content, mediaUrl, groupId, adminId, status, createdAt, updatedAt) VALUES
(1, 'Bai viet cong nghe can duyet', '["tech_article.pdf"]', 1, 1, 'pending', NOW(), NOW()),
(2, 'Portfolio thiet ke', '["portfolio.pdf"]', 2, 2, 'pending', NOW(), NOW()),
(3, 'Tai lieu hoc tap', '["materials.pdf"]', 3, 3, 'approved', NOW(), NOW()),
(4, 'Anh du lich', '["travel_photos.jpg"]', 4, 4, 'approved', NOW(), NOW()),
(5, 'Noi dung game', '["game_content.jpg"]', 5, 5, 'rejected', NOW(), NOW());

-- 12. Group Posts
INSERT INTO groupPosts (content, mediaUrl, userId, groupId, createdAt, updatedAt) VALUES
-- Tech Enthusiasts posts
('Phat trien moi trong cong nghe AI', '["ai_image1.jpg", "ai_doc.pdf"]', 1, 1, NOW(), NOW()),
('Thao luan ve cach lap trinh tot nhat', '["code_sample.png"]', 2, 1, NOW(), NOW()),
('Thong bao ve buoi gap mat cong nghe', '["meetup_poster.jpg"]', 3, 1, NOW(), NOW()),

-- Art & Design posts
('Trien lam tac pham moi nhat', '["artwork1.jpg", "artwork2.jpg"]', 2, 2, NOW(), NOW()),
('Diem nhan cua buoi workshop thiet ke', '["workshop_photos.jpg"]', 4, 2, NOW(), NOW()),
('Chia se ve qua trinh sang tao', '["design_process.pdf"]', 6, 2, NOW(), NOW()),

-- Study Group posts
('Tai lieu on thi', '["study_notes.pdf"]', 3, 3, NOW(), NOW()),
('Lich hoc nhom', '["schedule.pdf"]', 1, 3, NOW(), NOW()),
('Thao luan ve bai nghien cuu', '["research_paper.pdf"]', 7, 3, NOW(), NOW()),

-- Travel Buddies posts
('Chuyen di tuyet voi den Nhat Ban', '["japan1.jpg", "japan2.jpg", "japan3.jpg"]', 4, 4, NOW(), NOW()),
('Meo du lich chau Au', '["europe_guide.pdf"]', 8, 4, NOW(), NOW()),
('Meo chup anh phieu luu', '["photo_tips.jpg"]', 9, 4, NOW(), NOW()),

-- Gaming Community posts
('Danh gia game moi', '["game_review.jpg"]', 5, 5, NOW(), NOW()),
('Ket qua giai dau game', '["tournament_results.png"]', 6, 5, NOW(), NOW()),
('Huong dan chien luoc cho nguoi moi', '["strategy_guide.pdf"]', 10, 5, NOW(), NOW()); 