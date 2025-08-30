<?php 
	include "../../co dbconfig.php";
	include "dbconnect.php";
	

    $sql = "SELECT u.* FROM user AS u
		JOIN user_permit AS up ON (u.user_id = up.user_id) AND up.web_status_id IN ('00302', '00304', '00305', '00311')
		WHERE u.`name` LIKE ? OR u.`first_name` LIKE ? OR u.`last_name` LIKE ? ORDER BY u.name";
	
	$stmt = mysqli_prepare($connection, $sql);
	//mysqli_stmt_bind_param($stmt, "sss", $searchtxt, $searchtxt, $searchtxt);
	mysqli_stmt_execute($stmt);
	$result = mysqli_stmt_get_result($stmt);
	$dbdata = array();
	while($data = mysqli_fetch_array($result, MYSQLI_ASSOC)){
		$dbdata[] = array("value"=>$data['user_id'], "label"=>$data['name']." ".$data['first_name']." ".$data['last_name']);
	}
	mysqli_close($connection);
	
	echo json_encode($dbdata);
?>