-- ============================================
-- WanderLux Database Schema
-- MySQL 8.0+
-- ============================================

CREATE DATABASE IF NOT EXISTS wanderlux
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wanderlux;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(500) DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email)
) ENGINE=InnoDB;

-- ============================================
-- Table: trips
-- ============================================
CREATE TABLE IF NOT EXISTS trips (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  destination   VARCHAR(255) NOT NULL,
  days          TINYINT UNSIGNED NOT NULL CHECK (days BETWEEN 1 AND 30),
  preferences   JSON DEFAULT NULL,
  status        ENUM('generating','completed','failed') DEFAULT 'generating',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Table: itineraries
-- ============================================
CREATE TABLE IF NOT EXISTS itineraries (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id        INT UNSIGNED NOT NULL UNIQUE,
  itinerary_data JSON NOT NULL,
  model_used     VARCHAR(100) DEFAULT 'gemini-1.5-flash',
  tokens_used    INT UNSIGNED DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  INDEX idx_trip_id (trip_id)
) ENGINE=InnoDB;

-- ============================================
-- Sample Queries (for reference)
-- ============================================

-- Get all trips with itinerary for a user (paginated):
-- SELECT t.*, i.itinerary_data, i.created_at AS itinerary_created_at
-- FROM trips t
-- LEFT JOIN itineraries i ON i.trip_id = t.id
-- WHERE t.user_id = ?
-- ORDER BY t.created_at DESC
-- LIMIT 10 OFFSET 0;

-- Get single trip with full itinerary:
-- SELECT t.*, i.itinerary_data, u.name AS user_name
-- FROM trips t
-- JOIN users u ON u.id = t.user_id
-- LEFT JOIN itineraries i ON i.trip_id = t.id
-- WHERE t.id = ? AND t.user_id = ?;

-- Delete trip (cascades to itinerary):
-- DELETE FROM trips WHERE id = ? AND user_id = ?;
