<?php

header('Content-Type: application/json; charset=utf-8');

include_once __DIR__ . '/../dbconfig.php';
include_once __DIR__ . '/../dbconnect.php';


// ============================ Function ============================

function loadCustomerOptionsTypeAreas($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name, sort_order, is_active FROM customer_options_type_areas");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadCustomerOptionsAreaNames($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, code, name, sort_order, is_active FROM customer_options_area_names");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadCustomerOptionsSegments($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, code, name, sort_order, is_active FROM customer_options_segments");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadCustomerOptionsGrades($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, code, name, sort_order, is_active FROM customer_options_grades");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadCustomerOptionsSizes($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, code, name, sort_order, is_active FROM customer_options_sizes");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}



// ============================ Condition ============================
$include = isset($_GET["include"]) ? explode(",", $_GET["include"]) : ["TypeAreas", "AreaNames","Segments", "Grades", "Sizes"]; 
$response = [];
if (in_array("TypeAreas", $include)) {
  $response["TypeAreas"] = loadCustomerOptionsTypeAreas($connection);
}
if (in_array("AreaNames", $include)) {
  $response["AreaNames"] = loadCustomerOptionsAreaNames($connection);
}
if (in_array("Segments", $include)) {
  $response["Segments"] = loadCustomerOptionsSegments($connection);
}
if (in_array("Grades", $include)) {
  $response["Grades"] = loadCustomerOptionsGrades($connection);
}
if (in_array("Sizes", $include)) {
  $response["Sizes"] = loadCustomerOptionsSizes($connection);
}

mysqli_close($connection);
echo json_encode($response, JSON_UNESCAPED_UNICODE);