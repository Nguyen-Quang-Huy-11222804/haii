-- Database setup for NEU Food Delivery (SQLite version)
-- This will create tables in neu_food.db

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table (for customers and admin)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    fullname TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Dishes table (products)
CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image_url TEXT,
    category_id INTEGER,
    is_available INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    receiver_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending',
    payment_method TEXT DEFAULT 'COD',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    dish_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_time INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

-- Tao tai khoan thong thuong roi vao database chuyen role thanh admin

-- Insert admin user (password: admin123)
INSERT OR IGNORE INTO users (email, fullname, password, role) VALUES
('admin@neu.edu.vn', 'Admin NEU', 'admin123', 'admin');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Món chính', 'Các món ăn chính'),
('Đồ uống', 'Nước uống và sinh tố'),
('Tráng miệng', 'Bánh ngọt và tráng miệng'),
('Ăn vặt', 'Đồ ăn nhẹ');

-- Insert sample dishes
INSERT INTO dishes (name, description, price, image_url, category_id) VALUES
('Phở bò', 'Phở bò truyền thống', 45000, 'pho-bo-ha-noi-thumb_980349ef2bcf40c9b736a672e5a944d3.jpg', 1),
('Cơm tấm', 'Cơm tấm sườn bì', 35000, 'com-tam.jpg', 1),
('Bún riêu', 'Bún riêu cua Hà Nội', 40000, 'cach_nau_bun_rieu_cua_ha_noi_ed8278d38b.webp', 1),
('Bún chả', 'Bún chả Hà Nội', 45000, 'Quan-bun-cha-ha-noi-o-TPHCM.jpg', 1),
('Sinh tố bơ', 'Sinh tố bơ tươi', 25000, 'tra1.jpg', 2),
('Trà sữa', 'Trà sữa trân châu', 30000, 'takoyaki-recipe_done.png.webp', 2),
('Bánh flan', 'Bánh flan caramel', 20000, 'banh-flan-caramen.jpg', 3),
('Bánh cuốn', 'Bánh cuốn nóng', 35000, 'banh-cuon-hinh-anh-mon-an-dac-san-viet-nam.jpg', 3),
('Bánh mì', 'Bánh mì thịt', 25000, 'banh-mi.jpg', 3),
('Xôi xéo', 'Xôi xéo mặn', 20000, 'xoi-xeo-01 (2)_1632322118.jpg', 3),
('Bún đậu', 'Bún đậu mắm tôm', 30000, 'Bun-dau-mam-tom-tai-nha-6.jpg', 4),
('Bánh bao', 'Bánh bao nhân thịt', 15000, '1-Banh-bao-nhan-thit.jpg', 4);