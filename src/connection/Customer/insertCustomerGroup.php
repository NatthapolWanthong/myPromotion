<?php
header("Content-Type: application/json; charset=utf-8");
include_once __DIR__ . '/../dbconfig.php';
include_once __DIR__ . '/../dbconnect.php';

// read json payload
$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    echo json_encode(["success" => false, "message" => "Invalid payload"]);
    exit;
}

// helper
function json_error($msg, $errors = null) {
    $out = ["success" => false, "message" => $msg];
    if ($errors) $out["errors"] = $errors;
    echo json_encode($out);
    exit;
}

// extract & normalize
$name = isset($input['name']) ? trim($input['name']) : '';
$condition_id = isset($input['condition_id']) && $input['condition_id'] !== '' ? intval($input['condition_id']) : null;
$promotion_id = isset($input['promotion_id']) && $input['promotion_id'] !== '' ? intval($input['promotion_id']) : null;
$start_date = isset($input['start_date']) ? trim($input['start_date']) : '';
$end_date = isset($input['end_date']) ? trim($input['end_date']) : '';
$members = isset($input['members']) && is_array($input['members']) ? $input['members'] : [];

// validation
$errors = [];
if ($name === '') $errors['name'] = 'กรุณากรอกชื่อกลุ่มลูกค้า';
if ($condition_id === null) $errors['condition_id'] = 'กรุณาเลือกเงื่อนไข';
if ($start_date === '') $errors['start_date'] = 'กรุณากรอกวันที่เริ่ม';
if ($end_date === '') $errors['end_date'] = 'กรุณากรอกวันที่สิ้นสุด';
if (count($members) === 0) $errors['members'] = 'ต้องมีสมาชิกอย่างน้อย 1 รายการ';

if (!empty($errors)) json_error("Validation failed", $errors);

// normalize date/time strings
function normalize_datetime($s) {
    $s = trim($s);
    if ($s === '') return null;
    $t = strtotime($s);
    if ($t === false) return null;
    return date("Y-m-d H:i:s", $t);
}

$nd_start = normalize_datetime($start_date);
$nd_end = normalize_datetime($end_date);
if (!$nd_start) $errors['start_date'] = 'รูปแบบวันที่เริ่มไม่ถูกต้อง';
if (!$nd_end) $errors['end_date'] = 'รูปแบบวันที่สิ้นสุดไม่ถูกต้อง';

if (!empty($errors)) json_error("Validation failed", $errors);
if (strtotime($nd_start) > strtotime($nd_end)) {
    json_error("วันที่เริ่มต้องไม่มากกว่าวันที่สิ้นสุด", ["date" => "start must be <= end"]);
}

// DB: transaction
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    mysqli_begin_transaction($connection);

    // Insert into customer_groups (include promotion_id)
    $sqlGroup = "INSERT INTO customer_groups (name, condition_id, promotion_id, start_date, end_date, created_by, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())";
    $stmt = mysqli_prepare($connection, $sqlGroup);

    // created_by intentionally left NULL (as per requirement) -> bind null
    $created_by = null; // or set to 0 if prefer
    // Use types: s = string, i = int, i = int (promotion_id), s = string, s = string, i = int (created_by)
    // For created_by null, binding null will insert SQL NULL
    mysqli_stmt_bind_param($stmt, "sisssi", $name, $condition_id, $promotion_id, $nd_start, $nd_end, $created_by);

    $execOk = @mysqli_stmt_execute($stmt);
    if ($execOk === false) {
        // fallback in case binding null created_by causes issues: insert without created_by
        mysqli_stmt_close($stmt);
        $sqlGroup2 = "INSERT INTO customer_groups (name, condition_id, promotion_id, start_date, end_date, created_at)
                      VALUES (?, ?, ?, ?, ?, NOW())";
        $stmt = mysqli_prepare($connection, $sqlGroup2);
        mysqli_stmt_bind_param($stmt, "sisss", $name, $condition_id, $promotion_id, $nd_start, $nd_end);
        mysqli_stmt_execute($stmt);
    }

    $group_id = mysqli_insert_id($connection);

    // Deduplicate members by customer_id
    $unique = [];
    foreach ($members as $m) {
        if (!is_array($m)) continue;
        $cid = isset($m['customer_id']) ? intval($m['customer_id']) : 0;
        if ($cid <= 0) continue;
        if (isset($unique[$cid])) continue;
        $sel = isset($m['select_all']) ? (intval($m['select_all']) ? 1 : 0) : 0;
        $unique[$cid] = $sel;
    }

    if (count($unique) === 0) {
        mysqli_rollback($connection);
        json_error("ไม่มีสมาชิกที่ถูกต้องสำหรับบันทึก");
    }

    // Prepare member insert (use INSERT IGNORE to skip duplicates)
    $sqlM = "INSERT IGNORE INTO customer_group_members (group_id, customer_id, select_all, added_by, added_at)
             VALUES (?, ?, ?, ?, NOW())";
    $stmtM = mysqli_prepare($connection, $sqlM);
    $added_by = 0;

    $inserted_count = 0;
    foreach ($unique as $cid => $sel) {
        mysqli_stmt_bind_param($stmtM, "iiii", $group_id, $cid, $sel, $added_by);
        mysqli_stmt_execute($stmtM);
        $affected = mysqli_stmt_affected_rows($stmtM);
        if ($affected > 0) $inserted_count += $affected;
    }

    mysqli_commit($connection);

    echo json_encode([
        "success" => true,
        "group_id" => $group_id,
        "inserted_members" => $inserted_count
    ]);
    mysqli_close($connection);
    exit;

} catch (Exception $e) {
    @mysqli_rollback($connection);
    $msg = $e->getMessage();
    echo json_encode(["success" => false, "message" => "DB error: $msg"]);
    mysqli_close($connection);
    exit;
}
