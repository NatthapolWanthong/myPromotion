<?php
// ใส่ type เพื่อเอาประเภทของกิจกรรม
// ใส่ target เพื่อเอาชนิดของกิจกรรม
// ใส่ promotionType เพื่อเอาประเภทของโปรโมชั่น
// ใส่ promotionTarget เพื่อเอาสิทธิ์การใช้งานของโปรโมชั่น
// ใส่ status เพื่อเอาสถานะของกิจกรรม
// ใส่ mainStatus เพื่อเอาสถานะหลักของกิจกรรม
// ใส่ conditionAction เพื่อเอาเงื่อนไข Action
// ใส่ conditionObjectType เพื่อเอาประเภทเงื่อนไข Object
// ใส่ conditionRewardObjectType เพื่อเอาประเภทเงื่อนไข Reward Object

header('Content-Type: application/json; charset=utf-8');
include "./dbconfig.php";
include "./dbconnect.php";


// ============================ Function ============================
function loadType($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name FROM campaign_type");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[$row["id"]] = $row["name"];
  }
  return $data;
}

function loadTarget($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name FROM campaign_target");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[$row["id"]] = $row["name"];
  }
  return $data;
}

function loadPromotionType($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name FROM promotion_type");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[$row["id"]] = $row["name"];
  }
  return $data;
}

function loadPromotionTarget($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name FROM promotion_target");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[$row["id"]] = $row["name"];
  }
  return $data;
}

function loadStatus($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name, short_name, thai_name , id_main, icon FROM status");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadConditionAction($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name, th_name FROM condition_action");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadConditionObject($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name, th_name FROM condition_object");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadConditionRewardAction($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name, th_name FROM condition_reward_action");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadConditionRewardObject($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name, th_name FROM condition_reward_object");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadProducts($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, category_id, sku, name_en, name_th, brand, description, created_at, updated_at FROM products");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadProductsCategories($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, name_en, name_th, description FROM products_categories");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadConditionLinkProduct($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, condition_id, product_id FROM condition_link_product");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}

function loadConditionLinkProductCategories($conn) {
  $data = [];
  $res = mysqli_query($conn, "SELECT id, condition_id, category_id FROM condition_link_category");
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  return $data;
}


// ============================ Condition ============================
$include = isset($_GET["include"]) ? explode(",", $_GET["include"]) : ["type", "target","promotionType", "promotionTarget", "status", "conditionAction", "conditionObject", "conditionRewardAction", "conditionRewardObject", "Products", "ProductsCategories", "ConditionLinkProduct", "ConditionLinkProductCategories"]; 
$response = [];
if (in_array("type", $include)) {
  $response["type"] = loadType($connection);
}
if (in_array("target", $include)) {
  $response["target"] = loadTarget($connection);
}
if (in_array("promotionType", $include)) {
  $response["promotionType"] = loadPromotionType($connection);
}
if (in_array("promotionTarget", $include)) {
  $response["promotionTarget"] = loadPromotionTarget($connection);
}
if (in_array("status", $include)) {
  $response["status"] = loadStatus($connection);
}
if (in_array("conditionAction", $include)) {
  $response["conditionAction"] = loadConditionAction($connection);
}
if (in_array("conditionObject", $include)) {
  $response["conditionObject"] = loadConditionObject($connection);
}
if (in_array("conditionRewardAction", $include)) {
  $response["conditionRewardAction"] = loadConditionRewardAction($connection);
}
if (in_array("conditionRewardObject", $include)) {
  $response["conditionRewardObject"] = loadConditionRewardObject($connection);
}
if (in_array("Products", $include)) {
  $response["Products"] = loadProducts($connection);
}
if (in_array("ProductsCategories", $include)) {
  $response["ProductsCategories"] = loadProductsCategories($connection);
}
if (in_array("ConditionLinkProduct", $include)) {
  $response["ConditionLinkProduct"] = loadConditionLinkProduct($connection);
}
if (in_array("ConditionLinkProductCategories", $include)) {
  $response["ConditionLinkProductCategories"] = loadConditionLinkProductCategories($connection);
}

mysqli_close($connection);
echo json_encode($response, JSON_UNESCAPED_UNICODE);