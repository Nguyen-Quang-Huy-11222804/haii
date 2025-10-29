# Testing Guide for Order Management Fix

## Overview
This guide provides step-by-step instructions to test the CORS fix for order management functionality.

## Prerequisites
- Web server (Apache/Nginx) running with PHP 7.4+
- MySQL database server running
- Database `neu_food_db` created and initialized with `database_setup.sql`
- At least one user account created and promoted to admin role

## Setup Instructions

### 1. Database Setup
```sql
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS neu_food_db;

-- Import the schema
USE neu_food_db;
SOURCE /path/to/NEU-food-delivery/database_setup.sql;

-- Create a test user (if not already created)
-- Note: Password will be hashed when registering through the UI
```

### 2. Web Server Setup
- Place the `NEU-food-delivery` folder in your web server's document root
- Ensure PHP has `mysqli` extension enabled
- Verify `config.php` has correct database credentials

### 3. Create Admin User
1. Open `index.html` in a browser
2. Click "Đăng nhập/Đăng kí"
3. Register a new account
4. In MySQL, promote the user to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Test Cases

### Test 1: User Registration and Login
**Purpose:** Verify CORS headers work for authentication

**Steps:**
1. Open browser Developer Tools (F12)
2. Navigate to `auth.html`
3. Register a new account with:
   - Email: test@example.com
   - Full name: Test User
   - Password: testpass123
4. Login with the credentials

**Expected Results:**
- ✅ No CORS errors in console
- ✅ Successful registration message
- ✅ Successful login message
- ✅ Redirected to index.html
- ✅ User name appears in navigation bar

**Verify in Network Tab:**
- `register.php` request has proper CORS headers in response
- `login.php` request has proper CORS headers in response
- Session cookies are set and sent with subsequent requests

---

### Test 2: Session Check
**Purpose:** Verify session cookies are sent correctly

**Steps:**
1. After logging in, stay on `index.html`
2. Open Network tab in Developer Tools
3. Reload the page

**Expected Results:**
- ✅ `check_session.php` request is made
- ✅ Session cookie is sent with request (check Request Headers)
- ✅ Response has CORS headers including `Access-Control-Allow-Credentials: true`
- ✅ Response origin matches request origin (not wildcard `*`)
- ✅ User name still appears in navigation

---

### Test 3: Place an Order (CRITICAL TEST)
**Purpose:** Verify orders are saved to database

**Steps:**
1. Login as a regular user (not admin)
2. Browse products on `index.html`
3. Add 2-3 different products to cart
4. Click cart icon to verify items
5. Click "Thanh toán" button
6. On checkout page, fill in:
   - Họ và Tên: Nguyễn Văn Test
   - Số điện thoại: 0912345678
   - Khu vực: Tòa A1
   - Địa chỉ chi tiết: Phòng 401, Tầng 4
7. Keep payment method as "COD"
8. Click "XÁC NHẬN ĐẶT HÀNG"

**Expected Results:**
- ✅ Success modal appears: "ĐẶT HÀNG THÀNH CÔNG!"
- ✅ No CORS errors in console
- ✅ Cart badge shows 0 items
- ✅ Redirected to index.html after closing modal

**Verify in Network Tab:**
- `place_order.php` request:
  - Method: POST
  - Status: 200 OK
  - Request has `credentials: include`
  - Request Headers contain session cookie
  - Response Headers have:
    - `Access-Control-Allow-Origin: http://your-domain` (matches request origin)
    - `Access-Control-Allow-Credentials: true`
    - `Content-Type: application/json`
  - Response Body: `{"success": true, "message": "Đơn hàng của bạn..."}`

**Verify in Database:**
```sql
-- Check if order was saved
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
-- Should show the order with receiver_name = 'Nguyễn Văn Test'

-- Check if order items were saved
SELECT oi.*, d.name as dish_name 
FROM order_items oi 
LEFT JOIN dishes d ON oi.dish_id = d.id 
WHERE order_id = (SELECT MAX(id) FROM orders)
ORDER BY oi.id DESC;
-- Should show all items from the cart
```

---

### Test 4: Admin Order Management
**Purpose:** Verify orders appear in admin panel

**Steps:**
1. Logout from user account
2. Login with admin account
3. Navigate to `admin.html`
4. Click "Quản lý đơn hàng" in sidebar

**Expected Results:**
- ✅ All orders are displayed in a table
- ✅ The test order from Test 3 appears with:
  - Correct customer name
  - Correct phone number
  - Correct address
  - Status: "Pending"
  - Correct total amount
  - Timestamp of when it was created
- ✅ Can change order status using dropdown

**Verify Order Details:**
- Click on an order to view details (if feature exists)
- Verify all order items are listed correctly

---

### Test 5: Statistics Update
**Purpose:** Verify statistics reflect new orders

**Steps:**
1. In admin panel, click "Thống kê" in sidebar
2. Note the statistics displayed

**Expected Results:**
- ✅ "Tổng đơn hàng" shows correct count (should be >= 1)
- ✅ "Tổng sản phẩm" shows count of dishes in database
- ✅ "Tổng danh mục" shows count of categories
- ✅ "Doanh thu" shows 0 VNĐ (because order is "Pending", not "Delivered")

**Additional Test:**
1. Go back to "Quản lý đơn hàng"
2. Change an order status to "Delivered"
3. Return to "Thống kê"
4. Verify "Doanh thu" now includes the delivered order's total amount

---

### Test 6: Multiple Orders Flow
**Purpose:** Verify system handles multiple orders

**Steps:**
1. Logout and login as different users (or same user)
2. Place 3-5 orders with different:
   - Products
   - Quantities
   - Delivery addresses
3. Check admin panel

**Expected Results:**
- ✅ All orders appear in order management
- ✅ Orders are sorted by creation date (newest first)
- ✅ Each order has unique ID
- ✅ Statistics show correct total count
- ✅ No duplicate orders

---

### Test 7: Error Handling
**Purpose:** Verify proper error handling

**Test 7.1 - Not Logged In:**
1. Logout from all accounts
2. Add products to cart
3. Click "Thanh toán"
4. Try to submit order

**Expected:**
- ✅ Redirected to login page
- ✅ Message: "Vui lòng đăng nhập để đặt hàng"

**Test 7.2 - Empty Cart:**
1. Login
2. Clear cart (if any)
3. Navigate directly to `checkout.html`
4. Fill form and submit

**Expected:**
- ✅ Error message: "Giỏ hàng trống"

**Test 7.3 - Missing Information:**
1. Add products to cart
2. Go to checkout
3. Leave some fields empty
4. Try to submit

**Expected:**
- ✅ Browser validation prevents submission
- ✅ Error highlights on empty fields

---

## Debugging Failed Tests

### If CORS errors appear:
1. Check browser console for exact error message
2. Verify `HTTP_ORIGIN` header is being sent in request
3. Check response headers match request origin
4. Ensure server is not caching old responses

### If orders don't save:
1. Check browser Network tab for `place_order.php` response
2. Look for error message in response body
3. Check MySQL error log for database errors
4. Verify user is logged in (session cookie present)

### If session doesn't work:
1. Check if cookies are enabled in browser
2. Verify same-site cookie settings
3. Check if HTTPS is required (in production)
4. Clear browser cookies and re-login

## Expected Database State After All Tests

```sql
-- Should have multiple orders
SELECT COUNT(*) FROM orders;  -- Result: >= 5

-- Should have multiple order items
SELECT COUNT(*) FROM order_items;  -- Result: >= 10

-- Should have test user
SELECT * FROM users WHERE email LIKE '%test%';

-- Verify data integrity
SELECT o.id, o.receiver_name, COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;
-- All orders should have at least 1 item
```

## Success Criteria

All tests pass if:
- [x] No CORS errors in browser console
- [x] Users can login and session persists
- [x] Orders are successfully placed and saved to database
- [x] Orders appear in admin panel with correct details
- [x] Statistics update correctly
- [x] Order status can be changed
- [x] Revenue calculation works for delivered orders
- [x] Multiple orders are handled correctly

## Rollback Instructions

If the fix causes issues:

1. Checkout previous commit:
```bash
git checkout eb9fc3b
```

2. Restore database if needed:
```sql
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
```

3. Clear browser cache and cookies

## Next Steps After Testing

If all tests pass:
1. Merge the PR to main branch
2. Deploy to production (with production-specific CORS settings)
3. Monitor production logs for any issues
4. Consider adding automated tests for order flow

If tests fail:
1. Document the failing test case
2. Review error messages and logs
3. Check the ORDER_MANAGEMENT_FIX.md for troubleshooting
4. Report issues for further investigation
