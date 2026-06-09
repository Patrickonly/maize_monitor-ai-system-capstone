-- Create database
DROP DATABASE IF EXISTS maize_detection_systemai;
CREATE DATABASE IF NOT EXISTS maize_detection_systemai;
USE maize_detection_systemai;

-- ROLES TABLE
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED DEFAULT ROLES
INSERT INTO roles (id, name, description) VALUES
  (1, 'admin', 'Administrator with full access'),
  (2, 'user', 'Standard user with limited access');

-- USERS TABLE
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(30) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role_id INT DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- CHAT SESSIONS
CREATE TABLE chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CHAT MESSAGES (fixed name)
CREATE TABLE chat_conversation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_session_id INT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  image_url LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- DISEASES TABLE
CREATE TABLE diseases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  scientific_name VARCHAR(255),
  description TEXT,
  severity_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  crop_type VARCHAR(100) DEFAULT 'maize',
  symptoms TEXT,
  treatment TEXT,
  prevention TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ANALYSIS RESULTS (ML OUTPUT)
CREATE TABLE analysis_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_message_id INT NOT NULL,
  disease_id INT,
  image_path VARCHAR(500),
  disease_detected BOOLEAN DEFAULT FALSE,
  disease_name VARCHAR(255),
  confidence_score DECIMAL(5,2),
  is_healthy BOOLEAN DEFAULT FALSE,
  processing_time_ms INT,
  affected_area_percentage DECIMAL(5,2),
  urgency_level ENUM('low','medium','high','critical') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_message_id) REFERENCES chat_conversation(id) ON DELETE CASCADE,
  FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
);
