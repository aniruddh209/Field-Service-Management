<?php
// Database connection using PDO (PHP Data Objects)
require_once __DIR__ . '/config.php';

function init_sqlite_schema(PDO $pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
            category TEXT DEFAULT 'general',
            due_date TEXT NULL,
            is_completed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    ");

    // Ensure user_id column exists if table was created with older schema
    $cols = $pdo->query("PRAGMA table_info(tasks)")->fetchAll(PDO::FETCH_ASSOC);
    $has_user_id = false;
    foreach ($cols as $col) {
        if ($col['name'] === 'user_id') {
            $has_user_id = true;
            break;
        }
    }
    if (!$has_user_id) {
        $pdo->exec("ALTER TABLE tasks ADD COLUMN user_id INTEGER NULL");
    }

    // Seed default demo user if table is empty
    $count = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($count === 0) {
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password) VALUES (1, ?, ?, ?)");
        $stmt->execute(['Demo User', 'demo@example.com', password_hash('password123', PASSWORD_DEFAULT)]);
        $pdo->exec("UPDATE tasks SET user_id = 1 WHERE user_id IS NULL");
    }
}

$pdo = null;

// Attempt MySQL connection if driver is 'mysql' or 'auto'
if (DB_DRIVER === 'mysql' || DB_DRIVER === 'auto') {
    try {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO(
            $dsn,
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 2,
            ]
        );
    } catch (PDOException $e) {
        if (DB_DRIVER === 'mysql') {
            error_log('Database connection error: ' . $e->getMessage());
            die('Database connection unavailable. Please ensure MySQL service is running.');
        }
        // In auto mode, fallback to SQLite
        $pdo = null;
    }
}

// Fallback to SQLite if MySQL is unavailable or driver is 'sqlite'
if (!$pdo && (DB_DRIVER === 'sqlite' || DB_DRIVER === 'auto')) {
    try {
        $pdo = new PDO('sqlite:' . DB_SQLITE_PATH, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec('PRAGMA foreign_keys = ON;');
        init_sqlite_schema($pdo);
    } catch (PDOException $e) {
        error_log('SQLite connection error: ' . $e->getMessage());
        die('Database connection unavailable. Please ensure write permissions exist for the config directory.');
    }
}

if (!$pdo) {
    die('Database connection unavailable. Please ensure MySQL service is running or SQLite is enabled.');
}
