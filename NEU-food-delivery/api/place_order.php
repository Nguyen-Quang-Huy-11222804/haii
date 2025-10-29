<?php
// Bắt đầu session và file cấu hình
require_once('../config.php');

// Thiết lập CORS headers
set_cors_headers();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, "Phương thức không hợp lệ.");
}

// --- 1. Lấy dữ liệu JSON từ request body (cách Front-end gửi giỏ hàng) ---
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// --- 2. Kiểm tra trạng thái đăng nhập ---
// Cho phép đặt hàng không cần đăng nhập (guest orders)
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

// --- 3. Kiểm tra dữ liệu bắt buộc ---
if (empty($data['receiver_name']) || empty($data['phone_number']) || empty($data['cart_items'])) {
    http_response_code(400);
    respond(false, "Dữ liệu đơn hàng không đầy đủ.");
}

$receiver_name = sanitize_input($data['receiver_name']);
$phone_number = sanitize_input($data['phone_number']);
$address = sanitize_input($data['area_address'] . ' - ' . $data['detail_address']);

$total_amount = 0;
// Tính tổng tiền chính xác từ giỏ hàng (giả định giá đã được gửi đúng)
foreach ($data['cart_items'] as $item) {
    $total_amount += (int)$item['price'] * (int)$item['quantity'];
}

// --- 4. Bắt đầu Giao dịch (Transaction) ---
$conn->beginTransaction();
$success = true;

try {
    // --- A. INSERT vào bảng orders ---
    $order_sql = "INSERT INTO orders (user_id, receiver_name, phone_number, delivery_address, total_amount, status) VALUES (?, ?, ?, ?, ?, 'Pending')";
    $stmt_order = $conn->prepare($order_sql);
    $stmt_order->execute([$user_id, $receiver_name, $phone_number, $address, $total_amount]);
    
    $order_id = $conn->lastInsertId();
    $stmt_order->closeCursor();
    
    // --- B. INSERT vào bảng order_items ---
    $item_sql = "INSERT INTO order_items (order_id, dish_id, quantity, price_at_time) VALUES (?, ?, ?, ?)";
    $stmt_item = $conn->prepare($item_sql);
    
    foreach ($data['cart_items'] as $item) {
        $dish_id = (int)$item['id'];
        $quantity = (int)$item['quantity'];
        $price_at_time = (int)$item['price']; // Lưu giá tại thời điểm đặt hàng
        
        $stmt_item->execute([$order_id, $dish_id, $quantity, $price_at_time]);
    }
    $stmt_item->closeCursor();
    
    // --- 5. Commit Giao dịch nếu mọi thứ thành công ---
    $conn->commit();
    
    // Note: We manually encode JSON here instead of using respond() because:
    // 1. We need JSON_UNESCAPED_UNICODE for Vietnamese characters
    // 2. We need to close the database connection after the response
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => true,
        "message" => "Đơn hàng của bạn đã được đặt thành công! Mã đơn hàng: #" . $order_id
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // --- 6. Rollback (Hủy) Giao dịch nếu có lỗi xảy ra ---
    $conn->rollBack();
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false, 
        "message" => "Đặt hàng thất bại: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conn = null;
?>
