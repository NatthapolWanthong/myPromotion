<?php
header("Content-Type: application/json; charset=utf-8");
include_once __DIR__ . '/../dbconfig.php';
include_once __DIR__ . '/../dbconnect.php';

// read payload (JSON body preferred, fallback to $_POST)
$raw = file_get_contents('php://input');
$input = [];
if ($raw) {
    $tmp = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($tmp)) $input = $tmp;
}
if ($_POST) $input = array_merge($input, $_POST);

// params
$promotion_id = isset($input['promotion_id']) ? intval($input['promotion_id']) : 0;
$group_id = isset($input['group_id']) ? intval($input['group_id']) : 0;
$page = max(1, intval($input['page'] ?? 1));
$per_page = max(1, intval($input['per_page'] ?? 10));
$q = isset($input['q']) ? trim($input['q']) : '';
$offset = ($page - 1) * $per_page;

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// helper to call bind_param with refs
function refValues($arr){
    $refs = [];
    foreach($arr as $k => $v) $refs[$k] = &$arr[$k];
    return $refs;
}

// Ensure DB connection variable exists (your project used $connection)
$mysqli = null;
if (isset($connection) && $connection instanceof mysqli) $mysqli = $connection;
elseif (isset($mysqli) && $mysqli instanceof mysqli) { /* keep */ }
else $mysqli = $connection ?? null;

if (!$mysqli) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection not found (expect $connection)'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // If group_id requested -> return single group detail + members
    if ($group_id > 0) {
        $stmt = mysqli_prepare($mysqli, "SELECT id, name, start_date, end_date, promotion_id, condition_id FROM customer_groups WHERE id = ? LIMIT 1");
        mysqli_stmt_bind_param($stmt, "i", $group_id);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $group = mysqli_fetch_assoc($res);
        mysqli_stmt_close($stmt);

        if (!$group) {
            echo json_encode(['success' => false, 'message' => 'group not found']);
            exit;
        }

        // fetch members
        $stmt = mysqli_prepare($mysqli, "SELECT cgm.customer_id, cgm.select_all, c.code, c.name FROM customer_group_members cgm LEFT JOIN customer c ON c.id = cgm.customer_id WHERE cgm.group_id = ?");
        mysqli_stmt_bind_param($stmt, "i", $group_id);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $members = [];
        while ($r = mysqli_fetch_assoc($res)) {
            $members[] = [
                'customer_id' => intval($r['customer_id']),
                'select_all' => intval($r['select_all']),
                'code' => $r['code'] ?? '',
                'name' => $r['name'] ?? ''
            ];
        }
        mysqli_stmt_close($stmt);

        $out = [
            'success' => true,
            'total' => 1,
            'rows' => [[
                'id' => intval($group['id']),
                'name' => $group['name'] ?? '',
                'start_date' => $group['start_date'] ?? '',
                'end_date' => $group['end_date'] ?? '',
                'promotion_id' => intval($group['promotion_id'] ?? 0),
                'condition_id' => intval($group['condition_id'] ?? 0),
                'members' => $members
            ]]
        ];

        echo json_encode($out, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // -- listing mode (requires promotion_id)
    if (!$promotion_id) {
        echo json_encode(["success"=>false, "message"=>"promotion_id required"]);
        exit;
    }

    $search_like = "%".$q."%";

    // 1) count total groups (with optional search)
    if ($q === '') {
        $countSql = "SELECT COUNT(*) as total FROM customer_groups cg WHERE cg.promotion_id = ?";
        $stmt = mysqli_prepare($mysqli, $countSql);
        mysqli_stmt_bind_param($stmt, "i", $promotion_id);
    } else {
        // search group name, condition_name or customer code
        $countSql = "SELECT COUNT(*) as total
            FROM customer_groups cg
            LEFT JOIN `condition` cnd ON cnd.id = cg.condition_id
            WHERE cg.promotion_id = ?
              AND (
                cg.name LIKE ?
                OR cnd.condition_name LIKE ?
                OR EXISTS (
                  SELECT 1 FROM customer_group_members cgm2
                  JOIN customer cc ON cc.id = cgm2.customer_id
                  WHERE cgm2.group_id = cg.id AND cc.code LIKE ?
                )
              )";
        $stmt = mysqli_prepare($mysqli, $countSql);
        mysqli_stmt_bind_param($stmt, "isss", $promotion_id, $search_like, $search_like, $search_like);
    }
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $totalRow = mysqli_fetch_assoc($res);
    $total = intval($totalRow['total'] ?? 0);
    mysqli_stmt_close($stmt);

    // 2) select paged group ids (respecting search)
    if ($q === '') {
        $idSql = "SELECT cg.id FROM customer_groups cg WHERE cg.promotion_id = ? ORDER BY cg.id DESC LIMIT ? OFFSET ?";
        $stmt = mysqli_prepare($mysqli, $idSql);
        mysqli_stmt_bind_param($stmt, "iii", $promotion_id, $per_page, $offset);
    } else {
        $idSql = "SELECT cg.id FROM customer_groups cg
            LEFT JOIN `condition` cnd ON cnd.id = cg.condition_id
            WHERE cg.promotion_id = ?
              AND (
                cg.name LIKE ?
                OR cnd.condition_name LIKE ?
                OR EXISTS (
                  SELECT 1 FROM customer_group_members cgm2
                  JOIN customer cc ON cc.id = cgm2.customer_id
                  WHERE cgm2.group_id = cg.id AND cc.code LIKE ?
                )
              )
            ORDER BY cg.id DESC LIMIT ? OFFSET ?";
        $stmt = mysqli_prepare($mysqli, $idSql);
        mysqli_stmt_bind_param($stmt, "isssii", $promotion_id, $search_like, $search_like, $search_like, $per_page, $offset);
    }
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $ids = [];
    while ($r = mysqli_fetch_assoc($res)) $ids[] = intval($r['id']);
    mysqli_stmt_close($stmt);

    $rows = [];
    if (count($ids) > 0) {
        // build placeholders for IN and FIELD order
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        // aggregated query: GROUP_CONCAT and mark select_all as (*)
        $aggSql = "SELECT cg.id,
                        cg.name,
                        cg.start_date,
                        cg.end_date,
                        cg.promotion_id,
                        cnd.condition_name as condition_name,
                        IFNULL(GROUP_CONCAT(DISTINCT ta.name SEPARATOR ','),'') as type_areas,
                        IFNULL(GROUP_CONCAT(DISTINCT an.code SEPARATOR ','),'') as area_names,
                        IFNULL(GROUP_CONCAT(DISTINCT seg.code SEPARATOR ','),'') as segments,
                        IFNULL(GROUP_CONCAT(DISTINCT CONCAT(co.code, CASE WHEN cgm.select_all=1 THEN '(*)' ELSE '' END) ORDER BY co.code SEPARATOR ','),'') as customer_codes
                   FROM customer_groups cg
                   LEFT JOIN customer_group_members cgm ON cgm.group_id = cg.id
                   LEFT JOIN customer co ON co.id = cgm.customer_id
                   LEFT JOIN customer_options_type_areas ta ON co.type_area_id = ta.id
                   LEFT JOIN customer_options_area_names an ON co.area_name_id = an.id
                   LEFT JOIN customer_options_segments seg ON co.segment_id = seg.id
                   LEFT JOIN `condition` cnd ON cnd.id = cg.condition_id
                   WHERE cg.id IN ($placeholders)
                   GROUP BY cg.id
                   ORDER BY FIELD(cg.id, $placeholders)";

        $stmt = mysqli_prepare($mysqli, $aggSql);
        // bind params: ids twice (IN list then FIELD order)
        $bindVals = array_merge($ids, $ids);
        $types = str_repeat('i', count($bindVals));
        $bind_params = [];
        $bind_params[] = $types;
        foreach ($bindVals as $k => $v) $bind_params[] = $bindVals[$k];
        call_user_func_array(array($stmt, 'bind_param'), refValues($bind_params));

        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        while ($r = mysqli_fetch_assoc($res)) {
            $rows[] = [
                'id' => intval($r['id']),
                'name' => $r['name'] ?? '',
                'start_date' => $r['start_date'] ?? '',
                'end_date' => $r['end_date'] ?? '',
                'promotion_id' => intval($r['promotion_id'] ?? 0),
                'condition' => $r['condition_name'] ?? '',
                'type_area' => $r['type_areas'] ?? '',
                'area_name' => $r['area_names'] ?? '',
                'segment' => $r['segments'] ?? '',
                'customer_code' => $r['customer_codes'] ?? ''
            ];
        }
        mysqli_stmt_close($stmt);
    }

    echo json_encode(["success" => true, "total" => $total, "rows" => $rows], JSON_UNESCAPED_UNICODE);
    exit;

} catch (Exception $e) {
    $msg = $e->getMessage();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB error: $msg"], JSON_UNESCAPED_UNICODE);
    exit;
}
