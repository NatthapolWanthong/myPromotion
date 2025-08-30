<?php

//$output = array("a" => "กระตุ้นยอด", "b" => "เปิดตัวสินค้าใหม่", "c" => "รักษาฐานลูกค้าเก่า");
//echo json_encode($output);

include "../../connection/dbconfig.php";
include "../../connection/dbconnect.php";

$sql = "SELECT `id`, `code`, `name` FROM `campaign_target`";

$stmt = mysqli_prepare($connection, $sql);
//mysqli_stmt_bind_param($stmt, "sss", $searchtxt, $searchtxt, $searchtxt);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$dbdata = array();
while ($data = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
	$dbdata[$data["id"]] = $data["name"];
}
mysqli_close($connection);

echo json_encode($dbdata);