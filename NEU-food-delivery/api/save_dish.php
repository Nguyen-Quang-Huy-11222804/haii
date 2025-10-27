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
$price = (int)$data['price'];
$image_url = sanitize_input($data['image_url']);
$category_id = (int)$data['category_id'];

if (isset($data['id']) && $data['id']) {
    // Update
    $id = (int)$data['id'];
    $sql = "UPDATE dishes SET name = ?, description = ?, price = ?, image_url = ?, category_id = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssisii", $name, $description, $price, $image_url, $category_id, $id);
} else {
    // Insert
    $sql = "INSERT INTO dishes (name, description, price, image_url, category_id) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssisi", $name, $description, $price, $image_url, $category_id);
}

if ($stmt->execute()) {
    respond(true, "Lưu sản phẩm thành công.");
} else {
    respond(false, "Lỗi lưu sản phẩm: " . $stmt->error);
}

$stmt->close();
$conn->close();
?>