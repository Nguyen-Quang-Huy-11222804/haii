<?php
// Bắt đầu bằng việc gọi file config.php
require_once '../config.php';

// Kiểm tra phương thức yêu cầu có phải GET không
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    respond(false, "Phương thức không hợp lệ.");
}

// Bắt đầu truy vấn
// LƯU Ý: Đảm bảo trường 'is_available' (có trong database_setup.sql) là TRUE
$sql = "SELECT id, name, price, image_url FROM dishes WHERE is_available = TRUE ORDER BY id ASC";
$result = $conn->query($sql);

if ($result) {
    $dishes = [];
    if ($result->num_rows > 0) {
        // Lấy từng hàng dữ liệu
        while($row = $result->fetch_assoc()) {
            // ********** ĐIỀU CHỈNH ĐƯỜNG DẪN ẢNH (TRÁNH 404 / DOUBLE PREFIX) **********
            // Nếu trong DB trường image_url đã chứa đường dẫn đầy đủ (http://, https://),
            // bắt đầu bằng '/' hoặc đã bắt đầu bằng 'images/', thì giữ nguyên.
            // Ngược lại, thêm tiền tố 'images/' (vì ảnh lưu trong thư mục root 'images/').
            $img = trim($row['image_url']);
            if (preg_match('/^(https?:\/\/|\/|images\/)/i', $img) || $img === '') {
                // dùng nguyên giá trị nếu đã là đường dẫn đầy đủ hoặc đã có tiền tố
                $row['image_url'] = $img;
            } else {
                $row['image_url'] = 'images/' . $img;
            }
            // *************************************************************************

            // Đảm bảo price là integer trước khi gửi đi
            $row['price'] = (int) $row['price'];
            $dishes[] = $row;
        }
        respond(true, "Tải món ăn thành công.", $dishes);
    } else {
        respond(false, "Không tìm thấy món ăn nào.", []);
    }
} else {
    // Lỗi truy vấn SQL
    respond(false, "Lỗi truy vấn SQL: " . $conn->error);
}

// Đóng kết nối
$conn->close();
?>
