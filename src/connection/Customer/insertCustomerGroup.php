<?php
header("Content-Type: application/json; charset=utf-8");
include_once __DIR__ . '/../dbconfig.php';
include_once __DIR__ . '/../dbconnect.php';

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) $input = $_POST;

$name = trim($input['name'] ?? '');
$condition_id = isset($input['condition_id']) && $input['condition_id'] !== '' ? intval($input['condition_id']) : null;
$start_date = $input['start_date'] ?? null;
$end_date = $input['end_date'] ?? null;
$promotion_id = isset($input['promotion_id']) && $input['promotion_id'] !== '' ? intval($input['promotion_id']) : null;
$members = is_array($input['members']) ? $input['members'] : [];
$group_id = isset($input['group_id']) && $input['group_id'] ? intval($input['group_id']) : null;

$errors = [];
if ($name === '') $errors['name'] = 'ชื่อกลุ่มต้องไม่ว่าง';
if ($condition_id === null) $errors['condition_id'] = 'ต้องเลือกเงื่อนไข';
if (!$start_date) $errors['start_date'] = 'ต้องระบุวันที่เริ่ม';
if (!$end_date) $errors['end_date'] = 'ต้องระบุวันที่สิ้นสุด';
if (count($members) === 0) $errors['members'] = 'ต้องมีสมาชิกอย่างน้อย 1 รายการ';

if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    mysqli_begin_transaction($connection);

    if ($group_id) {
        // update
        $sql = "UPDATE customer_groups SET name = ?, condition_id = ?, start_date = ?, end_date = ?, promotion_id = ?, updated_at = NOW() WHERE id = ?";
        $stmt = mysqli_prepare($connection, $sql);
        mysqli_stmt_bind_param($stmt, "sissii", $name, $condition_id, $start_date, $end_date, $promotion_id, $group_id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    } else {
        // insert
        $sql = "INSERT INTO customer_groups (name, condition_id, start_date, end_date, created_by, created_at, updated_at, promotion_id)
                VALUES (?, ?, ?, ?, NULL, NOW(), NULL, ?)";
        $stmt = mysqli_prepare($connection, $sql);
        mysqli_stmt_bind_param($stmt, "ssssi", $name, $condition_id, $start_date, $end_date, $promotion_id);
        mysqli_stmt_execute($stmt);
        $group_id = mysqli_insert_id($connection);
        mysqli_stmt_close($stmt);
    }

    // delete old members and insert new members
    $del = mysqli_prepare($connection, "DELETE FROM customer_group_members WHERE group_id = ?");
    mysqli_stmt_bind_param($del, "i", $group_id);
    mysqli_stmt_execute($del);
    mysqli_stmt_close($del);

    if (count($members) > 0) {
        $ins = mysqli_prepare($connection, "INSERT INTO customer_group_members (group_id, customer_id, added_by, added_at, select_all) VALUES (?, ?, NULL, NOW(), ?)");
        foreach ($members as $m) {
            $cid = intval($m['customer_id'] ?? 0);
            $sel = isset($m['select_all']) ? intval($m['select_all']) : 0;
            if (!$cid) continue;
            mysqli_stmt_bind_param($ins, "iii", $group_id, $cid, $sel);
            mysqli_stmt_execute($ins);
        }
        mysqli_stmt_close($ins);
    }

    mysqli_commit($connection);

    echo json_encode(['success' => true, 'group_id' => $group_id, 'inserted_members' => count($members)]);
} catch (Exception $e) {
    mysqli_rollback($connection);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
mysqli_close($connection);
