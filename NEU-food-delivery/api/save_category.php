<?php
require_once '../config.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(false, "Phương thức không hợp lệ.");
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    respond(false, "Dữ liệu không hợp lệ.");
}

$name = sanitize_input($data['name']);
$description = sanitize_input($data['description']);

if (isset($data['id']) && $data['id']) {
    // Update
    $id = (int)$data['id'];
    $sql = "UPDATE categories SET name = ?, description = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([$name, $description, $id]);
} else {
    // Insert
    $sql = "INSERT INTO categories (name, description) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([$name, $description]);
}

if ($result) {
    respond(true, "Lưu danh mục thành công.");
} else {
    respond(false, "Lỗi lưu danh mục.");
}

$conn = null;
?>