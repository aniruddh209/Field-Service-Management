<?php
// Application configuration constants

// Database configuration
// DB_DRIVER: 'auto' (tries MySQL first; gracefully falls back to portable SQLite)
// Can be overridden via environment variables for deployment flexibility
define('DB_DRIVER', getenv('DB_DRIVER') ?: 'auto');
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'todo_app');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_SQLITE_PATH', __DIR__ . '/database.sqlite');

// Application settings
define('APP_NAME', 'TaskFlow');

// Dynamically compute base URL so it runs anywhere without hardcoded paths or ports
if (!defined('APP_URL')) {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
    define('APP_URL', $protocol . $host . $scriptDir);
}

// Secure Session Configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}
