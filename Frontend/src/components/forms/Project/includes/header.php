<?php
// Shared header: opens the HTML document, sidebar, and main content area.
require_once __DIR__ . '/functions.php';

$current_page = basename($_SERVER['PHP_SELF']);
$is_auth_page = in_array($current_page, ['login.php', 'register.php'], true);
$user         = current_user();
$flash        = get_flash();

// Initials for avatar
$user_initials = 'TF';
if ($user && !empty($user['name'])) {
    $words = explode(' ', trim($user['name']));
    if (count($words) >= 2) {
        $user_initials = strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
    } else {
        $user_initials = strtoupper(substr($user['name'], 0, 2));
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? e($page_title) : APP_NAME; ?></title>
    <link rel="stylesheet" href="<?php echo APP_URL; ?>/assets/css/style.css">
</head>
<body>
<div class="app-layout">
    <?php if (!$is_auth_page): ?>
        <!-- Pure-CSS mobile menu toggle (no JavaScript) -->
        <input type="checkbox" id="navToggle" class="nav-toggle-input">
        <label for="navToggle" class="nav-overlay" aria-hidden="true"></label>

        <!-- Sidebar navigation -->
        <aside class="sidebar">
            <div class="sidebar-brand">
                <div class="brand-mark">TF</div>
                <div class="brand-name">
                    TaskFlow
                    <span class="brand-tag">PRO</span>
                </div>
            </div>
            <nav class="sidebar-nav">
                <a href="<?php echo APP_URL; ?>/index.php" class="nav-item <?php echo $current_page === 'index.php' ? 'active' : ''; ?>">
                    <span class="nav-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </span>
                    Dashboard
                </a>
                <a href="<?php echo APP_URL; ?>/tasks.php" class="nav-item <?php echo $current_page === 'tasks.php' ? 'active' : ''; ?>">
                    <span class="nav-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 11l3 3L22 4"></path>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </span>
                    My Tasks
                </a>
                <a href="<?php echo APP_URL; ?>/add-task.php" class="nav-item <?php echo $current_page === 'add-task.php' ? 'active' : ''; ?>">
                    <span class="nav-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                    </span>
                    Add Task
                </a>
            </nav>
            <div class="sidebar-footer">
                <?php if ($user): ?>
                    <div class="sidebar-user" style="margin-bottom:12px;">
                        <div class="user-avatar"><?php echo e($user_initials); ?></div>
                        <div class="user-info">
                            <span class="user-name"><?php echo e($user['name']); ?></span>
                            <span class="sidebar-note"><?php echo e($user['email']); ?></span>
                        </div>
                    </div>
                    <a href="<?php echo APP_URL; ?>/logout.php" class="btn btn-ghost btn-sm" style="width:100%; justify-content:flex-start; color:#f43f5e; border-color:rgba(244,63,94,0.3);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                    </a>
                <?php endif; ?>
            </div>
        </aside>
    <?php endif; ?>

    <!-- Main content -->
    <div class="main-area" <?php echo $is_auth_page ? 'style="margin-left:0;"' : ''; ?>>
        <header class="topbar">
            <div class="topbar-left">
                <?php if (!$is_auth_page): ?>
                    <label for="navToggle" class="nav-toggle-label" aria-label="Toggle navigation">&#9776;</label>
                <?php endif; ?>
                <h1 class="topbar-title"><?php echo isset($page_heading) ? e($page_heading) : ''; ?></h1>
            </div>
            <div class="topbar-right">
                <span class="date-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <?php echo date('D, M j, Y'); ?>
                </span>
                <?php if ($user && !$is_auth_page): ?>
                    <a href="<?php echo APP_URL; ?>/add-task.php" class="btn btn-primary btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Task
                    </a>
                <?php endif; ?>
            </div>
        </header>
        <main class="content">

        <?php if ($flash): ?>
            <div class="alert alert-<?php echo e($flash['type']); ?>">
                <span><?php echo e($flash['message']); ?></span>
            </div>
        <?php endif; ?>
