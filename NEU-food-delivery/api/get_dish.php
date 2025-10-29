<?php
require_once '../config.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET" || !isset($_GET['id'])) {
    respond(false, "Phương thức không hợp lệ hoặc thiếu ID.");
}

$id = (int)$_GET['id'];

$sql = "SELECT id, name, description, price, image_url, category_id FROM dishes WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->execute([$id]);
$dish = $stmt->fetch();

if ($dish) {
    $dish['price'] = (int)$dish['price'];
    respond(true, "Tải sản phẩm thành công.", $dish);
} else {
    respond(false, "Không tìm thấy sản phẩm.");
}

$conn = null;
?>