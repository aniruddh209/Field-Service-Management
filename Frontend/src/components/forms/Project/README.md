# TaskFlow — To-Do List Web Application

A modern productivity to-do web application built with **HTML5 + CSS3 + PHP + MySQL/SQLite** (no JavaScript, no heavy frameworks).

---

## How to Run

### Option 1: Standard PHP Built-in Server (Zero Setup)

Navigate to the project folder in any terminal or command prompt and run:
```bash
php -S localhost:8000 -t Project
```
Then open your browser and visit:
```
http://localhost:8000
```
- **Demo Account:** `demo@example.com` | Password: `password123`
- Or click **Register** to create a new user account.

---

### Option 2: XAMPP / Apache

1. Copy or place the `Project` folder into your XAMPP `htdocs` directory (e.g. `C:\xampp\htdocs\Project`).
2. Start **Apache** (and optionally **MySQL**) from the XAMPP Control Panel.
3. If using MySQL, import `Database/schema.sql` into phpMyAdmin.
4. Visit `http://localhost/Project/index.php` in your browser.

---

## Device-Independent Configuration

TaskFlow is configured to run on any machine without device-specific adjustments:
- **Automatic Fallback:** TaskFlow attempts to connect to MySQL (`localhost:3306`, user `root`). If MySQL is not running or not installed, it automatically and silently falls back to a portable SQLite database (`config/database.sqlite`).
- **Dynamic Base URL:** No hardcoded URLs, folders, or ports; `APP_URL` auto-detects host, protocol, and subdirectories dynamically.
- **Environment Overrides:** You can optionally configure database connection via environment variables (`DB_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`).

---

## Folder Structure

```
P07/
├── Database/
│   └── schema.sql        # MySQL database schema
└── Project/
    ├── config/
    │   ├── config.php    # App settings & dynamic base URL
    │   ├── database.php  # Dual-driver PDO connection (MySQL + SQLite)
    │   └── database.sqlite # Portable zero-config database
    ├── includes/
    │   ├── header.php    # Shared layout header, sidebar, topbar
    │   ├── footer.php    # Layout closure
    │   └── functions.php # Helpers, stats calculations, auth checks
    ├── assets/
    │   └── css/
    │       └── style.css # Pure CSS design system
    ├── index.php         # Dashboard (stats cards, priority & upcoming tasks)
    ├── tasks.php         # Task list (search, filters, sort, complete, delete)
    ├── add-task.php      # New task creation
    ├── edit-task.php     # Task editing
    ├── login.php         # User sign in
    ├── register.php      # User registration
    └── logout.php        # Session sign out
```
