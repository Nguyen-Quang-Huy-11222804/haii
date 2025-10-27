<?php
require_once '../config.php';

session_destroy();
respond(true, "Đăng xuất thành công.");
?>