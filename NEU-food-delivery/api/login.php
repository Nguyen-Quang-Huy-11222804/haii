<?php
// Bắt đầu bằng việc đưa vào file cấu hình
require_once('../config.php');

// Thiết lập header và cho phép CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

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

// --- 1. Kiểm tra tính hợp lệ cơ bản ---
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Vui lòng điền đầy đủ email và mật khẩu."]);
    $conn->close();
    exit();
}

// --- 2. Truy vấn Database để lấy thông tin người dùng và mật khẩu đã mã hóa ---
$sql = "SELECT id, fullname, email, password FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    $hashed_password = $user['password'];

    // --- 3. So sánh mật khẩu bằng password_verify ---
    if (password_verify($password, $hashed_password)) {
        
        // --- 4. Đăng nhập thành công: Lưu thông tin vào session ---
        // Xóa mật khẩu đã mã hóa khỏi mảng user trước khi lưu vào session
        unset($user['password']);
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_fullname'] = $user['fullname'];
        $_SESSION['loggedin'] = true;
        
        http_response_code(200);
        echo json_encode([
            "success" => true, 
            "message" => "Đăng nhập thành công!",
            "user" => [
                "id" => $user['id'],
                "fullname" => $user['fullname'],
                "email" => $user['email']
            ]
        ], JSON_UNESCAPED_UNICODE);
        
    } else {
        // Sai mật khẩu
        http_response_code(401); // Unauthorized
        echo json_encode(["success" => false, "message" => "Mật khẩu không chính xác."]);
    }
} else {
    // Không tìm thấy email
    http_response_code(401); // Unauthorized
    echo json_encode(["success" => false, "message" => "Email chưa được đăng kí hoặc không tồn tại."]);
}

$stmt->close();
$conn->close();
?>
