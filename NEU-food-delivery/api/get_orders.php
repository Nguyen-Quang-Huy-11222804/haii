<?php
require_once '../config.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    respond(false, "Phương thức không hợp lệ.");
}

$sql = "SELECT id, receiver_name, phone_number, delivery_address, total_amount, status, created_at FROM orders ORDER BY created_at DESC";
$result = $conn->query($sql);

if ($result) {
    $orders = [];
    foreach($result as $row) {
        $row['total_amount'] = (int)$row['total_amount'];
        $orders[] = $row;
    }
    respond(true, "Tải đơn hàng thành công.", $orders);
} else {
    respond(false, "Lỗi truy vấn: " . $conn->errorInfo()[2]);
}

$conn = null;
?>