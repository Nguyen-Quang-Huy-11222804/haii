<?php
require_once '../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    respond(true, "Người dùng đã đăng nhập.", [
        'id' => $_SESSION['user_id'],
        'fullname' => $_SESSION['user_fullname'],
        'email' => $_SESSION['user_email'],
        'role' => $_SESSION['user_role']
    ]);
} else {
    respond(false, "Người dùng chưa đăng nhập.");
}
?>
