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
        WHERE d.is_available = 1";

$params = [];
if ($category_id) {
    $sql .= " AND d.category_id = ?";
    $params[] = $category_id;
}

$sql .= " ORDER BY d.id ASC";

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$result = $stmt->fetchAll();

if ($result) {
    $dishes = [];
    foreach($result as $row) {
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

$stmt->closeCursor();
$conn = null;
?>
