<?php
// Setup script for SQLite database
require_once 'config.php';

try {
    // Read and execute the SQL file
    $sql = file_get_contents('database_setup.sql');
    
    // Split into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $conn->exec($statement);
        }
    }
    
    echo "<h1>✅ Database setup completed successfully!</h1>";
    echo "<p>The neu_food.db file has been created with all tables and sample data.</p>";
    echo "<p>You can now access the application at: <a href='index.html'>index.html</a></p>";
    
} catch (Exception $e) {
    echo "<h1>❌ Database setup failed</h1>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
}

$conn = null;
?>