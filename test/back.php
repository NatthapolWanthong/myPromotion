<?php
$name = $_POST['name'] ?? 'ไม่มี';
$age = $_POST['age'] ?? 'ไม่มี';

echo "ได้รับข้อมูลแล้ว: $name ($age ปี)";