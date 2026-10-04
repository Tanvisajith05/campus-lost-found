CREATE DATABASE IF NOT EXISTS campus_lost_found;
USE campus_lost_found;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  college_id VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('STUDENT','ADMIN') NOT NULL DEFAULT 'STUDENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_name VARCHAR(160) NOT NULL,
  category ENUM('Electronics','Books','ID Cards','Bags','Clothing','Accessories','Stationery','Keys','Other') NOT NULL,
  type ENUM('LOST','FOUND') NOT NULL,
  location VARCHAR(180) NOT NULL,
  date DATE NOT NULL,
  description VARCHAR(500) NOT NULL,
  image VARCHAR(255),
  status ENUM('ACTIVE','CLAIMED','RETURNED','EXPIRED','REJECTED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_items_search (type, category, status, date),
  INDEX idx_items_location (location)
);

CREATE TABLE IF NOT EXISTS claims (
  claim_id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  user_id INT NOT NULL,
  reason VARCHAR(500) NOT NULL,
  identifying_description VARCHAR(500) NOT NULL,
  approximate_lost_date DATE NOT NULL,
  status ENUM('PENDING','UNDER_VERIFICATION','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_claim_item FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
  CONSTRAINT fk_claim_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
  match_id INT AUTO_INCREMENT PRIMARY KEY,
  lost_item_id INT NOT NULL,
  found_item_id INT NOT NULL,
  match_score INT NOT NULL,
  match_status ENUM('SUGGESTED','DISMISSED','CONFIRMED') DEFAULT 'SUGGESTED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_pair (lost_item_id, found_item_id),
  CONSTRAINT fk_match_lost FOREIGN KEY (lost_item_id) REFERENCES items(item_id) ON DELETE CASCADE,
  CONSTRAINT fk_match_found FOREIGN KEY (found_item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_actions (
  action_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id INT NOT NULL,
  action VARCHAR(80) NOT NULL,
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_action_admin FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);
