<?php
// Helper functions used across pages
require_once __DIR__ . '/../config/database.php';

// HTML Output Escaping (XSS Prevention)
function e($value) {
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

// Session Flash Messaging (PRG Pattern)
function set_flash($type, $message) {
    $_SESSION['flash'] = [
        'type' => $type, // 'success' or 'error'
        'message' => $message
    ];
}

function get_flash() {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

// Validate YYYY-MM-DD Date
function is_valid_date($date) {
    if (empty($date)) return true; // Null/empty due date is valid
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

// Authentication helper functions
function is_logged_in() {
    return isset($_SESSION['user_id']) && (int)$_SESSION['user_id'] > 0;
}

function require_login() {
    if (!is_logged_in()) {
        header('Location: ' . APP_URL . '/login.php');
        exit;
    }
}

function current_user() {
    if (!is_logged_in()) {
        return null;
    }
    return [
        'id'    => $_SESSION['user_id'],
        'name'  => $_SESSION['user_name'] ?? 'User',
        'email' => $_SESSION['user_email'] ?? '',
    ];
}

// Return a human-friendly label and CSS class for a priority value
function priority_info($priority) {
    switch ($priority) {
        case 'high':
            return ['label' => 'High', 'class' => 'priority-high'];
        case 'low':
            return ['label' => 'Low', 'class' => 'priority-low'];
        default:
            return ['label' => 'Medium', 'class' => 'priority-medium'];
    }
}

// Return status badge information based on due date and completion state
function due_date_status($date, $is_completed) {
    if (empty($date) || $is_completed) {
        return null;
    }

    $today_str = date('Y-m-d');
    $due_str   = date('Y-m-d', strtotime($date));

    if ($due_str < $today_str) {
        return ['label' => 'Overdue', 'class' => 'tag-overdue', 'code' => 'overdue'];
    } elseif ($due_str === $today_str) {
        return ['label' => 'Due Today', 'class' => 'tag-due-today', 'code' => 'due_today'];
    } else {
        return ['label' => 'Upcoming', 'class' => 'tag-upcoming', 'code' => 'upcoming'];
    }
}

// Format a due date for display; returns "No due date" when empty
function format_due_date($date) {
    if (empty($date)) return 'No due date';
    $ts = strtotime($date);
    return date('M j, Y', $ts);
}

// Fetch dashboard statistics from the database for the logged-in user
function get_stats($pdo, $user_id) {
    $today_str = date('Y-m-d');

    $stats = [
        'total'         => 0,
        'completed'     => 0,
        'pending'       => 0,
        'high_priority' => 0,
        'due_today'     => 0,
        'overdue'       => 0,
        'upcoming'      => 0,
        'rate'          => 0,
    ];

    // Total tasks
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $stats['total'] = (int) $stmt->fetchColumn();

    // Completed tasks
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE user_id = ? AND is_completed = 1');
    $stmt->execute([$user_id]);
    $stats['completed'] = (int) $stmt->fetchColumn();

    $stats['pending'] = $stats['total'] - $stats['completed'];
    $stats['rate']    = ($stats['total'] > 0) ? round(($stats['completed'] / $stats['total']) * 100) : 0;

    // High priority pending tasks
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tasks WHERE user_id = ? AND priority = 'high' AND is_completed = 0");
    $stmt->execute([$user_id]);
    $stats['high_priority'] = (int) $stmt->fetchColumn();

    // Tasks due today (pending)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date = ? AND is_completed = 0");
    $stmt->execute([$user_id, $today_str]);
    $stats['due_today'] = (int) $stmt->fetchColumn();

    // Overdue tasks (pending)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date < ? AND is_completed = 0");
    $stmt->execute([$user_id, $today_str]);
    $stats['overdue'] = (int) $stmt->fetchColumn();

    // Upcoming tasks (pending)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date > ? AND is_completed = 0");
    $stmt->execute([$user_id, $today_str]);
    $stats['upcoming'] = (int) $stmt->fetchColumn();

    return $stats;
}
