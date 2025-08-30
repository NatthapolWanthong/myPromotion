<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>เข้าสู่ระบบ</title>
    <link href="/myPromotion/src/assets/css/font.css" rel="stylesheet">
    <link href="/myPromotion/src/assets/vendor/bootstrap/css/bootstrap.css" rel="stylesheet">
    <link href="./style.css" rel="stylesheet">
</head>

<body class="bg-light">

    <div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
        <div class="card shadow p-4" style="width: 100%; max-width: 400px;">
            <img src="/myPromotion/src/assets/images/inno-conslogo-02-1.png" class="mb-5">
            <h3 class="text-center mb-4">เข้าสู่ระบบ</h3>

            <?php if (isset($_GET['error'])): ?>
                <div class="alert alert-danger"><?= htmlspecialchars($_GET['error']) ?></div>
            <?php endif; ?>

            <form action="check_login.php" method="POST">
                <div class="mb-3">
                    <label for="username" class="form-label">ชื่อผู้ใช้</label>
                    <input type="text" class="form-control" id="username" name="username" required autofocus>
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">รหัสผ่าน</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                </div>

                <button type="submit" class="btn btn-primary w-100">เข้าสู่ระบบ</button>
            </form>
            <div class="text-center mt-3">
                <a href="register.php">ยังไม่มีบัญชี? สมัครสมาชิก</a>
            </div>
        </div>
    </div>

</body>

</html>