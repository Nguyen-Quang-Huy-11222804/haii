<?php
// Bắt đầu bằng việc đưa vào file cấu hình
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
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "message" => "Phương thức không hợp lệ."]);
    $conn->close();
    exit();
}

// Lấy dữ liệu từ Front-end
$email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : ''; // Mật khẩu chưa sanitize

// --- 1. Kiểm tra tính hợp lệ cơ bản ---
if (empty($email) || empty($password)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "message" => "Vui lòng điền đầy đủ email và mật khẩu."]);
    exit();
}

// --- 2. Truy vấn Database để lấy thông tin người dùng ---
$sql = "SELECT id, fullname, email, password, role FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    $stored_password = $user['password'];

    // --- 3. So sánh mật khẩu (plain text for local testing) ---
    if ($password === $stored_password) {
        
        // --- 4. Đăng nhập thành công: Lưu thông tin vào session ---
        // Xóa mật khẩu khỏi mảng user trước khi lưu vào session
        unset($user['password']);
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_fullname'] = $user['fullname'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['loggedin'] = true;
        
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => true, 
            "message" => "Đăng nhập thành công!",
            "user" => [
                "id" => $user['id'],
                "fullname" => $user['fullname'],
                "email" => $user['email'],
                "role" => $user['role']
            ]
        ], JSON_UNESCAPED_UNICODE);
        
    } else {
        // Sai mật khẩu
        http_response_code(401); // Unauthorized
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "message" => "Mật khẩu không chính xác."]);
    }
} else {
    // Không tìm thấy email
    http_response_code(401); // Unauthorized
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "message" => "Email chưa được đăng kí hoặc không tồn tại."]);
}

$conn = null;
?>
