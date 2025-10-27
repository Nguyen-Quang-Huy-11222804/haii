<?php
// Bắt đầu bằng việc gọi file config.php
require_once '../config.php';

// Kiểm tra phương thức yêu cầu có phải GET không
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    respond(false, "Phương thức không hợp lệ.");
}

// Truy vấn lấy danh mục
$sql = "SELECT id, name, description FROM categories WHERE is_active = TRUE ORDER BY id ASC";
$result = $conn->query($sql);

if ($result) {
    $categories = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }
        respond(true, "Tải danh mục thành công.", $categories);
    } else {
        respond(false, "Không tìm thấy danh mục nào.", []);
    }
} else {
    respond(false, "Lỗi truy vấn SQL: " . $conn->error);
}

$conn->close();
?>