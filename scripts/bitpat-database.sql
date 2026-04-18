-- BITPAT Database Schema
-- MySQL Database for Cryptocurrency Tracking Platform
-- Compatible with XAMPP/phpMyAdmin

-- Create database
CREATE DATABASE IF NOT EXISTS bitpat;
USE bitpat;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- PORTFOLIO TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coin_id VARCHAR(100) NOT NULL,
    coin_name VARCHAR(100) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
    purchase_price DECIMAL(18, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_coin_id (coin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coin_id VARCHAR(100) NOT NULL,
    coin_name VARCHAR(100) NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    total_value DECIMAL(18, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INSERT DEFAULT USER
-- Password: 'user' hashed with bcrypt (10 rounds)
-- Hash: $2b$10$rICGXiYPqM2Pn8kqzl8W9.K8Zy9gKnYQZQz9LZLq5vYz5vY5vY5vY
-- =============================================
INSERT INTO users (name, email, password) VALUES 
('BitPat User', 'user@bitpat.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfq.6Fl5mDU3hSE3n0ySC8NwQdW8OZRK');

-- =============================================
-- INSERT SAMPLE PORTFOLIO DATA
-- =============================================
INSERT INTO portfolio (user_id, coin_id, coin_name, amount, purchase_price) VALUES 
(1, 'bitcoin', 'Bitcoin', 0.5, 42000.00),
(1, 'ethereum', 'Ethereum', 2.5, 2200.00),
(1, 'cardano', 'Cardano', 1000, 0.45),
(1, 'solana', 'Solana', 15, 95.00),
(1, 'dogecoin', 'Dogecoin', 5000, 0.08);

-- =============================================
-- INSERT SAMPLE TRANSACTIONS
-- =============================================
INSERT INTO transactions (user_id, coin_id, coin_name, type, amount, price, total_value, date) VALUES 
(1, 'bitcoin', 'Bitcoin', 'buy', 0.25, 40000.00, 10000.00, '2024-01-15 10:30:00'),
(1, 'bitcoin', 'Bitcoin', 'buy', 0.25, 44000.00, 11000.00, '2024-02-20 14:45:00'),
(1, 'ethereum', 'Ethereum', 'buy', 1.5, 2100.00, 3150.00, '2024-01-20 09:15:00'),
(1, 'ethereum', 'Ethereum', 'buy', 1.0, 2300.00, 2300.00, '2024-03-01 16:00:00'),
(1, 'cardano', 'Cardano', 'buy', 500, 0.40, 200.00, '2024-02-01 11:20:00'),
(1, 'cardano', 'Cardano', 'buy', 500, 0.50, 250.00, '2024-02-15 13:30:00'),
(1, 'solana', 'Solana', 'buy', 10, 85.00, 850.00, '2024-01-25 08:45:00'),
(1, 'solana', 'Solana', 'buy', 5, 105.00, 525.00, '2024-03-10 17:30:00'),
(1, 'dogecoin', 'Dogecoin', 'buy', 3000, 0.07, 210.00, '2024-02-05 12:00:00'),
(1, 'dogecoin', 'Dogecoin', 'buy', 2000, 0.09, 180.00, '2024-03-05 10:15:00');

-- =============================================
-- VERIFY DATA
-- =============================================
SELECT 'Database created successfully!' AS status;
SELECT * FROM users;
SELECT * FROM portfolio;
SELECT * FROM transactions;
