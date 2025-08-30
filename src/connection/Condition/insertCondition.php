<?php
header('Content-Type: application/json; charset=utf-8');

include_once __DIR__ . '/../dbconfig.php';
include_once __DIR__ . '/../dbconnect.php';

// normalize connection
if (!isset($connection) && isset($conn)) $connection = $conn;
if (!isset($connection) && isset($mysqli)) $connection = $mysqli;

if (!isset($connection) || !$connection) {
    echo json_encode(['success' => false, 'error' => 'DB connection not found']);
    exit;
}

// ensure using utf8mb4
if (method_exists($connection, 'set_charset')) {
    $connection->set_charset('utf8mb4');
}

// log input (for debugging)
$raw = file_get_contents("php://input");
@file_put_contents(__DIR__ . "/insertConditionLog.txt", date('c') . " RAW_INPUT:\n" . $raw . "\n", FILE_APPEND);

// parse input (JSON preferred)
$input = json_decode($raw, true);
if (!$input) $input = $_POST ?: [];

// sanitize / defaults
$id = isset($input['id']) && $input['id'] !== '' ? intval($input['id']) : 0;
$promotion_id = isset($input['promotion_id']) && $input['promotion_id'] !== '' ? intval($input['promotion_id']) : 0;
$campaign_id = isset($input['campaign_id']) && $input['campaign_id'] !== '' ? intval($input['campaign_id']) : 0;
$condition_name = isset($input['condition_name']) ? trim($input['condition_name']) : '';
$condition_xml_input = $input['condition_xml'] ?? '';
$condition_code = isset($input['condition_code']) ? $input['condition_code'] : '';
$code_lang = isset($input['code_lang']) ? $input['code_lang'] : 'php';
$version = isset($input['version']) ? (string)$input['version'] : '1';
$created_by = isset($input['created_by']) ? $input['created_by'] : 'system';

// Normalize condition_xml: if it's array/object, json_encode it; if string, try to validate JSON
$condition_xml_bind = '';
if (is_array($condition_xml_input) || is_object($condition_xml_input)) {
    $condition_xml_bind = json_encode($condition_xml_input, JSON_UNESCAPED_UNICODE);
} else {
    // it's a string - try to decode then re-encode to normalize, otherwise store raw string
    $tmp = null;
    if (is_string($condition_xml_input) && trim($condition_xml_input) !== '') {
        $tmp = json_decode($condition_xml_input, true);
    }
    if ($tmp !== null) {
        $condition_xml_bind = json_encode($tmp, JSON_UNESCAPED_UNICODE);
    } else {
        // store as-is (string). still use json_encode for empty or non-json by wrapping
        // but to keep compatibility, store raw string
        $condition_xml_bind = (string)$condition_xml_input;
    }
}

// connection should be mysqli
// If id present => update
if ($id > 0) {
    if (!$condition_name) {
        echo json_encode(['success' => false, 'error' => 'condition_name is required for update']);
        exit;
    }

    $sql = "UPDATE `condition` 
            SET condition_name = ?, condition_xml = ?, condition_code = ?, code_lang = ?, version = ?, campaign_id = ?, promotion_id = ?, updated_at = NOW() 
            WHERE id = ?";
    $stmt = $connection->prepare($sql);
    if ($stmt === false) {
        echo json_encode(['success'=>false,'error'=>'prepare failed (update): '.$connection->error]);
        exit;
    }

    // bind types: 5 strings then 3 ints (campaign_id, promotion_id, id)
    $stmt->bind_param("sssssiii", $condition_name, $condition_xml_bind, $condition_code, $code_lang, $version, $campaign_id, $promotion_id, $id);

    try {
        $ok = $stmt->execute();
    } catch (Exception $e) {
        echo json_encode(['success'=>false,'error'=>'Update execute error: '.$e->getMessage()]);
        exit;
    }

    if ($ok === false) {
        $err = $stmt->error;
        $stmt->close();
        echo json_encode(['success' => false, 'error' => 'Update failed: '.$err]);
        exit;
    }
    $stmt->close();

    // return updated row
    $q = $connection->prepare("SELECT id, campaign_id, promotion_id, condition_name, condition_xml, condition_code, code_lang, version, is_active, created_by, created_at, updated_at FROM `condition` WHERE id = ?");
    $q->bind_param("i", $id);
    $q->execute();
    $res = $q->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $q->close();

    if ($row) {
        // try to decode json for condition_xml
        $decoded = json_decode($row['condition_xml'], true);
        if ($decoded !== null) {
            $row['condition_xml'] = $decoded;
        } else {
            // leave as raw string and also provide raw copy
            $row['raw_condition_xml'] = $row['condition_xml'];
        }
    }

    $promoForCount = $row['promotion_id'] ?? $promotion_id;
    $cstmt = $connection->prepare("SELECT COUNT(*) AS total FROM `condition` WHERE promotion_id = ? AND is_active = 1");
    $cstmt->bind_param("i", $promoForCount);
    $cstmt->execute();
    $total = intval($cstmt->get_result()->fetch_assoc()['total'] ?? 0);
    $cstmt->close();

    echo json_encode(['success'=>true, 'action'=>'updated', 'id'=>$id, 'data'=>$row, 'total'=>$total], JSON_UNESCAPED_UNICODE);
    exit;
}

// else -> insert
if ($promotion_id <= 0 || !$condition_name) {
    echo json_encode(['success' => false, 'error' => 'promotion_id and condition_name are required for insert', 'received' => $input], JSON_UNESCAPED_UNICODE);
    exit;
}

$sql = "INSERT INTO `condition` (campaign_id, promotion_id, condition_name, condition_xml, condition_code, code_lang, version, is_active, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())";
$stmt = $connection->prepare($sql);
if ($stmt === false) {
    echo json_encode(['success'=>false,'error'=>'prepare failed (insert): '.$connection->error], JSON_UNESCAPED_UNICODE);
    exit;
}

// bind params: campaign_id (i), promotion_id (i), condition_name (s), condition_xml (s), condition_code (s), code_lang (s), version (s), created_by (s)
$stmt->bind_param("iissssss", $campaign_id, $promotion_id, $condition_name, $condition_xml_bind, $condition_code, $code_lang, $version, $created_by);

try {
    $ok = $stmt->execute();
} catch (Exception $e) {
    echo json_encode(['success'=>false,'error'=>'Insert execute error: '.$e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!$ok) {
    $err = $stmt->error;
    $stmt->close();
    echo json_encode(['success' => false, 'error' => 'Insert failed: ' . $err], JSON_UNESCAPED_UNICODE);
    exit;
}
$newId = $stmt->insert_id;
$stmt->close();

// return created row
$q = $connection->prepare("SELECT id, campaign_id, promotion_id, condition_name, condition_xml, condition_code, code_lang, version, is_active, created_by, created_at, updated_at FROM `condition` WHERE id = ?");
$q->bind_param("i", $newId);
$q->execute();
$res = $q->get_result();
$row = $res ? $res->fetch_assoc() : null;
$q->close();

if ($row) {
    $decoded = json_decode($row['condition_xml'], true);
    if ($decoded !== null) {
        $row['condition_xml'] = $decoded;
    } else {
        $row['raw_condition_xml'] = $row['condition_xml'];
    }
}

// compute count for promotion
$cstmt = $connection->prepare("SELECT COUNT(*) AS total FROM `condition` WHERE promotion_id = ? AND is_active = 1");
$cstmt->bind_param("i", $promotion_id);
$cstmt->execute();
$total = intval($cstmt->get_result()->fetch_assoc()['total'] ?? 0);
$cstmt->close();

echo json_encode(['success'=>true, 'action'=>'inserted', 'id'=>$newId, 'data'=>$row, 'total'=>$total], JSON_UNESCAPED_UNICODE);
exit;
