<?php
header("Content-Type: application/json; charset=utf-8");
include "dbconfig.php";
include "dbconnect.php";

$data = json_decode(file_get_contents("php://input"), true);

$id           = $data["id"] ?? null;
$name         = $data["name"] ?? "";
$type         = $data["type"] ?? "";
$target       = $data["target"] ?? "";
$begin        = $data["begin"] ?? "";
$end          = $data["end"] ?? "";
$status       = $data["status"] ?? "";
$created_by   = $data["created_by"] ?? "";
$promotion    = $data["promotion"] ?? 0;
$code         = $data["code"] ?? "";
$location     = $data["location"] ?? "";
$note         = $data["note"] ?? "";
$description  = $data["description"] ?? "";
$campaign_id  = $data["campaign_id"] ?? 0;

if (empty($name)) { echo json_encode(["success"=>false,"message"=>'"ชื่อโปรโมชันห้ามว่าง"']); exit;}
if (empty($code)) {
    // generate fallback code
    $code = "CMP-" . date("Ymd") . "-" . str_pad(rand(0,9999),4,"0",STR_PAD_LEFT);
}
if (empty($type)) { echo json_encode(["success"=>false,"message"=>'"ประเภทห้ามว่าง"']); exit;}
if (empty($target)) { echo json_encode(["success"=>false,"message"=>'"เป้าหมายห้ามว่าง"']); exit;}
if (empty($begin)) { echo json_encode(["success"=>false,"message"=>'"วันที่เริ่มห้ามว่าง"']); exit;}
if (empty($end)) { echo json_encode(["success"=>false,"message"=>'"วันที่สิ้นสุดห้ามว่าง"']); exit;}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // เริ่ม transaction เพื่อความสเถียร (insert + update count จะอาโตมิค)
    mysqli_begin_transaction($connection);

    // ===== insert / update =====
    if (!empty($id)) {
        $sql = "UPDATE promotion SET
          name=?, type=?, target=?, start_date=?, end_date=?, status=?, 
          edit_date=NOW(), promotion=?, code=?, location=?, note=?, description=?, campaign_id=?
          WHERE id=?";
        $stmt = mysqli_prepare($connection,$sql);
        // ตรวจสอบ order ของพารามิเตอร์ ให้ตรงกับ ? ใน SQL
        // types: s,i,i,s,s,i,i,s,s,s,s,i,i  (ปรับตามโครงสร้างข้อมูลจริงของคุณ)
        mysqli_stmt_bind_param($stmt,"siissiissssii",
            $name, $type, $target, $begin, $end, $status,
            $promotion, $code, $location, $note, $description, $campaign_id, $id);
    } else {
        $sql = "INSERT INTO promotion
          (name, type, target, start_date, end_date, status, created_by, create_date,
           promotion, code, location, note, description, campaign_id)
          VALUES (?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?)";
        $stmt = mysqli_prepare($connection,$sql);
        // types: s,i,i,s,s,i,s,i,s,s,s,s,i (ปรับตามโครงสร้างข้อมูลจริงของคุณ)
        mysqli_stmt_bind_param($stmt,"siissisissssi",
            $name, $type, $target, $begin, $end, $status,
            $created_by, $promotion, $code, $location, $note, $description, $campaign_id);
    }

    // Execute main insert/update
    $execOk = mysqli_stmt_execute($stmt);
    if (!$execOk) {
        throw new Exception("Execute failed: " . mysqli_stmt_error($stmt));
    }

    // get inserted id (if insert)
    $newId = !empty($id) ? $id : mysqli_insert_id($connection);

    // ===== Recalculate total promotions for this campaign (now including newly inserted row) =====
    $countSql = "SELECT COUNT(*) as total FROM promotion WHERE campaign_id = ?";
    $countStmt = mysqli_prepare($connection,$countSql);
    mysqli_stmt_bind_param($countStmt,"i",$campaign_id);
    mysqli_stmt_execute($countStmt);
    mysqli_stmt_bind_result($countStmt,$total);
    mysqli_stmt_fetch($countStmt);
    mysqli_stmt_close($countStmt);

    // ===== Update campaign.promotion with the recalculated total =====
    $updateCampaignSql = "UPDATE campaign SET promotion = ? WHERE id = ?";
    $stmtUpdate = mysqli_prepare($connection, $updateCampaignSql);
    mysqli_stmt_bind_param($stmtUpdate, "ii", $total, $campaign_id);
    mysqli_stmt_execute($stmtUpdate);
    mysqli_stmt_close($stmtUpdate);

    // ===== Also compute status breakdown (optional) =====
    $statusCountSql = "SELECT status, COUNT(*) as cnt FROM promotion WHERE campaign_id = ? GROUP BY status";
    $statusStmt = mysqli_prepare($connection,$statusCountSql);
    mysqli_stmt_bind_param($statusStmt,"i",$campaign_id);
    mysqli_stmt_execute($statusStmt);
    $resultStatus = mysqli_stmt_get_result($statusStmt);

    $statusCounts = [];
    while($row = mysqli_fetch_assoc($resultStatus)){
        $statusCounts[$row['status']] = (int)$row['cnt'];
    }
    mysqli_stmt_close($statusStmt);

    // commit transaction
    mysqli_commit($connection);

    // close main stmt
    mysqli_stmt_close($stmt);

    echo json_encode([
        "success" => true,
        "id" => $newId,
        "total" => (int)$total,
        "statusCounts" => $statusCounts
    ]);
} catch (Exception $e) {
    // rollback on error
    if ($connection) mysqli_rollback($connection);
    $err = $e->getMessage();
    echo json_encode([
        "success" => false,
        "message" => $err
    ]);
} finally {
    if ($connection) mysqli_close($connection);
}
?>
