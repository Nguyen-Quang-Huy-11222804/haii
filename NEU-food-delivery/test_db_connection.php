<?php
// Bắt đầu bằng việc gọi file config.php
// File config.php sẽ cố gắng tạo biến $conn
require_once 'config.php';

// Sau khi gọi config.php, kiểm tra biến $conn
if ($conn && $conn->connect_error) {
    // Nếu có lỗi kết nối (rất ít khi xảy ra nếu đã pass Bước 1)
    echo "<h1>❌ Lỗi kết nối Database</h1>";
    echo "<p>Chi tiết: " . $conn->connect_error . "</p>";
} else if ($conn) {
    // Nếu biến $conn tồn tại và không có lỗi
    echo "<h1>✅ KẾT NỐI DATABASE THÀNH CÔNG!</h1>";
    echo "<p>Đã kết nối với Database: <strong>" . DB_NAME . "</strong></p>";
    echo "<p>Bạn có thể xóa file này sau khi kiểm tra xong.</p>";
    $conn->close(); // Đóng kết nối
} else {
    // Trường hợp xấu nhất, file config.php bị lỗi cú pháp và không tạo được biến $conn
    echo "<h1>⚠️ LỖI CÚ PHÁP TRONG config.php</h1>";
    echo "<p>Vui lòng kiểm tra lại file config.php.</p>";
}
?>

