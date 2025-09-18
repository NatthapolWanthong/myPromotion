<?php
header('Content-Type: application/json; charset=utf-8');

include_once __DIR__ . '/../dbconfig.php';
include_once __DIR__ . '/../dbconnect.php';

if (!isset($connection) && isset($conn)) $connection = $conn;
if (!isset($connection) && isset($mysqli)) $connection = $mysqli;

if (!isset($connection) || !$connection) {
    echo json_encode(['success' => false, 'error' => 'DB connection not found']);
    exit;
}

if (method_exists($connection, 'set_charset')) {
    $connection->set_charset('utf8mb4');
}

// read input (JSON body preferred, fallback to POST/GET)
$raw = file_get_contents("php://input");
$input = json_decode($raw, true);
if (!$input) $input = $_POST ?: [];

// prefer GET params if present (bootstrap-table often uses GET)
$params_all = array_merge($_GET ?: [], $input ?: []);

// filters
$promotion_id = isset($params_all['promotion_id']) ? intval($params_all['promotion_id']) : 0;
$campaign_id = isset($params_all['campaign_id']) ? intval($params_all['campaign_id']) : 0;

// pagination: support both page/per_page and limit/offset
if (isset($params_all['limit'])) {
    $per_page = max(1, intval($params_all['limit']));
} else {
    $per_page = isset($params_all['per_page']) ? max(1,intval($params_all['per_page'])) : 20;
}
if (isset($params_all['offset'])) {
    $offset = max(0, intval($params_all['offset']));
    $page = floor($offset / max(1,$per_page)) + 1;
} else {
    $page = isset($params_all['page']) ? max(1,intval($params_all['page'])) : 1;
    $offset = ($page - 1) * $per_page;
}

// search: accept 'q' or 'search'
$q = '';
if (isset($params_all['q'])) $q = trim($params_all['q']);
elseif (isset($params_all['search'])) $q = trim($params_all['search']);

// is_active (allow null)
$is_active = null;
if (isset($params_all['is_active']) && $params_all['is_active'] !== '') $is_active = intval($params_all['is_active']);

// sort: accept sort/order or sort_by/sort_dir
$sort_by = isset($params_all['sort']) ? trim($params_all['sort']) : (isset($params_all['sort_by']) ? trim($params_all['sort_by']) : 'created_at');
$sort_dir = isset($params_all['order']) ? strtoupper(trim($params_all['order'])) : (isset($params_all['sort_dir']) ? strtoupper(trim($params_all['sort_dir'])) : 'DESC');
if (!in_array($sort_dir, ['ASC','DESC'])) $sort_dir = 'DESC';

// build WHERE clauses
$where = [];
$params = [];
$types = '';

if ($promotion_id > 0) {
    $where[] = 'promotion_id = ?';
    $params[] = $promotion_id; $types .= 'i';
}
if ($campaign_id > 0) {
    $where[] = 'campaign_id = ?';
    $params[] = $campaign_id; $types .= 'i';
}
if ($is_active !== null) {
    $where[] = 'is_active = ?';
    $params[] = $is_active; $types .= 'i';
}
if ($q !== '') {
    $where[] = '(condition_name LIKE ? OR condition_code LIKE ?)';
    $params[] = '%' . $q . '%';
    $params[] = '%' . $q . '%';
    $types .= 'ss';
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
    $bind_names = [];
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
$bindParams = $params;
$bindTypes = $types;
$bindParams[] = $per_page;
$bindParams[] = $offset;
$bindTypes .= 'ii';

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

// return both 'data' and 'rows' for compatibility
echo json_encode([
    'success' => true,
    'data' => $rows,
    'rows' => $rows,
    'page' => $page,
    'per_page' => $per_page,
    'total' => $total,
    'total_pages' => $total_pages
], JSON_UNESCAPED_UNICODE);
exit;
