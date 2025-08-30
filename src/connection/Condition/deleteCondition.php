<?php
header('Content-Type: application/json; charset=utf-8');

include_once __DIR__ . '/../dbconfig.php';
include_once __DIR__ . '/../dbconnect.php';

// normalize connection
if (!isset($connection) && isset($conn)) $connection = $conn;
if (!isset($connection) && isset($mysqli)) $connection = $mysqli;

$raw = file_get_contents("php://input");
@file_put_contents(__DIR__ . "/deleteConditionLog.txt", date('c') . " RAW_INPUT:\n" . $raw . "\n", FILE_APPEND);

$input = json_decode($raw, true);
if (!$input) $input = $_POST ?: [];

$id = isset($input['id']) && $input['id'] !== '' ? intval($input['id']) : 0;
$hard = isset($input['hard_delete']) && ($input['hard_delete'] === true || $input['hard_delete'] === '1' || $input['hard_delete'] === 1);

if ($id <= 0) { echo json_encode(['success'=>false,'error'=>'id required']); exit; }
if (!isset($connection)) { echo json_encode(['success'=>false,'error'=>'db not found']); exit; }

// fetch record first to get promotion_id
$q = $connection->prepare("SELECT promotion_id FROM `condition` WHERE id = ?");
$q->bind_param("i",$id); $q->execute(); $row = $q->get_result()->fetch_assoc(); $q->close();
if (!$row) { echo json_encode(['success'=>false,'error'=>'condition not found']); exit; }
$promo = $row['promotion_id'];

if ($hard) {
    $stmt = $connection->prepare("DELETE FROM `condition` WHERE id = ?");
    $stmt->bind_param("i",$id);
    $ok = $stmt->execute();
    $stmt->close();
    if (!$ok) { echo json_encode(['success'=>false,'error'=>'delete failed']); exit; }
} else {
    $stmt = $connection->prepare("UPDATE `condition` SET is_active = 0, updated_at = NOW() WHERE id = ?");
    $stmt->bind_param("i",$id);
    $ok = $stmt->execute();
    $stmt->close();
    if (!$ok) { echo json_encode(['success'=>false,'error'=>'soft-delete failed']); exit; }
}

// compute remaining total for promotion (active only)
$cstmt = $connection->prepare("SELECT COUNT(*) AS total FROM `condition` WHERE promotion_id = ? AND is_active = 1");
$cstmt->bind_param("i",$promo); $cstmt->execute(); $total = intval($cstmt->get_result()->fetch_assoc()['total'] ?? 0); $cstmt->close();

echo json_encode(['success'=>true,'id'=>$id,'deleted'=>true,'total'=>$total]);
exit;
