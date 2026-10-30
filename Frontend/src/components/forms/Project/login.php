<?php
// Login Page — Sign in to existing TaskFlow user account
$page_title = 'Login — TaskFlow';
$page_heading = 'Sign In';
require_once __DIR__ . '/includes/functions.php';

// Redirect to dashboard if already logged in
if (is_logged_in()) {
    header('Location: ' . APP_URL . '/index.php');
    exit;
}

$error = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email === '' || $password === '') {
        $error = 'Please enter your email address and password.';
    } else {
        $stmt = $pdo->prepare('SELECT id, name, email, password FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Prevent session fixation attacks
            session_regenerate_id(true);

            // Credentials valid — initialize session
            $_SESSION['user_id']    = $user['id'];
            $_SESSION['user_name']  = $user['name'];
            $_SESSION['user_email'] = $user['email'];

            set_flash('success', 'Welcome back, ' . $user['name'] . '!');
            header('Location: ' . APP_URL . '/index.php');
            exit;
        } else {
            $error = 'Invalid email address or password.';
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div style="max-width: 440px; margin: 40px auto 0;">
    <div class="section-head" style="text-align:center; display:block; margin-bottom:var(--space-3);">
        <h2 class="section-title" style="justify-content:center; font-size:24px;">Welcome back</h2>
        <p class="section-subtitle">Sign in to access your tasks and dashboard</p>
    </div>

    <?php if ($error): ?>
        <div class="alert alert-error">
            <span><?php echo e($error); ?></span>
        </div>
    <?php endif; ?>

    <form method="post" class="form-card" style="max-width:100%;">
        <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input type="email" class="form-control" name="email" id="email" required
                   value="<?php echo e($email); ?>" placeholder="name@example.com">
        </div>

        <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" class="form-control" name="password" id="password" required
                   placeholder="Enter your password">
        </div>

        <div style="margin-top:var(--space-4);">
            <button type="submit" class="btn btn-primary" style="width:100%;">
                Sign In &rarr;
            </button>
        </div>

        <div style="text-align:center; margin-top:var(--space-3); font-size:14px; color:var(--text-muted);">
            Don't have an account? 
            <a href="<?php echo APP_URL; ?>/register.php" style="color:var(--primary); font-weight:600;">Register here</a>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
