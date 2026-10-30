<?php
// Dashboard — Enhanced productivity overview with due-date tracking, priority focus, and user-scoped stats
$page_title = 'Dashboard — TaskFlow';
$page_heading = 'Dashboard';
require_once __DIR__ . '/includes/header.php';

require_login();
$user = current_user();
$user_id = $user['id'];
$today_str = date('Y-m-d');

// Server-side statistics calculation for logged-in user
$stats = get_stats($pdo, $user_id);

// 1. Attention Required: Tasks Overdue or Due Today (Pending)
$stmt = $pdo->prepare('SELECT * FROM tasks WHERE user_id = ? AND due_date <= ? AND is_completed = 0 ORDER BY due_date ASC, created_at DESC');
$stmt->execute([$user_id, $today_str]);
$urgent_tasks = $stmt->fetchAll();

// 2. High Priority Focus (Pending)
$stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? AND priority = 'high' AND is_completed = 0 ORDER BY due_date ASC, created_at DESC LIMIT 5");
$stmt->execute([$user_id]);
$high_priority_tasks = $stmt->fetchAll();

// 3. Upcoming Tasks (Pending, due in future)
$stmt = $pdo->prepare('SELECT * FROM tasks WHERE user_id = ? AND due_date > ? AND is_completed = 0 ORDER BY due_date ASC LIMIT 5');
$stmt->execute([$user_id, $today_str]);
$upcoming_tasks = $stmt->fetchAll();

// 4. Recent Activity (Preview of latest 5 created)
$stmt = $pdo->prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 5');
$stmt->execute([$user_id]);
$recent_tasks = $stmt->fetchAll();
?>

<!-- Productivity Statistics Grid (6 Cards) -->
<div class="stat-grid">
    <div class="stat-card">
        <div class="stat-header">
            <span class="stat-label">Total Tasks</span>
            <div class="stat-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
        </div>
        <div class="stat-value"><?php echo e($stats['total']); ?></div>
        <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: <?php echo e($stats['rate']); ?>%;"></div>
        </div>
        <div class="stat-footer">
            <span><?php echo e($stats['rate']); ?>% completion rate</span>
        </div>
    </div>

    <div class="stat-card overdue">
        <div class="stat-header">
            <span class="stat-label">Overdue</span>
            <div class="stat-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </div>
        </div>
        <div class="stat-value"><?php echo e($stats['overdue']); ?></div>
        <div class="stat-footer">
            <span>Requires immediate action</span>
        </div>
    </div>

    <div class="stat-card due-today">
        <div class="stat-header">
            <span class="stat-label">Due Today</span>
            <div class="stat-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 14 16 14"></polyline>
                </svg>
            </div>
        </div>
        <div class="stat-value"><?php echo e($stats['due_today']); ?></div>
        <div class="stat-footer">
            <span>Scheduled for today</span>
        </div>
    </div>

    <div class="stat-card warning">
        <div class="stat-header">
            <span class="stat-label">High Priority</span>
            <div class="stat-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                </svg>
            </div>
        </div>
        <div class="stat-value"><?php echo e($stats['high_priority']); ?></div>
        <div class="stat-footer">
            <span>Urgent pending items</span>
        </div>
    </div>

    <div class="stat-card upcoming">
        <div class="stat-header">
            <span class="stat-label">Upcoming</span>
            <div class="stat-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            </div>
        </div>
        <div class="stat-value"><?php echo e($stats['upcoming']); ?></div>
        <div class="stat-footer">
            <span>Future scheduled tasks</span>
        </div>
    </div>

    <div class="stat-card success">
        <div class="stat-header">
            <span class="stat-label">Completed</span>
            <div class="stat-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        </div>
        <div class="stat-value"><?php echo e($stats['completed']); ?></div>
        <div class="stat-footer">
            <span>Successfully finished</span>
        </div>
    </div>
</div>

<!-- Section 1: Attention Required (Overdue & Due Today) -->
<div class="section-head">
    <div>
        <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Attention Required
            <?php if (count($urgent_tasks) > 0): ?>
                <span class="tag tag-overdue"><?php echo count($urgent_tasks); ?></span>
            <?php endif; ?>
        </h2>
        <p class="section-subtitle">Tasks overdue or due today needing urgent action</p>
    </div>
    <a href="<?php echo APP_URL; ?>/tasks.php?status=pending" class="btn btn-ghost btn-sm">View pending tasks &rarr;</a>
</div>

<?php if (empty($urgent_tasks)): ?>
    <div class="empty-state">
        <div class="empty-icon" style="color:var(--success);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
        <h3>All caught up!</h3>
        <p>No overdue tasks or items due today. Great job keeping your schedule on track.</p>
    </div>
<?php else: ?>
    <div class="task-list">
        <?php foreach ($urgent_tasks as $task):
            $p = priority_info($task['priority']);
            $d_status = due_date_status($task['due_date'], $task['is_completed']); ?>
            <div class="task-card <?php echo e($p['class']); ?> <?php echo ($d_status && $d_status['code'] === 'overdue') ? 'is-overdue' : ''; ?>">
                <div class="task-check-wrapper">
                    <input type="checkbox" class="task-check" disabled>
                </div>
                <div class="task-body">
                    <div class="task-title"><?php echo e($task['title']); ?></div>
                    <?php if (!empty($task['description'])): ?>
                        <div class="task-desc"><?php echo e($task['description']); ?></div>
                    <?php endif; ?>
                    <div class="task-meta">
                        <?php if ($d_status): ?>
                            <span class="tag <?php echo e($d_status['class']); ?>"><?php echo e($d_status['label']); ?></span>
                        <?php endif; ?>
                        <span class="tag <?php echo e($p['class']); ?>"><?php echo e($p['label']); ?></span>
                        <span class="tag category"><?php echo e($task['category']); ?></span>
                        <span class="tag due"><?php echo e(format_due_date($task['due_date'])); ?></span>
                    </div>
                </div>
                <div class="task-actions">
                    <a href="<?php echo APP_URL; ?>/edit-task.php?id=<?php echo e($task['id']); ?>" class="btn btn-ghost btn-sm">Edit</a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<!-- Section 2: High Priority Focus -->
<div class="section-head" style="margin-top:var(--space-4);">
    <div>
        <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            High Priority Focus
        </h2>
        <p class="section-subtitle">Urgent high-priority pending items</p>
    </div>
    <a href="<?php echo APP_URL; ?>/tasks.php?priority=high" class="btn btn-ghost btn-sm">View high priority &rarr;</a>
</div>

<?php if (empty($high_priority_tasks)): ?>
    <div class="empty-state">
        <div class="empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            </svg>
        </div>
        <h3>No high priority pending items</h3>
        <p>You have no urgent high-priority tasks pending right now.</p>
    </div>
<?php else: ?>
    <div class="task-list">
        <?php foreach ($high_priority_tasks as $task):
            $p = priority_info($task['priority']);
            $d_status = due_date_status($task['due_date'], $task['is_completed']); ?>
            <div class="task-card <?php echo e($p['class']); ?>">
                <div class="task-check-wrapper">
                    <input type="checkbox" class="task-check" disabled>
                </div>
                <div class="task-body">
                    <div class="task-title"><?php echo e($task['title']); ?></div>
                    <?php if (!empty($task['description'])): ?>
                        <div class="task-desc"><?php echo e($task['description']); ?></div>
                    <?php endif; ?>
                    <div class="task-meta">
                        <span class="tag priority-high">High</span>
                        <?php if ($d_status): ?>
                            <span class="tag <?php echo e($d_status['class']); ?>"><?php echo e($d_status['label']); ?></span>
                        <?php endif; ?>
                        <span class="tag category"><?php echo e($task['category']); ?></span>
                        <span class="tag due"><?php echo e(format_due_date($task['due_date'])); ?></span>
                    </div>
                </div>
                <div class="task-actions">
                    <a href="<?php echo APP_URL; ?>/edit-task.php?id=<?php echo e($task['id']); ?>" class="btn btn-ghost btn-sm">Edit</a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<!-- Section 3: Upcoming Schedule -->
<div class="section-head" style="margin-top:var(--space-4);">
    <div>
        <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Upcoming Schedule
        </h2>
        <p class="section-subtitle">Pending tasks scheduled for future dates</p>
    </div>
</div>

<?php if (empty($upcoming_tasks)): ?>
    <div class="empty-state">
        <div class="empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
        </div>
        <h3>No upcoming tasks</h3>
        <p>No future tasks scheduled yet. Add due dates when creating tasks to plan ahead.</p>
    </div>
<?php else: ?>
    <div class="task-list">
        <?php foreach ($upcoming_tasks as $task):
            $p = priority_info($task['priority']); ?>
            <div class="task-card <?php echo e($p['class']); ?>">
                <div class="task-check-wrapper">
                    <input type="checkbox" class="task-check" disabled>
                </div>
                <div class="task-body">
                    <div class="task-title"><?php echo e($task['title']); ?></div>
                    <?php if (!empty($task['description'])): ?>
                        <div class="task-desc"><?php echo e($task['description']); ?></div>
                    <?php endif; ?>
                    <div class="task-meta">
                        <span class="tag tag-upcoming">Upcoming</span>
                        <span class="tag <?php echo e($p['class']); ?>"><?php echo e($p['label']); ?></span>
                        <span class="tag category"><?php echo e($task['category']); ?></span>
                        <span class="tag due"><?php echo e(format_due_date($task['due_date'])); ?></span>
                    </div>
                </div>
                <div class="task-actions">
                    <a href="<?php echo APP_URL; ?>/edit-task.php?id=<?php echo e($task['id']); ?>" class="btn btn-ghost btn-sm">Edit</a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<!-- Section 4: Recent Activity -->
<div class="section-head" style="margin-top:var(--space-4);">
    <div>
        <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Recent Activity
        </h2>
        <p class="section-subtitle">Your 5 latest created tasks</p>
    </div>
    <a href="<?php echo APP_URL; ?>/tasks.php" class="btn btn-ghost btn-sm">View all tasks &rarr;</a>
</div>

<?php if (empty($recent_tasks)): ?>
    <div class="empty-state">
        <div class="empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            </svg>
        </div>
        <h3>No tasks yet</h3>
        <p>Your task list is empty. Add your first task to get started.</p>
        <a href="<?php echo APP_URL; ?>/add-task.php" class="btn btn-primary">+ Add First Task</a>
    </div>
<?php else: ?>
    <div class="task-list">
        <?php foreach ($recent_tasks as $task):
            $p = priority_info($task['priority']);
            $d_status = due_date_status($task['due_date'], $task['is_completed']); ?>
            <div class="task-card <?php echo e($p['class']); ?> <?php echo $task['is_completed'] ? 'completed' : ''; ?>">
                <div class="task-check-wrapper">
                    <input type="checkbox" class="task-check" disabled <?php echo $task['is_completed'] ? 'checked' : ''; ?>>
                </div>
                <div class="task-body">
                    <div class="task-title"><?php echo e($task['title']); ?></div>
                    <?php if (!empty($task['description'])): ?>
                        <div class="task-desc"><?php echo e($task['description']); ?></div>
                    <?php endif; ?>
                    <div class="task-meta">
                        <?php if ($task['is_completed']): ?>
                            <span class="tag completed-badge">Done</span>
                        <?php elseif ($d_status): ?>
                            <span class="tag <?php echo e($d_status['class']); ?>"><?php echo e($d_status['label']); ?></span>
                        <?php endif; ?>
                        <span class="tag <?php echo e($p['class']); ?>"><?php echo e($p['label']); ?></span>
                        <span class="tag category"><?php echo e($task['category']); ?></span>
                        <span class="tag due"><?php echo e(format_due_date($task['due_date'])); ?></span>
                    </div>
                </div>
                <div class="task-actions">
                    <a href="<?php echo APP_URL; ?>/edit-task.php?id=<?php echo e($task['id']); ?>" class="btn btn-ghost btn-sm">Edit</a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
