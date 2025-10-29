<?php
require_once '../config.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET" || !isset($_GET['id'])) {
    respond(false, "Phương thức không hợp lệ hoặc thiếu ID.");
}

$id = (int)$_GET['id'];

$sql = "SELECT id, name, description FROM categories WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->execute([$id]);
$category = $stmt->fetch();

if ($category) {
    respond(true, "Tải danh mục thành công.", $category);
} else {
    respond(false, "Không tìm thấy danh mục.");
}

$conn = null;
?>