# Authentication & UX Improvements

## Changes Made (Addressing PR Comment)

### 1. User Authentication Display

**Before:**
- Header always showed "Đăng nhập/Đăng kí" link regardless of login status
- No way to know if user is logged in
- No logout option visible

**After:**
- When NOT logged in: Shows "Đăng nhập/Đăng kí" link
- When logged in: Shows user's name (e.g., "Nguyễn Văn A")
- Clicking user name shows logout confirmation modal
- User can logout from any page

### 2. Checkout Authentication Requirement

**Before:**
- Anyone could access checkout page
- Orders could be placed without login (guest checkout with user_id = 0)
- No authentication check

**After:**
- Clicking "Thanh toán" button checks if user is logged in
- If not logged in: Modal appears "Yêu cầu đăng nhập - Vui lòng đăng nhập để tiếp tục thanh toán"
- User is redirected to auth.html to login
- After login, user can proceed to checkout
- Checkout page also checks authentication on load
- place_order.php API requires valid session

### 3. Admin Panel Authentication

**Before:**
- checkAdminAuth() returned true without checking session
- Comment said "for simplicity, assume logged in"
- No real authentication

**After:**
- checkAdminAuth() calls check_session.php API
- Verifies user role is 'admin'
- Non-admin users redirected to auth.html
- Admin name shown in logout button

### 4. Form Pre-filling

**Before:**
- All checkout form fields empty
- User must type everything manually

**After:**
- User's full name automatically filled from session
- Saves time and reduces errors
- Phone and address still user-entered

## API Changes

### New: check_session.php
```php
// Returns current user session data
Response: {
  success: true/false,
  data: {
    id: 1,
    fullname: "Nguyễn Văn A",
    email: "user@example.com",
    role: "customer" or "admin"
  }
}
```

### Updated: place_order.php
```php
// Before: Allowed guest orders (user_id = 0)
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;

// After: Requires authentication
if (!isset($_SESSION['user_id']) || !$_SESSION['user_id']) {
    return 401 error;
}
```

## User Flow Diagrams

### Guest User Flow
```
1. Visit index.html
   ↓
2. Browse products (allowed)
   ↓
3. Add to cart (allowed, stored in localStorage)
   ↓
4. Click "Thanh toán"
   ↓
5. Modal: "Yêu cầu đăng nhập"
   ↓
6. Redirect to auth.html
   ↓
7. Login
   ↓
8. Redirect to index.html (name shown in header)
   ↓
9. Click "Thanh toán" again
   ↓
10. Success → Go to checkout.html
```

### Logged-in User Flow
```
1. Visit index.html
   ↓
2. Session checked automatically
   ↓
3. Header shows: "👤 [User Name]"
   ↓
4. Browse and add to cart
   ↓
5. Click "Thanh toán"
   ↓
6. Direct to checkout.html (no prompt)
   ↓
7. Form pre-filled with name
   ↓
8. Complete form and submit
   ↓
9. Order saved with actual user_id
```

### Admin Flow
```
1. Visit admin.html
   ↓
2. checkAdminAuth() called
   ↓
3. check_session.php verifies role='admin'
   ↓
4. If not admin → Redirect to auth.html
   ↓
5. If admin → Show dashboard
   ↓
6. Logout button shows: "Đăng xuất ([Admin Name])"
```

## Security Improvements

1. **No Guest Orders:** All orders now associated with authenticated users
2. **Session Validation:** Every protected action validates session server-side
3. **Role-Based Access:** Admin panel checks for admin role
4. **Credentials Included:** All fetch() calls include `credentials: 'include'`
5. **Server-Side Checks:** Authentication enforced in PHP, not just JavaScript

## Testing Checklist

- [ ] Guest user cannot checkout without login
- [ ] Modal appears when guest tries to checkout
- [ ] Login successful → Name appears in header
- [ ] Clicking name shows logout confirmation
- [ ] Logout works and returns to guest state
- [ ] Checkout form pre-fills user name
- [ ] Order saved with correct user_id
- [ ] Admin panel requires admin login
- [ ] Non-admin cannot access admin panel
- [ ] Admin name shown in logout button

## Browser Compatibility

All features work with:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires cookies enabled for session management.
