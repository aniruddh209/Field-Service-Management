<?php
// My Tasks — list all tasks with search, filtering, and sorting (hardened, PRG pattern)
require_once __DIR__ . '/includes/functions.php';

require_login();
$user = current_user();
$user_id = $user['id'];

// --- Handle actions (form posts) before any HTML headers output -----------------

// Toggle completion status (only for tasks owned by logged-in user)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['toggle_id'])) {
    $toggle_id = (int)$_POST['toggle_id'];
    if ($toggle_id > 0) {
        $stmt = $pdo->prepare('UPDATE tasks SET is_completed = 1 - is_completed WHERE id = ? AND user_id = ?');
        $stmt->execute([$toggle_id, $user_id]);

        if ($stmt->rowCount() > 0) {
            set_flash('success', 'Task status updated.');
        } else {
            set_flash('error', 'Action failed: Task not found or access denied.');
        }
    } else {
        set_flash('error', 'Action failed: Invalid task ID.');
    }
    
    $redirect_url = APP_URL . '/tasks.php' . (!empty($_POST['query_string']) ? '?' . $_POST['query_string'] : '');
    header('Location: ' . $redirect_url);
    exit;
}

// Delete a task (only for tasks owned by logged-in user)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    $delete_id = (int)$_POST['delete_id'];
    if ($delete_id > 0) {
        $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
        $stmt->execute([$delete_id, $user_id]);

        if ($stmt->rowCount() > 0) {
            set_flash('success', 'Task deleted successfully.');
        } else {
            set_flash('error', 'Action failed: Task not found or access denied.');
        }
    } else {
        set_flash('error', 'Action failed: Invalid task ID.');
    }
    
    $redirect_url = APP_URL . '/tasks.php' . (!empty($_POST['query_string']) ? '?' . $_POST['query_string'] : '');
    header('Location: ' . $redirect_url);
    exit;
}

// --- Read filter & search parameters (GET) ---------------------------------
$search          = mb_substr(trim($_GET['search'] ?? ''), 0, 100);
$filter_priority = $_GET['priority'] ?? 'all';
$filter_status   = $_GET['status'] ?? 'all';
$filter_category = $_GET['category'] ?? 'all';
$sort_by         = $_GET['sort'] ?? 'newest';

// Fetch distinct categories for the logged-in user's tasks
$categories_stmt = $pdo->prepare('SELECT DISTINCT category FROM tasks WHERE user_id = ? AND category IS NOT NULL AND category != "" ORDER BY category ASC');
$categories_stmt->execute([$user_id]);
$available_categories = $categories_stmt->fetchAll(PDO::FETCH_COLUMN);

// Build WHERE clauses and parameters safely (user_id is mandatory)
$where = ['user_id = ?'];
$params = [$user_id];

if ($search !== '') {
    $where[] = '(title LIKE ? OR description LIKE ?)';
    $params[] = '%' . $search . '%';
    $params[] = '%' . $search . '%';
}

$allowed_priorities = ['low', 'medium', 'high'];
if (in_array($filter_priority, $allowed_priorities, true)) {
    $where[] = 'priority = ?';
    $params[] = $filter_priority;
}

if ($filter_status === 'completed') {
    $where[] = 'is_completed = 1';
} elseif ($filter_status === 'pending') {
    $where[] = 'is_completed = 0';
}

if ($filter_category !== 'all' && $filter_category !== '') {
    $where[] = 'category = ?';
    $params[] = $filter_category;
}

// Order by whitelist mapping
$order_clause = match($sort_by) {
    'oldest'    => 'created_at ASC',
    'due_asc'   => 'due_date IS NULL ASC, due_date ASC, created_at DESC',
    'due_desc'  => 'due_date IS NULL ASC, due_date DESC, created_at DESC',
    'priority'  => 'CASE priority WHEN "high" THEN 1 WHEN "medium" THEN 2 WHEN "low" THEN 3 ELSE 4 END ASC, created_at DESC',
    default     => 'is_completed ASC, created_at DESC',
};

$sql = 'SELECT * FROM tasks WHERE ' . implode(' AND ', $where) . ' ORDER BY ' . $order_clause;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$tasks = $stmt->fetchAll();

// Preserve query string for action redirects
$current_query_string = e($_SERVER['QUERY_STRING'] ?? '');

$page_title = 'My Tasks — TaskFlow';
$page_heading = 'My Tasks';
require_once __DIR__ . '/includes/header.php';
?>

<!-- Advanced Search & Filter Toolbar -->
<form method="get" class="filter-card" style="display:flex; flex-direction:column; gap:var(--space-2);">
    <!-- Search Row -->
    <div style="display:flex; gap:var(--space-2); width:100%; flex-wrap:wrap;">
        <div class="form-group" style="margin:0; flex:2; min-width:240px;">
            <input type="text" class="form-control" name="search" id="search" maxlength="100"
                   value="<?php echo e($search); ?>" 
                   placeholder="Search by task title or description...">
        </div>
        <div class="form-group" style="margin:0; flex:1; min-width:160px;">
            <select class="form-control" name="sort" id="sort" aria-label="Sort Order">
                <option value="newest" <?php echo $sort_by === 'newest' ? 'selected' : ''; ?>>Sort: Newest First</option>
                <option value="oldest" <?php echo $sort_by === 'oldest' ? 'selected' : ''; ?>>Sort: Oldest First</option>
                <option value="due_asc" <?php echo $sort_by === 'due_asc' ? 'selected' : ''; ?>>Sort: Due Date (Earliest)</option>
                <option value="due_desc" <?php echo $sort_by === 'due_desc' ? 'selected' : ''; ?>>Sort: Due Date (Latest)</option>
                <option value="priority" <?php echo $sort_by === 'priority' ? 'selected' : ''; ?>>Sort: Highest Priority</option>
            </select>
        </div>
    </div>

    <!-- Filter Row -->
    <div style="display:flex; gap:var(--space-2); width:100%; flex-wrap:wrap; align-items:center;">
        <div class="form-group" style="margin:0; flex:1; min-width:140px;">
            <select class="form-control" name="priority" id="priority" aria-label="Priority Filter">
                <option value="all" <?php echo $filter_priority === 'all' ? 'selected' : ''; ?>>All Priorities</option>
                <option value="high" <?php echo $filter_priority === 'high' ? 'selected' : ''; ?>>High Priority</option>
                <option value="medium" <?php echo $filter_priority === 'medium' ? 'selected' : ''; ?>>Medium Priority</option>
                <option value="low" <?php echo $filter_priority === 'low' ? 'selected' : ''; ?>>Low Priority</option>
            </select>
        </div>

        <div class="form-group" style="margin:0; flex:1; min-width:140px;">
            <select class="form-control" name="status" id="status" aria-label="Status Filter">
                <option value="all" <?php echo $filter_status === 'all' ? 'selected' : ''; ?>>All Statuses</option>
                <option value="pending" <?php echo $filter_status === 'pending' ? 'selected' : ''; ?>>Pending</option>
                <option value="completed" <?php echo $filter_status === 'completed' ? 'selected' : ''; ?>>Completed</option>
            </select>
        </div>

        <div class="form-group" style="margin:0; flex:1; min-width:140px;">
            <select class="form-control" name="category" id="category" aria-label="Category Filter">
                <option value="all" <?php echo $filter_category === 'all' ? 'selected' : ''; ?>>All Categories</option>
                <?php foreach ($available_categories as $cat): ?>
                    <option value="<?php echo e($cat); ?>" <?php echo $filter_category === $cat ? 'selected' : ''; ?>>
                        <?php echo e(ucfirst($cat)); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div style="display:flex; gap:var(--space-1); margin-left:auto;">
            <button type="submit" class="btn btn-primary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Apply Filters
            </button>
            <a href="<?php echo APP_URL; ?>/tasks.php" class="btn btn-ghost btn-sm">Reset</a>
        </div>
    </div>
</form>

<div class="section-head">
    <div>
        <h2 class="section-title">
            Task Overview
            <span class="tag category" style="font-size:13px; font-weight:700;"><?php echo count($tasks); ?></span>
        </h2>
        <p class="section-subtitle">
            <?php if ($search !== '' || $filter_priority !== 'all' || $filter_status !== 'all' || $filter_category !== 'all'): ?>
                Showing filtered search results
            <?php else: ?>
                Manage, complete, and organize your daily work items
            <?php endif; ?>
        </p>
    </div>
    <a href="<?php echo APP_URL; ?>/add-task.php" class="btn btn-primary btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Task
    </a>
</div>

<?php if (empty($tasks)): ?>
    <div class="empty-state">
        <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
        </div>
        <h3>No matching tasks found</h3>
        <p>No tasks matched your search query or active filter criteria. Try adjusting or clearing your filters.</p>
        <a href="<?php echo APP_URL; ?>/tasks.php" class="btn btn-ghost btn-sm">Clear Filters</a>
        <a href="<?php echo APP_URL; ?>/add-task.php" class="btn btn-primary btn-sm">+ Add New Task</a>
    </div>
<?php else: ?>
    <div class="task-list">
        <?php foreach ($tasks as $task):
            $p = priority_info($task['priority']); ?>
            <div class="task-card <?php echo $p['class']; ?> <?php echo $task['is_completed'] ? 'completed' : ''; ?>">
                <!-- Toggle completion (POST to same page, pure HTML) -->
                <form method="post" style="display:inline-flex;">
                    <input type="hidden" name="toggle_id" value="<?php echo e($task['id']); ?>">
                    <input type="hidden" name="query_string" value="<?php echo $current_query_string; ?>">
                    <button type="submit" title="<?php echo $task['is_completed'] ? 'Mark incomplete' : 'Mark completed'; ?>" class="btn <?php echo $task['is_completed'] ? 'btn-ghost' : 'btn-success'; ?> btn-sm">
                        <?php if ($task['is_completed']): ?>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 4v6h6"></path>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                            </svg>
                            Undo
                        <?php else: ?>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Done
                        <?php endif; ?>
                    </button>
                </form>

                <div class="task-body">
                    <div class="task-title"><?php echo e($task['title']); ?></div>
                    <?php if (!empty($task['description'])): ?>
                        <div class="task-desc"><?php echo e($task['description']); ?></div>
                    <?php endif; ?>
                    <div class="task-meta">
                        <span class="tag <?php echo $p['class']; ?>"><?php echo e($p['label']); ?></span>
                        <span class="tag category">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                            <?php echo e($task['category']); ?>
                        </span>
                        <span class="tag due">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <?php echo e(format_due_date($task['due_date'])); ?>
                        </span>
                        <?php if ($task['is_completed']): ?>
                            <span class="tag completed-badge">Done</span>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="task-actions">
                    <a href="<?php echo APP_URL; ?>/edit-task.php?id=<?php echo e($task['id']); ?>" class="btn btn-ghost btn-sm">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </a>
                    <!-- Delete (POST to same page, pure HTML) -->
                    <form method="post" style="display:inline;">
                        <input type="hidden" name="delete_id" value="<?php echo e($task['id']); ?>">
                        <input type="hidden" name="query_string" value="<?php echo $current_query_string; ?>">
                        <button type="submit" class="btn btn-danger btn-sm">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                        </button>
                    </form>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
