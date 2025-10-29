<?php
require_once '../config.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(false, "Phương thức không hợp lệ.");
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['id'])) {
    respond(false, "Dữ liệu không hợp lệ.");
}

$id = (int)$data['id'];

$sql = "DELETE FROM categories WHERE id = ?";
$stmt = $conn->prepare($sql);
$result = $stmt->execute([$id]);

if ($result) {
    respond(true, "Xóa danh mục thành công.");
} else {
    respond(false, "Lỗi xóa danh mục.");
}

$conn = null;
?>