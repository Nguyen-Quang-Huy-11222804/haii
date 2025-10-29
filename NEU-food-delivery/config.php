<?php
// BẮT ĐẦU PHIÊN (SESSION) ĐỂ QUẢN LÝ TRẠNG THÁI ĐĂNG NHẬP
session_start();

// --- THÔNG TIN KẾT NỐI DATABASE ---
// Using SQLite for simplicity (no installation needed)
$db_file = __DIR__ . '/neu_food.db';

// Kết nối đến Database SQLite
try {
    $conn = new PDO("sqlite:$db_file");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Lỗi kết nối database: " . $e->getMessage()]));
}

// Hàm thiết lập CORS headers cho phép credentials
function set_cors_headers() {
    // Lấy origin từ request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // Chỉ cho phép origin cụ thể khi credentials được sử dụng
    if ($origin) {
        header("Access-Control-Allow-Origin: $origin");
        // Cho phép gửi credentials (cookies, session) chỉ khi có origin cụ thể
        header('Access-Control-Allow-Credentials: true');
    } else {
        // Không có origin header - có thể là same-origin request
        // Không set Access-Control-Allow-Origin để cho phép same-origin requests
    }
    
    // Các headers được phép
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    
    // Các phương thức được phép
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    
    // Cache preflight request
    header('Access-Control-Max-Age: 86400');
}

// Hàm tiện ích để làm sạch dữ liệu đầu vào (ngăn chặn SQL Injection)
function sanitize_input($data) {
    global $conn;
    if (!is_array($data)) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        // For SQLite, use PDO quote
        $data = $conn->quote($data);
        // Remove the quotes added by quote()
        $data = substr($data, 1, -1);
    }
    return $data;
}

// Hàm tiện ích để trả về phản hồi JSON
function respond($success, $message, $data = null) {
    // Set CORS headers first
    set_cors_headers();
    header('Content-Type: application/json');
    // Use JSON_UNESCAPED_UNICODE for proper Vietnamese character display
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit();
}
?>
