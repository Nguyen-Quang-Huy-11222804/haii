<?php
require_once '../config.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET" || !isset($_GET['id'])) {
    respond(false, "Phương thức không hợp lệ hoặc thiếu ID.");
}

$id = (int)$_GET['id'];

$sql = "SELECT id, name, description, price, image_url, category_id FROM dishes WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $dish = $result->fetch_assoc();
    $dish['price'] = (int)$dish['price'];
    respond(true, "Tải sản phẩm thành công.", $dish);
} else {
    respond(false, "Không tìm thấy sản phẩm.");
}

$stmt->close();
$conn->close();
?>