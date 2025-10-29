<?php
require_once '../config.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    respond(false, "Phương thức không hợp lệ.");
}

// Total orders
$sql_orders = "SELECT COUNT(*) as total FROM orders";
$result_orders = $conn->query($sql_orders);
$total_orders = $result_orders->fetch()['total'];

// Total products
$sql_products = "SELECT COUNT(*) as total FROM dishes";
$result_products = $conn->query($sql_products);
$total_products = $result_products->fetch()['total'];

// Total categories
$sql_categories = "SELECT COUNT(*) as total FROM categories";
$result_categories = $conn->query($sql_categories);
$total_categories = $result_categories->fetch()['total'];

// Total revenue
$sql_revenue = "SELECT SUM(total_amount) as total FROM orders WHERE status = 'Delivered'";
$result_revenue = $conn->query($sql_revenue);
$total_revenue = (int)$result_revenue->fetch()['total'];

$stats = [
    'total_orders' => (int)$total_orders,
    'total_products' => (int)$total_products,
    'total_categories' => (int)$total_categories,
    'total_revenue' => $total_revenue
];

respond(true, "Tải thống kê thành công.", $stats);

$conn = null;
?>