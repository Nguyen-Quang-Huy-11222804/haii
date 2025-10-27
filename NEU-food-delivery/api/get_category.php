<?php
require_once '../config.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET" || !isset($_GET['id'])) {
    respond(false, "Phương thức không hợp lệ hoặc thiếu ID.");
}

$id = (int)$_GET['id'];

$sql = "SELECT id, name, description FROM categories WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $category = $result->fetch_assoc();
    respond(true, "Tải danh mục thành công.", $category);
} else {
    respond(false, "Không tìm thấy danh mục.");
}

$stmt->close();
$conn->close();
?>