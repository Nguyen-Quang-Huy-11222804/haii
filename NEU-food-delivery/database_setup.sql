-- Database setup for NEU Food Delivery
-- Run this SQL script to create the necessary tables

CREATE DATABASE IF NOT EXISTS neu_food_db;
USE neu_food_db;

-- Users table (for customers and admin)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed password
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dishes table (products)
CREATE TABLE IF NOT EXISTS dishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL, -- Price in VND
    image_url VARCHAR(500),
    category_id INT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- Can be NULL for guest orders
    receiver_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    total_amount INT NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    payment_method VARCHAR(100) DEFAULT 'COD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time INT NOT NULL, -- Price at the time of order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, fullname, password, role) VALUES
('admin@neu.edu.vn', 'Admin NEU', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Món chính', 'Các món ăn chính'),
('Đồ uống', 'Nước uống và sinh tố'),
('Tráng miệng', 'Bánh ngọt và tráng miệng'),
('Ăn vặt', 'Đồ ăn nhẹ');

-- Insert sample dishes
INSERT INTO dishes (name, description, price, image_url, category_id) VALUES
('Phở bò', 'Phở bò truyền thống', 45000, 'pho_bo.jpg', 1),
('Cơm tấm', 'Cơm tấm sườn bì', 35000, 'com_tam.jpg', 1),
('Sinh tố bơ', 'Sinh tố bơ tươi', 25000, 'sinh_to_bo.jpg', 2),
('Trà sữa', 'Trà sữa trân châu', 30000, 'tra_sua.jpg', 2),
('Bánh flan', 'Bánh flan caramel', 20000, 'banh_flan.jpg', 3),
('Khoai tây chiên', 'Khoai tây chiên giòn', 15000, 'khoai_tay_chien.jpg', 4);