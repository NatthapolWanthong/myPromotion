<?php
header("Content-Type: application/json; charset=utf-8");

include_once(__DIR__ . "/dbconfig.php");
include_once(__DIR__ . "/dbconnect.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? "";

if (!$id) {
    echo json_encode(["success" => false, "message" => "ไม่พบ ID ที่จะลบ"]);
    exit;
}

// ลบ campaign
$sql = "DELETE FROM campaign WHERE id = ?";
$stmt = $connection->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    // ===== query จำนวนทั้งหมด + แยกสถานะ =====
    $countSql = "SELECT COUNT(*) as total FROM campaign";
    $result = mysqli_query($connection, $countSql);
    $total = (int)mysqli_fetch_assoc($result)['total'];

    $statusCountSql = "SELECT status, COUNT(*) as cnt FROM campaign GROUP BY status";
    $resultStatus = mysqli_query($connection, $statusCountSql);
    $statusCounts = [];
    while ($row = mysqli_fetch_assoc($resultStatus)) {
        $statusCounts[$row['status']] = (int)$row['cnt'];
    }

    echo json_encode([
        "success" => true,
        "total" => $total,
        "statusCounts" => $statusCounts
    ]);

} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$connection->close();
?>