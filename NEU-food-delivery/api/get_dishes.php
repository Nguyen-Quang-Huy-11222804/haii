<?php
// Bắt đầu bằng việc gọi file config.php
require_once '../config.php';

// Kiểm tra phương thức yêu cầu có phải GET không
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    respond(false, "Phương thức không hợp lệ.");
}

// Lấy category_id nếu có (để lọc theo danh mục)
$category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;

// Bắt đầu truy vấn
$sql = "SELECT d.id, d.name, d.price, d.image_url, d.description, c.name as category_name
        FROM dishes d
        LEFT JOIN categories c ON d.category_id = c.id
        WHERE d.is_available = TRUE";

if ($category_id) {
    $sql .= " AND d.category_id = ?";
}

$sql .= " ORDER BY d.id ASC";

$stmt = $conn->prepare($sql);
if ($category_id) {
    $stmt->bind_param("i", $category_id);
}
$stmt->execute();
$result = $stmt->get_result();

if ($result) {
    $dishes = [];
    if ($result->num_rows > 0) {
        // Lấy từng hàng dữ liệu
        while($row = $result->fetch_assoc()) {
            // Điều chỉnh đường dẫn ảnh
            $img = trim($row['image_url']);
            if (preg_match('/^(https?:\/\/|\/|images\/)/i', $img) || $img === '') {
                $row['image_url'] = $img;
            } else {
                $row['image_url'] = 'images/' . $img;
            }

            $row['price'] = (int)$row['price'];
            $dishes[] = $row;
        }
        respond(true, "Tải món ăn thành công.", $dishes);
    } else {
        respond(false, "Không tìm thấy món ăn nào.", []);
    }
} else {
    respond(false, "Lỗi truy vấn SQL: " . $conn->error);
}

$stmt->close();
$conn->close();
?>
