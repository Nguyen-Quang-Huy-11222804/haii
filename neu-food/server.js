import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'neu_food.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    fullname TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Dishes table
  db.run(`CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image_url TEXT,
    category_id INTEGER,
    is_available INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    receiver_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending',
    payment_method TEXT DEFAULT 'COD',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Order items table
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    dish_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_time INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
  )`);

  // Insert sample data
  insertSampleData();
});

function insertSampleData() {
  // Admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (email, fullname, password, role) VALUES (?, ?, ?, ?)`,
    ['admin@neu.edu.vn', 'Admin NEU', hashedPassword, 'admin']);

  // Categories
  const categories = [
    ['Món chính', 'Các món ăn chính'],
    ['Đồ uống', 'Nước uống và sinh tố'],
    ['Tráng miệng', 'Bánh ngọt và tráng miệng'],
    ['Ăn vặt', 'Đồ ăn nhẹ']
  ];

  categories.forEach(cat => {
    db.run(`INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)`, cat);
  });

  // Sample dishes
  const dishes = [
    ['Phở bò', 'Phở bò truyền thống', 45000, 'https://c8.alamy.com/comp/2E97XBP/vietnamese-cuisine-beef-pho-bo-soup-2E97XBP.jpg', 1],
    ['Cơm tấm', 'Cơm tấm sườn bì', 35000, 'https://vietnamnomad.com/wp-content/uploads/2022/09/What-is-com-tam-Vietnamese-broken-rice-Vietnamnomad-768x576.jpg', 1],
    ['Bún riêu', 'Bún riêu cua Hà Nội', 40000, 'https://media-cdn-v2.laodong.vn/storage/newsportal/2024/3/30/1321468/Bun-Rieu-01.jpg', 1],
    ['Sinh tố bơ', 'Sinh tố bơ tươi', 25000, 'https://tiki.vn/blog/wp-content/uploads/2023/04/sinh-to-bo-mat-ong.jpg', 2],
    ['Trà sữa', 'Trà sữa trân châu', 30000, 'https://photo.salekit.com/uploads/salekit_5839409ef492f40d15e5c71a49c27766/tra-sua-kem-dua-nuong-1x1.jpg', 2],
    ['Bánh flan', 'Bánh flan caramel', 20000, 'https://banhmihanoi.net/wp-content/uploads/2023/03/banh-flan-2.png', 3],
  ];

  dishes.forEach(dish => {
    db.run(`INSERT OR IGNORE INTO dishes (name, description, price, image_url, category_id) VALUES (?, ?, ?, ?, ?)`, dish);
  });
}

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, 'secret_key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Routes

// Auth routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key');
    res.json({ token, user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role } });
  });
});

app.post('/api/register', (req, res) => {
  const { email, fullname, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (email, fullname, password) VALUES (?, ?, ?)', [email, fullname, hashedPassword], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User registered' });
  });
});

// Products
app.get('/api/dishes', (req, res) => {
  const { category_id } = req.query;
  let sql = 'SELECT d.*, c.name as category_name FROM dishes d LEFT JOIN categories c ON d.category_id = c.id WHERE d.is_available = 1';
  const params = [];
  if (category_id) {
    sql += ' AND d.category_id = ?';
    params.push(category_id);
  }
  sql += ' ORDER BY d.id ASC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: rows });
  });
});

app.get('/api/dishes/:id', (req, res) => {
  db.get('SELECT * FROM dishes WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Dish not found' });
    res.json({ success: true, data: row });
  });
});

// Categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories WHERE is_active = 1 ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: rows });
  });
});

// Orders
app.post('/api/orders', verifyToken, (req, res) => {
  const { receiver_name, phone_number, area_address, detail_address, payment_method, cart_items } = req.body;
  const delivery_address = `${area_address} - ${detail_address}`;
  const user_id = req.user.id;

  let total_amount = 0;
  cart_items.forEach(item => {
    total_amount += item.price * item.quantity;
  });

  db.run('INSERT INTO orders (user_id, receiver_name, phone_number, delivery_address, total_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, receiver_name, phone_number, delivery_address, total_amount, payment_method], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    const order_id = this.lastID;
    const stmt = db.prepare('INSERT INTO order_items (order_id, dish_id, quantity, price_at_time) VALUES (?, ?, ?, ?)');

    cart_items.forEach(item => {
      stmt.run([order_id, item.id, item.quantity, item.price]);
    });
    stmt.finalize();

    res.json({ success: true, message: `Order #${order_id} placed successfully` });
  });
});

app.get('/api/orders', verifyToken, (req, res) => {
  let sql = `
    SELECT o.*,
           GROUP_CONCAT(oi.dish_id || ':' || oi.quantity || ':' || oi.price_at_time || ':' || d.name) as items_data
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN dishes d ON oi.dish_id = d.id
  `;
  const params = [];

  if (req.user.role !== 'admin') {
    sql += ' WHERE o.user_id = ?';
    params.push(req.user.id);
  }

  sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Parse the items data
    const ordersWithItems = rows.map(order => ({
      ...order,
      items: order.items_data ? order.items_data.split(',').map(item => {
        const [dish_id, quantity, price, dish_name] = item.split(':');
        return {
          dish_id: parseInt(dish_id),
          quantity: parseInt(quantity),
          price: parseInt(price),
          dish_name: dish_name
        };
      }) : []
    }));

    res.json({ success: true, data: ordersWithItems });
  });
});

app.put('/api/orders/:id/status', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Status updated' });
  });
});

// Statistics
app.get('/api/statistics', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  db.get('SELECT COUNT(*) as total_orders FROM orders', [], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get('SELECT COUNT(*) as total_products FROM dishes', [], (err, products) => {
      if (err) return res.status(500).json({ error: err.message });

      db.get('SELECT COUNT(*) as total_categories FROM categories', [], (err, categories) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get("SELECT SUM(total_amount) as revenue FROM orders WHERE status = 'Delivered'", [], (err, revenue) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            success: true,
            data: {
              total_orders: orders.total_orders,
              total_products: products.total_products,
              total_categories: categories.total_categories,
              total_revenue: revenue.revenue || 0
            }
          });
        });
      });
    });
  });
});

// CRUD for admin
app.post('/api/dishes', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { name, description, price, image_url, category_id } = req.body;
  db.run('INSERT INTO dishes (name, description, price, image_url, category_id) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, image_url, category_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Dish added' });
  });
});

app.put('/api/dishes/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { name, description, price, image_url, category_id } = req.body;
  db.run('UPDATE dishes SET name = ?, description = ?, price = ?, image_url = ?, category_id = ? WHERE id = ?',
    [name, description, price, image_url, category_id, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Dish updated' });
  });
});

app.delete('/api/dishes/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  db.run('DELETE FROM dishes WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Dish deleted' });
  });
});

app.post('/api/categories', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { name, description } = req.body;
  db.run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Category added' });
  });
});

app.put('/api/categories/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { name, description } = req.body;
  db.run('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Category updated' });
  });
});

app.delete('/api/categories/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Category deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});