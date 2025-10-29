# Quick Start Guide - Testing the Fix (SQLite Version)

## Prerequisites Setup
1. **PHP installed** (version 7.4 or higher with PDO SQLite extension)
2. **Web server** running (Apache/Nginx built-in PHP server)
3. **Database**: SQLite (no installation needed - uses local file)

## Quick Test (5 minutes)

#### Step 1: Setup Database
```bash
# Run the setup script in browser:
http://localhost/NEU-food-delivery/setup.php
```
This will create `neu_food.db` with all tables and sample data.

#### Step 2: Test Main Site
```bash
# Open in browser:
http://localhost/NEU-food-delivery/index.html
```

1. Browse products (should load from SQLite database)
2. Click shopping bag icons to add items to cart
3. Click cart icon (top right) to view cart
4. Click "Thanh toán" button
5. Fill in the form:
   - Họ và Tên: Test User
   - Số điện thoại: 0912345678
   - Khu vực: Tòa A1
   - Địa chỉ chi tiết: Phòng 101
6. Click "XÁC NHẬN ĐẶT HÀNG"
7. ✅ Success modal should appear
8. ✅ Cart count should reset to 0

#### Step 3: Verify in Admin Panel
```bash
# Open in browser:
http://localhost/NEU-food-delivery/admin.html
```

1. Login with:
   - Email: `admin@neu.edu.vn`
   - Password: `admin123`
2. Navigate to "Quản lý đơn hàng" (should be default view)
3. ✅ Your order should appear with:
   - Customer name: Test User
   - Phone: 0912345678
   - Address: Tòa A1 - Phòng 101
   - Status: Pending
   - Correct total amount

#### Step 4: Check Statistics
1. In admin panel, click "Thống kê"
2. ✅ "Tổng đơn hàng" should show count >= 1
3. ✅ "Doanh thu" shows 0 VNĐ (order is pending)

#### Step 5: Test Revenue Calculation
1. Go back to "Quản lý đơn hàng"
2. Change order status to "Delivered"
3. Go to "Thống kê" again
4. ✅ "Doanh thu" now shows your order total

### Verify in Database (Optional)
```sql
-- Open phpMyAdmin or MySQL console
USE neu_food_db;

-- Check orders table
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- Check order items
SELECT oi.*, d.name as dish_name, d.price as current_price
FROM order_items oi
LEFT JOIN dishes d ON oi.dish_id = d.id
ORDER BY oi.id DESC LIMIT 10;

-- Check statistics
SELECT 
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'Delivered' THEN total_amount ELSE 0 END) as revenue,
    SUM(total_amount) as pending_revenue
FROM orders;
```

### What Changed (Code Comparison)

#### Before (checkout.html - old code)
```javascript
// OLD CODE (line ~209-246)
checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Only logged to console - NO API CALL!
    console.log("--- Đơn hàng mới ---");
    console.log("Tên: ", name);
    // ... more logging ...
    
    // Showed success modal without saving
    modalSuccess.classList.remove('hidden');
    modalSuccess.classList.add('flex');
    
    // Cleared cart but order NOT saved to database!
    localStorage.removeItem('cartItems');
});
```

#### After (main.js - new code)
```javascript
// NEW CODE (setupCheckoutForm function)
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!receiverName || !phoneNumber || !areaAddress || !detailAddress) {
        showModal('Không hợp lệ', 'Vui lòng điền đầy đủ thông tin.');
        return;
    }
    
    // Get cart from localStorage
    const cart = getCart();
    
    // Prepare order data
    const orderData = {
        receiver_name: receiverName,
        phone_number: phoneNumber,
        area_address: areaAddress,
        detail_address: detailAddress,
        payment_method: paymentMethod,
        cart_items: cart
    };
    
    // ACTUALLY CALL THE API!
    const response = await fetch(API_BASE_URL + 'place_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
        // Clear cart ONLY after successful save
        localStorage.removeItem('neu_food_cart');
        updateCartCount();
        // Show success modal
        modalSuccess.classList.add('flex');
    }
});
```

### Key Differences
| Aspect | Before | After |
|--------|--------|-------|
| API Call | ❌ None | ✅ POST to place_order.php |
| Database Save | ❌ No | ✅ Yes (transactions) |
| Cart Clear | ⚠️ Always | ✅ Only on success |
| Error Handling | ❌ None | ✅ Try-catch with user feedback |
| Validation | ⚠️ HTML only | ✅ HTML + JavaScript |
| Admin Visibility | ❌ No orders | ✅ All orders shown |
| Statistics | ❌ Always 0 | ✅ Accurate counts |

### Troubleshooting

#### Orders not appearing?
1. Check browser console for errors (F12)
2. Verify `place_order.php` is accessible: `http://localhost/NEU-food-delivery/api/place_order.php`
3. Check database connection in `config.php`
4. Ensure MySQL is running

#### Success modal appears but no order in database?
1. Check PHP error logs
2. Verify database credentials in `config.php`
3. Ensure `orders` and `order_items` tables exist
4. Check MySQL console for transaction errors

#### Cart not clearing?
1. Check browser localStorage (F12 → Application → Local Storage)
2. Verify the key is `neu_food_cart` (not `cartItems`)
3. Check for JavaScript errors in console

### Support
For detailed test cases, see `test_order_flow.md`
For technical details, see `IMPLEMENTATION_SUMMARY.md`
