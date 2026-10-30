<?php
// Edit Task — loads an existing task and updates it on submit (user-authorized, PRG pattern)
require_once __DIR__ . '/includes/functions.php';

require_login();
$user = current_user();
$user_id = $user['id'];

$error = '';

// Validate task ID parameter gracefully before headers sent
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id || $id <= 0) {
    set_flash('error', 'Invalid task ID provided.');
    header('Location: ' . APP_URL . '/tasks.php');
    exit;
}

// Load task and verify user ownership before headers sent
$stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $user_id]);
$task = $stmt->fetch();

if (!$task) {
    set_flash('error', 'Task not found or access denied.');
    header('Location: ' . APP_URL . '/tasks.php');
    exit;
}

// Handle form submission (update) before any HTML output
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title        = trim($_POST['title'] ?? '');
    $description  = trim($_POST['description'] ?? '');
    $priority     = $_POST['priority'] ?? 'medium';
    $category     = trim($_POST['category'] ?? 'general');
    $due_date     = trim($_POST['due_date'] ?? '');
    $is_completed = isset($_POST['is_completed']) ? 1 : 0;

    // Server-side validation
    if ($title === '') {
        $error = 'Task title is required.';
    } elseif (mb_strlen($title) > 200) {
        $error = 'Task title cannot exceed 200 characters.';
    } elseif (!in_array($priority, ['low', 'medium', 'high'], true)) {
        $error = 'Invalid priority level selected.';
    } elseif (mb_strlen($category) > 50) {
        $error = 'Category cannot exceed 50 characters.';
    } elseif ($due_date !== '' && !is_valid_date($due_date)) {
        $error = 'Invalid due date format.';
    } else {
        $due = ($due_date === '') ? null : $due_date;
        $category_val = ($category === '') ? 'general' : $category;

        try {
            $stmt = $pdo->prepare(
                'UPDATE tasks
                 SET title = ?, description = ?, priority = ?, category = ?, due_date = ?, is_completed = ?
                 WHERE id = ? AND user_id = ?'
            );
            $stmt->execute([$title, $description, $priority, $category_val, $due, $is_completed, $id, $user_id]);

            set_flash('success', 'Task updated successfully.');
            header('Location: ' . APP_URL . '/tasks.php');
            exit;
        } catch (PDOException $e) {
            error_log('Error updating task: ' . $e->getMessage());
            $error = 'Could not update the task. Please try again.';
        }
    }
}

$page_title = 'Edit Task — TaskFlow';
$page_heading = 'Edit Task';
require_once __DIR__ . '/includes/header.php';
?>

<div class="section-head" style="margin-bottom: var(--space-3);">
    <div>
        <h2 class="section-title">Edit Task #<?php echo e($task['id']); ?></h2>
        <p class="section-subtitle">Modify task properties, priority, status, or due date</p>
    </div>
</div>

<?php if ($error): ?>
    <div class="alert alert-error">
        <span><?php echo e($error); ?></span>
    </div>
<?php endif; ?>

<form method="post" class="form-card">
    <div class="form-group">
        <label class="form-label" for="title">Task Title <span style="color:var(--danger);">*</span></label>
        <input type="text" class="form-control" name="title" id="title" required maxlength="200"
               value="<?php echo e($_POST['title'] ?? $task['title']); ?>">
    </div>

    <div class="form-group">
        <label class="form-label" for="description">Description</label>
        <textarea class="form-control" name="description" id="description"><?php echo e($_POST['description'] ?? ($task['description'] ?? '')); ?></textarea>
    </div>

    <div class="form-row">
        <div class="form-group">
            <label class="form-label" for="priority">Priority Level</label>
            <?php $curr_priority = $_POST['priority'] ?? $task['priority']; ?>
            <select class="form-control" name="priority" id="priority">
                <option value="low" <?php echo $curr_priority === 'low' ? 'selected' : ''; ?>>Low Priority</option>
                <option value="medium" <?php echo $curr_priority === 'medium' ? 'selected' : ''; ?>>Medium Priority</option>
                <option value="high" <?php echo $curr_priority === 'high' ? 'selected' : ''; ?>>High Priority</option>
            </select>
        </div>

        <div class="form-group">
            <label class="form-label" for="category">Category</label>
            <input type="text" class="form-control" name="category" id="category" maxlength="50"
                   value="<?php echo e($_POST['category'] ?? $task['category']); ?>">
        </div>
    </div>

    <div class="form-row">
        <div class="form-group">
            <label class="form-label" for="due_date">Due Date</label>
            <input type="date" class="form-control" name="due_date" id="due_date"
                   value="<?php echo e($_POST['due_date'] ?? ($task['due_date'] ?? '')); ?>">
        </div>

        <div class="form-group">
            <label class="form-label" for="is_completed">Completion Status</label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 14px; background:var(--surface-alt); border:1px solid var(--border); border-radius:var(--radius-sm); cursor:pointer;">
                <?php $curr_completed = isset($_POST['is_completed']) ? 1 : $task['is_completed']; ?>
                <input type="checkbox" name="is_completed" id="is_completed" value="1" class="task-check"
                       <?php echo $curr_completed ? 'checked' : ''; ?>>
                <span style="font-size:14px; font-weight:600; color:var(--text-main);">Mark as completed</span>
            </label>
        </div>
    </div>

    <div class="form-actions">
        <button type="submit" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Update Task
        </button>
        <a href="<?php echo APP_URL; ?>/tasks.php" class="btn btn-ghost">Cancel</a>
    </div>
</form>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
