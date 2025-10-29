<?php
require_once '../config.php';

set_cors_headers();

session_destroy();
respond(true, "Đăng xuất thành công.");
?>