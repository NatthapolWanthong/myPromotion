<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>สมัครสมาชิก</title>
    <link href="/myPromotion/src/assets/css/font.css" rel="stylesheet">
    <link href="/myPromotion/src/assets/vendor/bootstrap/css/bootstrap.css" rel="stylesheet">
    <link href="./style.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
  <div class="card shadow p-4" style="width: 100%; max-width: 400px;">
    <h3 class="text-center mb-4">สมัครสมาชิก</h3>

    <?php if (isset($_GET['error'])): ?>
      <div class="alert alert-danger"><?= htmlspecialchars($_GET['error']) ?></div>
    <?php elseif (isset($_GET['success'])): ?>
      <div class="alert alert-success">สมัครสมาชิกสำเร็จ! 🎉 <a href="login.php">เข้าสู่ระบบ</a></div>
    <?php endif; ?>

    <form action="register_process.php" method="POST">
      <div class="mb-3">
        <label for="username" class="form-label">ชื่อผู้ใช้</label>
        <input type="text" class="form-control" id="username" name="username" required>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">รหัสผ่าน</label>
        <input type="password" class="form-control" id="password" name="password" required>
      </div>

      <div class="mb-3">
        <label for="confirm" class="form-label">ยืนยันรหัสผ่าน</label>
        <input type="password" class="form-control" id="confirm" name="confirm" required>
      </div>

      <button type="submit" class="btn btn-success w-100">สมัครสมาชิก</button>
      <div class="text-center mt-3">
        <a href="login.php">มีบัญชีแล้ว? เข้าสู่ระบบ</a>
      </div>
    </form>
  </div>
</div>

</body>
</html>
