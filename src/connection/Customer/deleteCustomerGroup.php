<?php
header("Content-Type: application/json; charset=utf-8");
include_once __DIR__ . '/../dbconfig.php';
include_once __DIR__ . '/../dbconnect.php';

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) $input = $_POST;

$group_id = isset($input['group_id']) ? intval($input['group_id']) : 0;
if (!$group_id) {
    echo json_encode(['success' => false, 'message' => 'group_id required']);
    exit;
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    mysqli_begin_transaction($connection);

    // delete members first (FK CASCADE might handle but do explicitly)
    $delMembers = mysqli_prepare($connection, "DELETE FROM customer_group_members WHERE group_id = ?");
    mysqli_stmt_bind_param($delMembers, "i", $group_id);
    mysqli_stmt_execute($delMembers);
    mysqli_stmt_close($delMembers);

    // delete group
    $delGroup = mysqli_prepare($connection, "DELETE FROM customer_groups WHERE id = ?");
    mysqli_stmt_bind_param($delGroup, "i", $group_id);
    mysqli_stmt_execute($delGroup);
    $affected = mysqli_stmt_affected_rows($delGroup);
    mysqli_stmt_close($delGroup);

    mysqli_commit($connection);

    echo json_encode(['success' => true, 'deleted' => ($affected > 0) ? 1 : 0]);
} catch (Exception $e) {
    mysqli_rollback($connection);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
mysqli_close($connection);
