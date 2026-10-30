<?php
// Add Task — form to create a new task (PRG pattern, user-bound)
require_once __DIR__ . '/includes/functions.php';

require_login();
$user = current_user();

$error = '';
$title       = '';
$description = '';
$priority    = 'medium';
$category    = 'general';
$due_date    = '';

// Handle form submission before any HTML output
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title       = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $priority    = $_POST['priority'] ?? 'medium';
    $category    = trim($_POST['category'] ?? 'general');
    $due_date    = trim($_POST['due_date'] ?? '');

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
                'INSERT INTO tasks (user_id, title, description, priority, category, due_date)
                 VALUES (?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([$user['id'], $title, $description, $priority, $category_val, $due]);

            // Post/Redirect/Get pattern prevents duplicate submission
            set_flash('success', 'Task "' . $title . '" created successfully.');
            header('Location: ' . APP_URL . '/tasks.php');
            exit;
        } catch (PDOException $e) {
            error_log('Error adding task: ' . $e->getMessage());
            $error = 'Could not save the task. Please try again.';
        }
    }
}

$page_title = 'Add Task — TaskFlow';
$page_heading = 'Add New Task';
require_once __DIR__ . '/includes/header.php';
?>

<div class="section-head" style="margin-bottom: var(--space-3);">
    <div>
        <h2 class="section-title">Create a Task</h2>
        <p class="section-subtitle">Fill in details below to add a new task to your workspace</p>
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
               value="<?php echo e($title); ?>" placeholder="e.g. Finish database assignment and submit slides">
    </div>

    <div class="form-group">
        <label class="form-label" for="description">Description</label>
        <textarea class="form-control" name="description" id="description"
                  placeholder="Optional details, notes, or sub-steps for this task..."><?php echo e($description); ?></textarea>
    </div>

    <div class="form-row">
        <div class="form-group">
            <label class="form-label" for="priority">Priority Level</label>
            <select class="form-control" name="priority" id="priority">
                <option value="low" <?php echo $priority === 'low' ? 'selected' : ''; ?>>Low Priority</option>
                <option value="medium" <?php echo $priority === 'medium' ? 'selected' : ''; ?>>Medium Priority</option>
                <option value="high" <?php echo $priority === 'high' ? 'selected' : ''; ?>>High Priority</option>
            </select>
        </div>

        <div class="form-group">
            <label class="form-label" for="category">Category</label>
            <input type="text" class="form-control" name="category" id="category" maxlength="50"
                   value="<?php echo e($category); ?>" placeholder="e.g. College, Personal, Work">
        </div>
    </div>

    <div class="form-group">
        <label class="form-label" for="due_date">Due Date</label>
        <input type="date" class="form-control" name="due_date" id="due_date" value="<?php echo e($due_date); ?>">
    </div>

    <div class="form-actions">
        <button type="submit" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Save Task
        </button>
        <a href="<?php echo APP_URL; ?>/tasks.php" class="btn btn-ghost">Cancel</a>
    </div>
</form>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
