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

// ensure charset
if (method_exists($connection, 'set_charset')) {
    $connection->set_charset('utf8mb4');
}

// read input
$raw = file_get_contents("php://input");
$input = json_decode($raw, true);
if (!$input) $input = $_POST ?: [];

// filters
$promotion_id = isset($input['promotion_id']) ? intval($input['promotion_id']) : (isset($_GET['promotion_id']) ? intval($_GET['promotion_id']) : 0);
$campaign_id = isset($input['campaign_id']) ? intval($input['campaign_id']) : (isset($_GET['campaign_id']) ? intval($_GET['campaign_id']) : 0);
$page = isset($input['page']) ? max(1, intval($input['page'])) : (isset($_GET['page']) ? max(1,intval($_GET['page'])) : 1);
$per_page = isset($input['per_page']) ? max(1,intval($input['per_page'])) : (isset($_GET['per_page']) ? max(1,intval($_GET['per_page'])) : 20);
$q = isset($input['q']) ? trim($input['q']) : (isset($_GET['q']) ? trim($_GET['q']) : '');
$is_active = isset($input['is_active']) ? intval($input['is_active']) : (isset($_GET['is_active']) ? intval($_GET['is_active']) : 1);
$sort_by = isset($input['sort_by']) ? trim($input['sort_by']) : (isset($_GET['sort_by']) ? trim($_GET['sort_by']) : 'created_at');
$sort_dir = isset($input['sort_dir']) ? strtoupper(trim($input['sort_dir'])) : (isset($_GET['sort_dir']) ? strtoupper(trim($_GET['sort_dir'])) : 'DESC');
if (!in_array($sort_dir, ['ASC','DESC'])) $sort_dir = 'DESC';

// build WHERE clauses
$where = [];
$params = [];
$types = '';

if ($promotion_id > 0) {
    $where[] = 'promotion_id = ?';
    $params[] = $promotion_id;
    $types .= 'i';
}
if ($campaign_id > 0) {
    $where[] = 'campaign_id = ?';
    $params[] = $campaign_id;
    $types .= 'i';
}
if ($is_active !== null) {
    $where[] = 'is_active = ?';
    $params[] = $is_active;
    $types .= 'i';
}
if ($q !== '') {
    // search in condition_name
    $where[] = 'condition_name LIKE ?';
    $params[] = '%' . $q . '%';
    $types .= 's';
}

$whereSql = '';
if (count($where)) $whereSql = 'WHERE ' . implode(' AND ', $where);

// get total count
$countSql = "SELECT COUNT(*) AS total FROM `condition` $whereSql";
$cstmt = $connection->prepare($countSql);
if ($cstmt === false) {
    echo json_encode(['success'=>false,'error'=>'prepare failed (count): '.$connection->error]);
    exit;
}
if (strlen($types)) {
    // bind dynamically
    $bind_names[] = $types;
    for ($i=0; $i<count($params); $i++) {
        $bind_names[] = &$params[$i];
    }
    call_user_func_array([$cstmt, 'bind_param'], $bind_names);
}
$cstmt->execute();
$total = intval($cstmt->get_result()->fetch_assoc()['total'] ?? 0);
$cstmt->close();

$total_pages = max(1, ceil($total / $per_page));
$offset = ($page - 1) * $per_page;

// sanitize sort_by to allowed columns
$allowedSort = ['created_at','updated_at','id','condition_name'];
if (!in_array($sort_by, $allowedSort)) $sort_by = 'created_at';

// fetch rows with limit
$dataSql = "SELECT id, campaign_id, promotion_id, condition_name, condition_xml, condition_code, code_lang, version, is_active, created_by, created_at, updated_at
            FROM `condition`
            $whereSql
            ORDER BY {$sort_by} {$sort_dir}
            LIMIT ? OFFSET ?";
$stmt = $connection->prepare($dataSql);
if ($stmt === false) {
    echo json_encode(['success'=>false,'error'=>'prepare failed (select): '.$connection->error]);
    exit;
}

// bind params + limit/offset
// build param list again
$bindParams = $params;
$bindTypes = $types;
$bindParams[] = $per_page;
$bindParams[] = $offset;
$bindTypes .= 'ii';

// call_user_func_array requires references
$bind_names = [];
$bind_names[] = $bindTypes;
for ($i=0; $i<count($bindParams); $i++) {
    $bind_names[] = &$bindParams[$i];
}
call_user_func_array([$stmt, 'bind_param'], $bind_names);

$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($r = $res->fetch_assoc()) {
    // try decode condition_xml
    $decoded = null;
    if (isset($r['condition_xml']) && $r['condition_xml'] !== null && $r['condition_xml'] !== '') {
        $tmp = json_decode($r['condition_xml'], true);
        if ($tmp !== null) {
            $r['condition_xml'] = $tmp;
        } else {
            $r['raw_condition_xml'] = $r['condition_xml'];
            $r['condition_xml'] = null;
        }
    } else {
        $r['condition_xml'] = null;
    }
    $rows[] = $r;
}
$stmt->close();

echo json_encode([
    'success' => true,
    'data' => $rows,
    'page' => $page,
    'per_page' => $per_page,
    'total' => $total,
    'total_pages' => $total_pages
], JSON_UNESCAPED_UNICODE);
exit;
