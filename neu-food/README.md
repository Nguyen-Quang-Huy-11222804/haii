# NEU Food Delivery App

A modern food delivery application built with React, TypeScript, Vite, and Express.js with SQLite database.

## Features

- **User Authentication**: Register and login functionality
- **Product Catalog**: Browse dishes by categories
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout Process**: Complete order placement with delivery details
- **Admin Dashboard**: Manage categories, dishes, and orders
- **Order Management**: Track order status and history

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Express.js, SQLite3, JWT Authentication, bcryptjs
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd neu-food
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run server
```
The backend will run on http://localhost:3001

4. In a new terminal, start the frontend development server:
```bash
npm run dev
```
The frontend will run on http://localhost:5173

### Admin Access

- **Email**: admin@neu.edu.vn
- **Password**: admin123

### Sample User

You can register a new user or use the admin account to explore all features.

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Products
- `GET /api/dishes` - Get all dishes (with optional category filter)
- `GET /api/dishes/:id` - Get dish by ID

### Categories
- `GET /api/categories` - Get all categories

### Orders
- `POST /api/orders` - Place new order (authenticated)
- `GET /api/orders` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Admin CRUD
- `POST /api/dishes` - Add new dish (admin)
- `PUT /api/dishes/:id` - Update dish (admin)
- `DELETE /api/dishes/:id` - Delete dish (admin)
- `POST /api/categories` - Add new category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Statistics
- `GET /api/statistics` - Get dashboard statistics (admin only)

## Database Schema

The application uses SQLite with the following tables:
- `users` - User accounts
- `categories` - Product categories
- `dishes` - Food items
- `orders` - Order records
- `order_items` - Order line items

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features Overview

### For Customers
- Browse menu items by category
- Add items to cart
- View cart with quantity controls
- Secure checkout with delivery information
- Order history and status tracking

### For Admins
- Complete dashboard for managing the platform
- Add/edit/delete categories and dishes
- View and update order statuses
- Access to business statistics

## Security

- JWT-based authentication
- Password hashing with bcryptjs
- Protected admin routes
- CORS enabled for cross-origin requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
