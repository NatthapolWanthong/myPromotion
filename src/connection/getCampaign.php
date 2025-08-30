<?php
include "dbconfig.php";
include "dbconnect.php";

// รับค่าจาก JS
$data = json_decode(file_get_contents("php://input"), true);
file_put_contents("log.txt", json_encode($data, JSON_PRETTY_PRINT) . PHP_EOL, FILE_APPEND);

$id = $data['id'] ?? null;

if ($id) {
    // ========== ดึงเฉพาะ Campaign ตาม ID ==========
    $sql = "SELECT id, name, type, target, start_date, end_date, status, code, created_by, create_date, edit_date, promotion, location, note, description
            FROM campaign
            WHERE id = ?";
    $stmt = mysqli_prepare($connection, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $campaign = mysqli_fetch_assoc($result);

    mysqli_close($connection);

    echo json_encode($campaign);
    exit;
}

// ========== ถ้าไม่มี id ให้ทำ Query แบบเดิม (getAll, search, filter) ==========
$page = $data['page'] ?? 1;
$pageSize = $data['pageSize'] ?? 10;
$offset = ($page - 1) * $pageSize;
$keyword = $data['keyword'] ?? '';
$type = $data['type'] ?? [];
$target = $data['target'] ?? [];
$status = $data['status'] ?? [];
$sortBy = $data['sortBy'] ?? 'start_date';
$sortOrder = $data['sortOrder'] ?? 'desc';

// SQL Dynamic Filter
$where = [];
$filterParams = [];
$filterTypes = "";

if (!empty($keyword)) {
    $where[] = "(name LIKE ? OR code LIKE ? OR description LIKE ?)";
    $kw = "%$keyword%";
    $filterParams[] = $kw;
    $filterParams[] = $kw;
    $filterParams[] = $kw;
    $filterTypes .= "sss";
}

if (!empty($type)) {
    $in = str_repeat('?,', count($type) - 1) . '?';
    $where[] = "type IN ($in)";
    $filterParams = array_merge($filterParams, $type);
    $filterTypes .= str_repeat("s", count($type));
}

if (!empty($target)) {
    $in = str_repeat('?,', count($target) - 1) . '?';
    $where[] = "target IN ($in)";
    $filterParams = array_merge($filterParams, $target);
    $filterTypes .= str_repeat("s", count($target));
}

if (!empty($status)) {
    $in = str_repeat('?,', count($status) - 1) . '?';
    $where[] = "status IN ($in)";
    $filterParams = array_merge($filterParams, $status);
    $filterTypes .= str_repeat("s", count($status));
}

$whereSQL = count($where) ? "WHERE " . implode(" AND ", $where) : "";

// Query Count ทั้งหมด
$countSql = "SELECT COUNT(*) FROM campaign $whereSQL";
$stmt = mysqli_prepare($connection, $countSql);
if (!empty($filterParams)) {
    mysqli_stmt_bind_param($stmt, $filterTypes, ...$filterParams);
}
mysqli_stmt_execute($stmt);
mysqli_stmt_bind_result($stmt, $total);
mysqli_stmt_fetch($stmt);
mysqli_stmt_close($stmt);

// Query Count แยกตามสถานะรอง (Dynamic)
$statusCountSql = "SELECT status, COUNT(*) as cnt FROM campaign $whereSQL GROUP BY status";
$stmt = mysqli_prepare($connection, $statusCountSql);
if (!empty($filterParams)) {
    mysqli_stmt_bind_param($stmt, $filterTypes, ...$filterParams);
}
mysqli_stmt_execute($stmt);
$resultStatus = mysqli_stmt_get_result($stmt);

$statusCounts = [];
while ($row = mysqli_fetch_assoc($resultStatus)) {
    $statusCounts[$row['status']] = (int)$row['cnt'];
}
mysqli_stmt_close($stmt);

// Query Data
$dataSql = "SELECT id, name, type, target, start_date, end_date, status, code, created_by, create_date, edit_date, promotion, location, note, description
            FROM campaign $whereSQL
            ORDER BY $sortBy $sortOrder
            LIMIT ?, ?";
$paramTypes = $filterTypes . "ii";
$dataParams = array_merge($filterParams, [$offset, $pageSize]);

$stmt = mysqli_prepare($connection, $dataSql);
mysqli_stmt_bind_param($stmt, $paramTypes, ...$dataParams);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}
mysqli_close($connection);

// ส่งกลับ
echo json_encode([
    "data" => $data,
    "total" => $total,
    "statusCounts" => $statusCounts // ← ส่งจำนวนสถานะรองทั้งหมด
]);
?>
