<?php
include "dbconfig.php";
include "dbconnect.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;

if (!$id) {
  echo json_encode(["error" => "Missing campaign ID"]);
  exit;
}

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
?>