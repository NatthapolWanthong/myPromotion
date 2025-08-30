<?php
header("Content-Type: application/json; charset=utf-8");
include "dbconfig.php";
include "dbconnect.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? null;
$name = $data["name"] ?? "";
$code = $data["code"] ?? "";
$status = $data["status"] ?? "";
$description = $data["description"] ?? "";
$type = $data["type"] ?? "";
$target = $data["target"] ?? "";
$begin = $data["begin"] ?? "";
$end = $data["end"] ?? "";
$location = $data["location"] ?? "";
$note = $data["note"] ?? "";

// ===== ตรวจสอบค่า =====
if (empty($name)) { echo json_encode(["success"=>false,"message"=>'"ชื่อห้ามว่าง"']); exit;}
if (empty($code)) {
    // generate fallback code
    $code = "CMP-" . date("Ymd") . "-" . str_pad(rand(0,9999),4,"0",STR_PAD_LEFT);
}

if (empty($type)) { echo json_encode(["success"=>false,"message"=>'"ประเภทห้ามว่าง"']); exit;}
if (empty($target)) { echo json_encode(["success"=>false,"message"=>'"เป้าหมายห้ามว่าง"']); exit;}
if (empty($begin)) { echo json_encode(["success"=>false,"message"=>'"วันที่เริ่มห้ามว่าง"']); exit;}
if (empty($end)) { echo json_encode(["success"=>false,"message"=>'"วันที่สิ้นสุดห้ามว่าง"']); exit;}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// ===== insert / update =====
if (!empty($id)) {
    $sql = "UPDATE campaign SET
      name=?, code=?, status=?, description=?, type=?, target=?, start_date=?, end_date=?, location=?, note=?
      WHERE id=?";
    $stmt = mysqli_prepare($connection,$sql);
    mysqli_stmt_bind_param($stmt,"ssssiissssi",
      $name,$code,$status,$description,$type,$target,$begin,$end,$location,$note,$id);
} else {
    $sql = "INSERT INTO campaign
      (name, code, status, description, type, target, start_date, end_date, location, note, create_date)
      VALUES (?,?,?,?,?,?,?,?,?,?,NOW())";
    $stmt = mysqli_prepare($connection,$sql);
    mysqli_stmt_bind_param($stmt,"ssisssssss",
      $name,$code,$status,$description,$type,$target,$begin,$end,$location,$note);
}

// ===== execute =====
if (mysqli_stmt_execute($stmt)) {
    $newId = !empty($id) ? $id : mysqli_insert_id($connection);

    // ===== query จำนวนทั้งหมด + แยกสถานะ =====
    $countSql = "SELECT COUNT(*) as total FROM campaign";
    $result = mysqli_query($connection,$countSql);
    $total = (int)mysqli_fetch_assoc($result)['total'];

    $statusCountSql = "SELECT status, COUNT(*) as cnt FROM campaign GROUP BY status";
    $resultStatus = mysqli_query($connection,$statusCountSql);
    $statusCounts = [];
    while($row = mysqli_fetch_assoc($resultStatus)){
        $statusCounts[$row['status']] = (int)$row['cnt'];
    }

    echo json_encode([
        "success" => true,
        "id" => $newId,
        "total" => $total,
        "statusCounts" => $statusCounts
    ]);
} else {
    echo json_encode([
        "success"=>false,
        "message"=>mysqli_error($connection)
    ]);
}

mysqli_close($connection);
?>
