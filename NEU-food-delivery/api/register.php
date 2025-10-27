<?php
// Bắt đầu bằng việc đưa vào file cấu hình
// File này sẽ tạo biến $conn (kết nối database) và bắt đầu session
require_once('../config.php');

// Thiết lập header và cho phép CORS (quan trọng khi chạy Front-end từ trình duyệt)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cho phép Front-end gọi từ localhost

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Phương thức không hợp lệ."]);
    $conn->close();
    exit();
}

// Lấy dữ liệu từ Front-end
$email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : ''; // Mật khẩu chưa sanitize
$fullname = isset($_POST['fullname']) ? sanitize_input($_POST['fullname']) : '';

// --- 1. Kiểm tra tính hợp lệ cơ bản ---
if (empty($email) || empty($password) || empty($fullname)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Vui lòng điền đầy đủ thông tin đăng kí."]);
    $conn->close();
    exit();
}

// --- 2. Kiểm tra Email đã tồn tại chưa ---
$check_sql = "SELECT id FROM users WHERE email = ?";
$stmt = $conn->prepare($check_sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(["success" => false, "message" => "Email này đã được đăng kí. Vui lòng sử dụng email khác."]);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

// --- 3. Mã hóa mật khẩu và Thực hiện INSERT ---
// Mã hóa mật khẩu trước khi lưu vào database
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$insert_sql = "INSERT INTO users (email, fullname, password) VALUES (?, ?, ?)";
$stmt = $conn->prepare($insert_sql);
$stmt->bind_param("sss", $email, $fullname, $hashed_password);

if ($stmt->execute()) {
    // --- 4. Trả về JSON thành công ---
    http_response_code(201); // Created
    echo json_encode(["success" => true, "message" => "Đăng kí thành công! Bạn có thể đăng nhập ngay bây giờ."]);
} else {
    // Lỗi khi thực hiện query
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi hệ thống: Không thể đăng kí. Vui lòng thử lại."]);
}

$stmt->close();
$conn->close();
?>
