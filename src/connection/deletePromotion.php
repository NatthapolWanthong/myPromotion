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

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // ดึง campaign_id ของ promotion ที่จะลบ
    $getCampaignSql = "SELECT campaign_id FROM promotion WHERE id = ?";
    $stmtCampaign = $connection->prepare($getCampaignSql);
    $stmtCampaign->bind_param("i", $id);
    $stmtCampaign->execute();
    $stmtCampaign->bind_result($campaign_id);
    if (!$stmtCampaign->fetch()) {
        throw new Exception("Promotion ID นี้ไม่มีอยู่");
    }
    $stmtCampaign->close();

    // ลบ promotion
    $deleteSql = "DELETE FROM promotion WHERE id = ?";
    $stmtDelete = $connection->prepare($deleteSql);
    $stmtDelete->bind_param("i", $id);
    $stmtDelete->execute();
    $stmtDelete->close();

    // query จำนวน promotion ล่าสุดสำหรับ campaign นี้
    $countSql = "SELECT COUNT(*) as total FROM promotion WHERE campaign_id = ?";
    $countStmt = $connection->prepare($countSql);
    $countStmt->bind_param("i", $campaign_id);
    $countStmt->execute();
    $countStmt->bind_result($totalPromotions);
    $countStmt->fetch();
    $countStmt->close();

    // อัปเดต field promotion ของ campaign
    $updateCampaignSql = "UPDATE campaign SET promotion = ? WHERE id = ?";
    $stmtUpdate = $connection->prepare($updateCampaignSql);
    $stmtUpdate->bind_param("ii", $totalPromotions, $campaign_id);
    $stmtUpdate->execute();
    $stmtUpdate->close();

    // query จำนวน promotion ล่าสุดเฉพาะ campaign นี้
    $countSql = "SELECT COUNT(*) as total FROM promotion WHERE campaign_id = ?";
    $countStmt = $connection->prepare($countSql);
    $countStmt->bind_param("i", $campaign_id);
    $countStmt->execute();
    $countStmt->bind_result($totalPromotions);
    $countStmt->fetch();
    $countStmt->close();

    // ใช้ totalPromotions เป็นจำนวนทั้งหมดของ campaign นี้
    $total = $totalPromotions;

    // query statusCounts ของ campaign
    $statusCountSql = "SELECT status, COUNT(*) as cnt FROM promotion WHERE campaign_id=? GROUP BY status";
    $statusStmt = $connection->prepare($statusCountSql);
    $statusStmt->bind_param("i", $campaign_id);
    $statusStmt->execute();
    $resultStatus = $statusStmt->get_result();

    $statusCounts = [];
    while ($row = mysqli_fetch_assoc($resultStatus)) {
        $statusCounts[$row['status']] = (int)$row['cnt'];
    }
    $statusStmt->close();

    echo json_encode([
        "success" => true,
        "total" => $total,
        "statusCounts" => $statusCounts
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$connection->close();
?>
