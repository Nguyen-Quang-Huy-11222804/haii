<?php
require_once '../config.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(false, "Phương thức không hợp lệ.");
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['order_id']) || !isset($data['status'])) {
    respond(false, "Dữ liệu không hợp lệ.");
}

$order_id = (int)$data['order_id'];
$status = sanitize_input($data['status']);

$allowed_statuses = ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'];
if (!in_array($status, $allowed_statuses)) {
    respond(false, "Trạng thái không hợp lệ.");
}

$sql = "UPDATE orders SET status = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$result = $stmt->execute([$status, $order_id]);

if ($result) {
    respond(true, "Cập nhật trạng thái thành công.");
} else {
    respond(false, "Lỗi cập nhật.");
}

$conn = null;
?>