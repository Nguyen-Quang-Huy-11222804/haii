<?php
// Bắt đầu session và file cấu hình
require_once('../config.php');

// Thiết lập header và cho phép CORS với credentials
header('Content-Type: application/json');
set_cors_headers();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Phương thức không hợp lệ."]);
    $conn->close();
    exit();
}

// --- 1. Lấy dữ liệu JSON từ request body (cách Front-end gửi giỏ hàng) ---
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// --- 2. Kiểm tra trạng thái đăng nhập ---
// Yêu cầu người dùng phải đăng nhập để đặt hàng
if (!isset($_SESSION['user_id']) || !$_SESSION['user_id']) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Vui lòng đăng nhập để đặt hàng."]);
    $conn->close();
    exit();
}

$user_id = $_SESSION['user_id'];

// --- 3. Kiểm tra dữ liệu bắt buộc ---
if (empty($data['receiver_name']) || empty($data['phone_number']) || empty($data['cart_items'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Dữ liệu đơn hàng không đầy đủ."]);
    $conn->close();
    exit();
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
$conn->begin_transaction();
$success = true;

try {
    // --- A. INSERT vào bảng DonHang (orders) ---
    $order_sql = "INSERT INTO orders (user_id, receiver_name, phone_number, delivery_address, total_amount, status) VALUES (?, ?, ?, ?, ?, 'Pending')";
    $stmt_order = $conn->prepare($order_sql);
    $stmt_order->bind_param("isssi", $user_id, $receiver_name, $phone_number, $address, $total_amount);
    
    if (!$stmt_order->execute()) {
        throw new Exception("Lỗi khi tạo đơn hàng chính.");
    }
    
    $order_id = $conn->insert_id; // Lấy ID của đơn hàng vừa tạo
    $stmt_order->close();
    
    // --- B. INSERT vào bảng ChiTietDonHang (order_items) ---
    $item_sql = "INSERT INTO order_items (order_id, dish_id, quantity, price_at_time) VALUES (?, ?, ?, ?)";
    $stmt_item = $conn->prepare($item_sql);
    
    foreach ($data['cart_items'] as $item) {
        $dish_id = (int)$item['id'];
        $quantity = (int)$item['quantity'];
        $price_at_time = (int)$item['price']; // Lưu giá tại thời điểm đặt hàng
        
        $stmt_item->bind_param("iiis", $order_id, $dish_id, $quantity, $price_at_time);
        
        if (!$stmt_item->execute()) {
            throw new Exception("Lỗi khi thêm chi tiết món ăn.");
        }
    }
    $stmt_item->close();
    
    // --- 5. Commit Giao dịch nếu mọi thứ thành công ---
    $conn->commit();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Đơn hàng của bạn đã được đặt thành công! Mã đơn hàng: #" . $order_id
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // --- 6. Rollback (Hủy) Giao dịch nếu có lỗi xảy ra ---
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Đặt hàng thất bại: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>
