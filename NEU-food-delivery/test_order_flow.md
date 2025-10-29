# Test Plan for Order Management Fix

## Overview
This document outlines the manual testing steps to verify that orders are properly saved and displayed in the admin panel.

## Data Flow
```
Customer Side (index.html):
1. User adds products to cart → Stored in localStorage as 'neu_food_cart'
   Cart item structure: { id, name, price, img, quantity }

2. User clicks "Thanh toán" → Redirected to checkout.html

Checkout (checkout.html + main.js):
3. User fills form → setupCheckoutForm() captures data
4. On submit → Calls fetch(API_BASE_URL + 'place_order.php', {...})
5. Sends JSON: { receiver_name, phone_number, area_address, detail_address, payment_method, cart_items[] }

Backend (place_order.php):
6. Receives JSON data
7. Creates transaction
8. Inserts into 'orders' table
9. Inserts items into 'order_items' table
10. Commits transaction
11. Returns success response

Admin Side (admin.html + admin.js):
12. loadOrders() → Calls get_orders.php → Displays all orders
13. loadStatistics() → Calls get_statistics.php → Shows counts and revenue
```

## Prerequisites
1. Web server (Apache/Nginx) running with PHP
2. MySQL database with `neu_food_db` created and tables initialized
3. Sample products and categories in the database

## Test Cases

### Test Case 1: Place an Order
**Steps:**
1. Navigate to `index.html`
2. Browse products
3. Add at least 2 different products to cart
4. Click "Thanh toán" button
5. Fill in checkout form:
   - Name: "Nguyễn Văn Test"
   - Phone: "0912345678"
   - Area: "Tòa A1"
   - Detail Address: "Phòng 401"
6. Submit the order

**Expected Result:**
- Success modal appears showing "ĐẶT HÀNG THÀNH CÔNG!"
- Cart is cleared (badge shows 0)
- Console shows order data being sent
- No JavaScript errors in console

### Test Case 2: Verify Order in Admin Panel
**Steps:**
1. Navigate to `admin.html`
2. Login (if required)
3. Go to "Quản lý đơn hàng" section

**Expected Result:**
- The order from Test Case 1 appears in the orders list
- Order shows:
  - Customer name: "Nguyễn Văn Test"
  - Phone: "0912345678"
  - Address: "Tòa A1 - Phòng 401"
  - Status: "Pending"
  - Correct total amount

### Test Case 3: Verify Statistics
**Steps:**
1. In admin panel, navigate to "Thống kê" section

**Expected Result:**
- "Tổng đơn hàng" shows count >= 1 (exact number of orders placed)
- "Tổng sản phẩm" shows correct count of dishes in database
- "Tổng danh mục" shows correct count of categories in database
- "Doanh thu" shows 0 VNĐ (since order is "Pending", not "Delivered")
- All numbers display correctly formatted with Vietnamese currency format

### Test Case 4: Update Order Status and Verify Revenue
**Steps:**
1. In "Quản lý đơn hàng", change order status to "Delivered"
2. Navigate to "Thống kê" section

**Expected Result:**
- "Doanh thu" now shows the total amount from delivered orders
- Statistics update correctly

### Test Case 5: Multiple Orders
**Steps:**
1. Place 2-3 more orders following Test Case 1
2. Check admin panel

**Expected Result:**
- All orders appear in chronological order (newest first)
- Each order has correct details
- Statistics reflect the correct total count

### Test Case 6: Guest Checkout (No Login)
**Steps:**
1. Ensure you are NOT logged in (clear session/cookies)
2. Add products to cart
3. Proceed to checkout
4. Fill in delivery information
5. Submit order

**Expected Result:**
- Order is placed successfully even without login
- Order in database has user_id = 0 (guest order)
- Order appears in admin panel with all correct details
- System handles guest orders properly

## Database Validation

Run these SQL queries to verify data integrity:

```sql
-- Check if orders were saved
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- Check if order items were saved (handles deleted dishes)
SELECT oi.*, COALESCE(d.name, '[Dish Deleted]') as dish_name
FROM order_items oi 
LEFT JOIN dishes d ON oi.dish_id = d.id 
ORDER BY oi.id DESC 
LIMIT 10;

-- Verify statistics
SELECT 
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'Delivered' THEN total_amount ELSE 0 END) as revenue
FROM orders;
```

## Known Issues Fixed
1. ✅ Orders not appearing in admin panel - FIXED
2. ✅ Statistics showing 0 orders - FIXED
3. ✅ Revenue not calculated - FIXED (only for Delivered orders)

## Notes
- The system correctly stores orders with user_id = 0 for guest checkouts
- CORS headers are properly set for API calls
- Order items are saved in a separate table with proper foreign keys
- Transaction handling ensures data integrity
