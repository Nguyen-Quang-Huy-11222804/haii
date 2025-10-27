<?php
// BẮT ĐẦU PHIÊN (SESSION) ĐỂ QUẢN LÝ TRẠNG THÁI ĐĂNG NHẬP
session_start();

// --- THÔNG TIN KẾT NỐI DATABASE ---
// Mặc định XAMPP: DB_USERNAME = 'root', DB_PASSWORD = '' (rỗng)
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', ''); 
define('DB_NAME', 'neu_food_db');

// Kết nối đến Database MySQL
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Kiểm tra kết nối
if ($conn->connect_error) {
    http_response_code(500); // Internal Server Error
    die(json_encode(["success" => false, "message" => "Lỗi kết nối database: " . $conn->connect_error]));
}

// Thiết lập mã hóa cho kết nối
$conn->set_charset("utf8mb4");

// Hàm tiện ích để làm sạch dữ liệu đầu vào (ngăn chặn SQL Injection)
function sanitize_input($data) {
    global $conn;
    if (!is_array($data)) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        $data = $conn->real_escape_string($data);
    }
    return $data;
}

// Hàm tiện ích để trả về phản hồi JSON
function respond($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data]);
    exit();
}
?>
