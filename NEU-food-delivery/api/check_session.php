<?php
require_once '../config.php';

set_cors_headers();

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
