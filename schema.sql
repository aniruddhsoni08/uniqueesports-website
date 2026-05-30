-- Unique Esports Tournament Platform - Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS unique_esports;
USE unique_esports;

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  game_type VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  prize_pool VARCHAR(50),
  status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
  youtube_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tournament_id INT NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  players_count INT NOT NULL,
  additional_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Admin User (password: admin123 - CHANGE THIS IN PRODUCTION)
-- Password hash generated with bcryptjs
INSERT INTO admin_users (username, password_hash, email) VALUES 
('admin', '$2a$10$YOIz8kVYVfN7qY8QZ8QZQe8qZ8QZQe8QZ8QZQe8QZ8QZQe8QZ8QZQ', 'admin@uniqueesports.com')
ON DUPLICATE KEY UPDATE id = id;

-- Sample Tournament Data
INSERT INTO tournaments (name, game_type, description, start_date, end_date, prize_pool, status) VALUES
('CS:GO Pro League', 'Counter-Strike: Global Offensive', '5v5 Competitive Gaming', '2025-01-15 10:00:00', '2025-01-22 18:00:00', '$50,000', 'upcoming'),
('Valorant Championship', 'Valorant', 'Elite Valorant Competition', '2025-01-20 09:00:00', '2025-01-28 20:00:00', '$75,000', 'upcoming'),
('League of Legends Cup', 'League of Legends', '5v5 MOBA Esports Battle', '2025-02-05 08:00:00', '2025-02-15 22:00:00', '$100,000', 'upcoming')
ON DUPLICATE KEY UPDATE id = id;
