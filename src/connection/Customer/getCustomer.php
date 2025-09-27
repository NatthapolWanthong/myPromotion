<?php

header('Content-Type: application/json; charset=utf-8');

include_once __DIR__ . '/../dbconfig.php';
include_once __DIR__ . '/../dbconnect.php';

// normalize mysqli connection variable ($connection or $mysqli or $db)
$mysqli = null;
if (isset($connection) && $connection instanceof mysqli) $mysqli = $connection;
elseif (isset($mysqli) && $mysqli instanceof mysqli) $mysqli = $mysqli;
elseif (isset($db) && $db instanceof mysqli) $mysqli = $db;

if (!$mysqli) {
    http_response_code(500);
    echo json_encode(['total' => 0, 'rows' => [], 'error' => 'DB connection not found (expect $connection or $db or $mysqli)'], JSON_UNESCAPED_UNICODE);
    exit;
}

// read payload (JSON body preferred, fallback to $_POST)
$raw = file_get_contents('php://input');
$input = [];
if ($raw) {
    $tmp = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($tmp)) $input = $tmp;
}
if ($_POST) $input = array_merge($input, $_POST);

// pagination & controls
$page = max(1, intval($input['page'] ?? 1));
$per_page = max(1, intval($input['per_page'] ?? ($input['limit'] ?? 10)));
$q = trim((string)($input['q'] ?? ''));
$sortBy = trim((string)($input['sortBy'] ?? ($input['sort'] ?? 'id')));
$order = strtoupper(trim((string)($input['order'] ?? ($input['orderBy'] ?? 'ASC'))));
$filters = $input['filters'] ?? [];

// If client provided explicit list of ids -> use those (array)
$ids = $input['ids'] ?? null;
$idsFilterProvided = is_array($ids) && count($ids) > 0;

// map allowed sort fields (frontend field -> SQL expression)
$sortMap = [
    'id' => 'c.id',
    'code' => 'c.code',
    'name' => 'c.name',
    'type_area' => 'ta.name',
    'area_name' => 'an.name',
    'segment' => 's.name',
    'grade' => 'g.name',
    'size' => 'sz.name',
    'province' => 'c.province',
    'district' => 'c.district'
];
$orderBy = $sortMap[$sortBy] ?? 'c.id';
$orderDir = ($order === 'DESC') ? 'DESC' : 'ASC';

$whereParts = [];

if ($idsFilterProvided) {
    // sanitize: cast each to int
    $cleanIds = array_values(array_map(function($v){ return intval($v); }, $ids));
    // Remove zeros if any? Keep zeros if intentionally requested - but usually ids > 0
    $cleanIds = array_filter($cleanIds, function($v){ return $v !== 0; });
    if (count($cleanIds) > 0) {
        $whereParts[] = 'c.id IN (' . implode(',', array_map('intval', $cleanIds)) . ')';
    } else {
        // no valid ids -> return empty
        echo json_encode(['total' => 0, 'rows' => []], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// search (code | name)
if (!$idsFilterProvided && $q !== '') {
    $safe = $mysqli->real_escape_string($q);
    $whereParts[] = "(c.code LIKE '%{$safe}%' OR c.name LIKE '%{$safe}%')";
}

// filters (expected shape: { type_area: [...], area_name: [...], segment: [...], grade: [...], size: [...] })
$filterFields = [
    'type_area' => ['col_id' => 'c.type_area_id', 'join' => 'ta'],
    'area_name' => ['col_id' => 'c.area_name_id', 'join' => 'an'],
    'segment' => ['col_id' => 'c.segment_id', 'join' => 's'],
    'grade' => ['col_id' => 'c.grade_id', 'join' => 'g'],
    'size' => ['col_id' => 'c.size_id', 'join' => 'sz']
];

if (!$idsFilterProvided) {
    foreach ($filterFields as $key => $meta) {
        if (isset($filters[$key]) && is_array($filters[$key]) && count($filters[$key]) > 0) {
            $vals = $filters[$key];
            $sub = [];
            foreach ($vals as $v) {
                $v = trim((string)$v);
                if ($v === '') continue;
                // if purely numeric -> compare id
                if (ctype_digit($v)) {
                    $sub[] = $meta['col_id'] . ' = ' . intval($v);
                } else {
                    $safe = $mysqli->real_escape_string(mb_strtolower($v, 'UTF-8'));
                    // compare code or name
                    $sub[] = "LOWER({$meta['join']}.code) = '{$safe}'";
                    $sub[] = "LOWER({$meta['join']}.name) = '{$safe}'";
                }
            }
            if (count($sub)) $whereParts[] = '(' . implode(' OR ', $sub) . ')';
        }
    }
}

$whereSQL = count($whereParts) ? 'WHERE ' . implode(' AND ', $whereParts) : '';

// count total
$countSql = "SELECT COUNT(1) AS cnt
FROM customer c
LEFT JOIN customer_options_type_areas ta ON c.type_area_id = ta.id
LEFT JOIN customer_options_area_names an ON c.area_name_id = an.id
LEFT JOIN customer_options_segments s ON c.segment_id = s.id
LEFT JOIN customer_options_grades g ON c.grade_id = g.id
LEFT JOIN customer_options_sizes sz ON c.size_id = sz.id
{$whereSQL}";

$total = 0;
if ($res = $mysqli->query($countSql)) {
    $r = $res->fetch_assoc();
    $total = intval($r['cnt'] ?? 0);
    $res->free();
}

// fetch rows
$offset = ($page - 1) * $per_page;
$dataSql = "SELECT
  c.id, c.code, c.name,
  ta.code AS type_area_code, ta.name AS type_area,
  an.code AS area_name_code, an.name AS area_name,
  s.code AS segment_code, s.name AS segment,
  g.code AS grade_code, g.name AS grade,
  sz.code AS size_code, sz.name AS size,
  c.province, c.district
FROM customer c
LEFT JOIN customer_options_type_areas ta ON c.type_area_id = ta.id
LEFT JOIN customer_options_area_names an ON c.area_name_id = an.id
LEFT JOIN customer_options_segments s ON c.segment_id = s.id
LEFT JOIN customer_options_grades g ON c.grade_id = g.id
LEFT JOIN customer_options_sizes sz ON c.size_id = sz.id
{$whereSQL}
ORDER BY {$orderBy} {$orderDir}
LIMIT {$per_page} OFFSET {$offset}";

$rows = [];
if ($res = $mysqli->query($dataSql)) {
    while ($r = $res->fetch_assoc()) {
        $rows[] = [
            'id' => intval($r['id']),
            'code' => $r['code'],
            'name' => $r['name'],
            'type_area' => $r['type_area'] ?? $r['type_area_code'] ?? '',
            'area_name' => $r['area_name'] ?? $r['area_name_code'] ?? '',
            'segment' => $r['segment'] ?? $r['segment_code'] ?? '',
            'grade' => $r['grade'] ?? $r['grade_code'] ?? '',
            'size' => $r['size'] ?? $r['size_code'] ?? '',
            'province' => $r['province'] ?? '',
            'district' => $r['district'] ?? ''
        ];
    }
    $res->free();
}

echo json_encode(['total' => $total, 'rows' => $rows], JSON_UNESCAPED_UNICODE);
