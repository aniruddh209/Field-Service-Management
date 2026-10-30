<?php
// Register Page — Create a new TaskFlow user account
$page_title = 'Register — TaskFlow';
$page_heading = 'Create Account';
require_once __DIR__ . '/includes/functions.php';

// Redirect to dashboard if already logged in
if (is_logged_in()) {
    header('Location: ' . APP_URL . '/index.php');
    exit;
}

$error = '';
$name = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name             = trim($_POST['name'] ?? '');
    $email            = trim($_POST['email'] ?? '');
    $password         = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    // Server-side validation
    if ($name === '' || $email === '' || $password === '' || $confirm_password === '') {
        $error = 'All fields are required.';
    } elseif (mb_strlen($name) > 100) {
        $error = 'Name cannot exceed 100 characters.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } elseif (mb_strlen($email) > 150) {
        $error = 'Email address cannot exceed 150 characters.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } else {
        // Check for duplicate email
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = 'An account with this email already exists.';
        } else {
            // Hash password securely
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            try {
                $stmt = $pdo->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
                $stmt->execute([$name, $email, $hashed_password]);
                $user_id = $pdo->lastInsertId();

                // Prevent session fixation
                session_regenerate_id(true);

                // Initialize user session
                $_SESSION['user_id']    = $user_id;
                $_SESSION['user_name']  = $name;
                $_SESSION['user_email'] = $email;

                set_flash('success', 'Account created successfully. Welcome to TaskFlow!');
                header('Location: ' . APP_URL . '/index.php');
                exit;
            } catch (PDOException $e) {
                error_log('Registration error: ' . $e->getMessage());
                $error = 'Could not complete registration. Please try again.';
            }
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div style="max-width: 440px; margin: 40px auto 0;">
    <div class="section-head" style="text-align:center; display:block; margin-bottom:var(--space-3);">
        <h2 class="section-title" style="justify-content:center; font-size:24px;">Create your account</h2>
        <p class="section-subtitle">Get started with TaskFlow to organize your daily tasks</p>
    </div>

    <?php if ($error): ?>
        <div class="alert alert-error">
            <span><?php echo e($error); ?></span>
        </div>
    <?php endif; ?>

    <form method="post" class="form-card" style="max-width:100%;">
        <div class="form-group">
            <label class="form-label" for="name">Full Name <span style="color:var(--danger);">*</span></label>
            <input type="text" class="form-control" name="name" id="name" required maxlength="100"
                   value="<?php echo e($name); ?>" placeholder="e.g. Alex Johnson">
        </div>

        <div class="form-group">
            <label class="form-label" for="email">Email Address <span style="color:var(--danger);">*</span></label>
            <input type="email" class="form-control" name="email" id="email" required maxlength="150"
                   value="<?php echo e($email); ?>" placeholder="name@example.com">
        </div>

        <div class="form-group">
            <label class="form-label" for="password">Password <span style="color:var(--danger);">*</span></label>
            <input type="password" class="form-control" name="password" id="password" required minlength="6"
                   placeholder="At least 6 characters">
        </div>

        <div class="form-group">
            <label class="form-label" for="confirm_password">Confirm Password <span style="color:var(--danger);">*</span></label>
            <input type="password" class="form-control" name="confirm_password" id="confirm_password" required minlength="6"
                   placeholder="Re-enter password">
        </div>

        <div style="margin-top:var(--space-4);">
            <button type="submit" class="btn btn-primary" style="width:100%;">
                Create Account &rarr;
            </button>
        </div>

        <div style="text-align:center; margin-top:var(--space-3); font-size:14px; color:var(--text-muted);">
            Already have an account? 
            <a href="<?php echo APP_URL; ?>/login.php" style="color:var(--primary); font-weight:600;">Sign in here</a>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
