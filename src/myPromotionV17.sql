-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 27, 2025 at 10:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `promotion`
--

-- --------------------------------------------------------

--
-- Table structure for table `campaign`
--

CREATE TABLE `campaign` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `status` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `type` int(10) UNSIGNED DEFAULT NULL,
  `target` int(10) UNSIGNED DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `create_date` datetime NOT NULL DEFAULT current_timestamp(),
  `edit_date` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `promotion` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campaign_target`
--

CREATE TABLE `campaign_target` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campaign_target`
--

INSERT INTO `campaign_target` (`id`, `name`) VALUES
(1, 'ลูกค้าเกรด A'),
(2, 'ร้านค้าขนาดใหญ่'),
(3, 'ลูกค้าใหม่');

-- --------------------------------------------------------

--
-- Table structure for table `campaign_type`
--

CREATE TABLE `campaign_type` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campaign_type`
--

INSERT INTO `campaign_type` (`id`, `name`) VALUES
(1, 'กระตุ้นยอด'),
(2, 'เปิดตัวสินค้าใหม่'),
(3, 'รักษาฐานลูกค้าเก่า');

-- --------------------------------------------------------

--
-- Table structure for table `condition`
--

CREATE TABLE `condition` (
  `id` int(10) UNSIGNED NOT NULL,
  `promotion_id` int(10) UNSIGNED DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `campaign_id` int(10) UNSIGNED DEFAULT NULL,
  `condition_name` varchar(255) DEFAULT NULL,
  `condition_xml` longtext DEFAULT NULL,
  `condition_code` longtext DEFAULT NULL,
  `code_lang` varchar(32) DEFAULT 'php',
  `version` varchar(32) DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `condition_action`
--

CREATE TABLE `condition_action` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `th_name` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `condition_action`
--

INSERT INTO `condition_action` (`id`, `name`, `th_name`) VALUES
(1, 'buy', 'ซื้อ'),
(2, 'cheer', 'เชียร์'),
(3, 'display', 'จัดแสดง'),
(4, 'join', 'เข้าร่วม'),
(5, 'accumulate', 'สะสมยอด');

-- --------------------------------------------------------

--
-- Table structure for table `condition_object`
--

CREATE TABLE `condition_object` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `th_name` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `condition_object`
--

INSERT INTO `condition_object` (`id`, `name`, `th_name`) VALUES
(1, 'product', 'สินค้า'),
(2, 'customer', 'ลูกค้า'),
(3, 'promotion', 'โปรโมชั่น'),
(4, 'event', 'กิจกรรม');

-- --------------------------------------------------------

--
-- Table structure for table `condition_reward_action`
--

CREATE TABLE `condition_reward_action` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `th_name` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `condition_reward_action`
--

INSERT INTO `condition_reward_action` (`id`, `name`, `th_name`) VALUES
(1, 'discount', 'ส่วนลด'),
(2, 'gift', 'ของแถม'),
(3, 'point', 'คะแนน'),
(4, 'a', 'ค่าหยิบ');

-- --------------------------------------------------------

--
-- Table structure for table `condition_reward_object`
--

CREATE TABLE `condition_reward_object` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `th_name` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `condition_reward_object`
--

INSERT INTO `condition_reward_object` (`id`, `name`, `th_name`) VALUES
(1, 'product', 'สินค้า'),
(2, 'golden', 'ทอง'),
(3, 'shirt', 'เสื้อ'),
(4, 'car', 'รถ');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` int(11) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type_area_id` int(11) DEFAULT NULL,
  `area_name_id` int(11) DEFAULT NULL,
  `segment_id` int(11) DEFAULT NULL,
  `grade_id` int(11) DEFAULT NULL,
  `size_id` int(11) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `code`, `name`, `type_area_id`, `area_name_id`, `segment_id`, `grade_id`, `size_id`, `province`, `district`, `created_by`, `created_at`, `updated_at`) VALUES
(5385, 'HW-C0413', 'จ.รุ่งเรืxxxxxxxx', 1, 9, 1, 2, 1, 'ชลบุรี', 'บางละมุง', NULL, '2025-09-23 18:03:12', NULL),
(5402, 'HW-R0186', 'ระยองตังเซxxxxxxxx', 1, 9, 1, 1, 3, 'ระยอง', 'เมืองระยอง', NULL, '2025-09-23 18:03:12', NULL),
(5416, 'HW-J0181', 'จตุปริญญาวxxxxxxxx', 1, 9, 1, 1, 1, 'ชลบุรี', 'บ้านบึง', NULL, '2025-09-23 18:03:12', NULL),
(5469, 'HW-J0029', 'จตุรประภา xxxxxxxx', 1, 9, 1, 1, 3, 'ชลบุรี', 'พนัสนิคม', NULL, '2025-09-23 18:03:12', NULL),
(5553, 'RO-A0001', 'อำนวยสิน โxxxxxxxx', 2, 10, 4, 1, 2, 'ปราจีนบุรี', 'บ้านสร้าง', NULL, '2025-09-23 18:03:12', NULL),
(6058, 'HW-R0121', 'รุ่งเจริญสxxxxxxxx', 1, 8, 1, 1, 3, 'กรุงเทพมหานคร', 'บางแค', NULL, '2025-09-23 18:03:12', NULL),
(6253, 'RO-C005', 'ชวนิชคอนกรxxxxxxxx', 2, 13, 4, 1, 2, 'นครสวรรค์', 'เมืองนครสวรรค์', NULL, '2025-09-23 18:03:12', NULL),
(6254, 'HW-C0179', 'ช.ประดิษฐ์xxxxxxxx', 1, 13, 1, 1, 2, 'นครสวรรค์', 'ท่าตะโก', NULL, '2025-09-23 18:03:12', NULL),
(6256, 'HW-B0124', 'บุญส่งคอนกxxxxxxxx', 1, 12, 1, 1, 3, 'พิจิตร', 'บีงนาราง', NULL, '2025-09-23 18:03:12', NULL),
(6259, 'RO-T0011', 'เทพวรชัยคอxxxxxxxx', 2, 12, 5, 1, 3, 'พิษณุโลก', 'เมืองพิษณุโลก', NULL, '2025-09-23 18:03:12', NULL),
(6260, 'HW-P0429', 'ป.ไพบูลย์ xxxxxxxx', 1, 12, 1, 1, 2, 'พิษณุโลก', 'เมืองพิษณุโลก', NULL, '2025-09-23 18:03:12', NULL),
(6268, 'HW-C0001B', 'ไทย-ไทย ต้xxxxxxxx', 1, 12, 1, 1, 3, 'พิษณุโลก', 'เมืองพิษณุโลก', NULL, '2025-09-23 18:03:12', NULL),
(6277, 'RO-T0033', 'ตึกน้ำเงินxxxxxxxx', 2, 13, 5, 1, 2, 'นครสวรรค์', 'เมืองนครสวรรค์', NULL, '2025-09-23 18:03:12', NULL),
(6278, 'RO-T0173', 'ไทยดำรงค์พxxxxxxxx', 2, 12, 5, 1, 3, 'พิษณุโลก', 'เมืองพิษณุโลก', NULL, '2025-09-23 18:03:12', NULL),
(6288, 'HW-S0733', 'สมพงษ์เมทอxxxxxxxx', 1, 12, 1, 1, 2, 'พิษณุโลก', 'เมืองพิษณุโลก', NULL, '2025-09-23 18:03:12', NULL),
(6401, 'HW-P0436', 'ป.วัสดุ บ้xxxxxxxx', 1, 13, 1, 1, 2, 'อุทัยธานี', 'บ้านไร่', NULL, '2025-09-23 18:03:12', NULL),
(6439, 'RO-B0001', 'บ.กรุงไทย xxxxxxxx', 2, 2, 4, 1, 2, 'กรุงเทพมหานคร', 'สะพานสูง', NULL, '2025-09-23 18:03:12', NULL),
(6495, 'RO-C0007', 'เจริญสิทธิxxxxxxxx', 2, 1, 4, 1, 2, 'กรุงเทพมหานคร', 'บางซื่อ', NULL, '2025-09-23 18:03:12', NULL),
(6667, 'HW-R0043', 'โรซาร์เทรดxxxxxxxx', 1, 9, 1, 1, 2, 'สมุทรปราการ', 'พระประแดง', NULL, '2025-09-23 18:03:12', NULL),
(6670, 'HW-C0083', 'ซิตี้โฮมมาxxxxxxxx', 1, 8, 1, 1, 2, 'กรุงเทพมหานคร', 'บางบอน', NULL, '2025-09-23 18:03:12', NULL),
(6676, 'RO-B0003', 'บิลดิ้ง สโxxxxxxxx', 2, 8, 4, 1, 2, 'กรุงเทพมหานคร', 'ทุ่งครุ', NULL, '2025-09-23 18:03:12', NULL),
(6679, 'HW-C0296', 'คอนแทรคเตอxxxxxxxx', 1, 9, 1, 1, 2, 'สมุทรปราการ', 'พระประแดง', NULL, '2025-09-23 18:03:12', NULL),
(6681, 'HW-K0055', 'กม.15 ปูนทxxxxxxxx', 1, 9, 1, 1, 2, 'สมุทรปราการ', 'บางพลี', NULL, '2025-09-23 18:03:12', NULL),
(6695, 'HW-P0240', 'พร้อมพันธ์xxxxxxxx', 1, 9, 1, 1, 3, 'สมุทรปราการ', 'เมืองสมุทรปราการ', NULL, '2025-09-23 18:03:12', NULL),
(6838, 'HW-S0435', 'ศุภกร วัสดxxxxxxxx', 1, 16, 1, 1, 3, 'พระนครศรีอยุธยา', 'บางไทร', NULL, '2025-09-23 18:03:12', NULL),
(6843, 'RO-S0866', 'แสงภักดีพาxxxxxxxx', 2, 16, 5, 1, 3, 'พระนครศรีอยุธยา', 'วังน้อย', NULL, '2025-09-23 18:03:12', NULL),
(6871, 'HW-M0109', 'ไม้เด็ดก่อxxxxxxxx', 1, 13, 1, 1, 3, 'ลพบุรี', 'โคกสำโรง', NULL, '2025-09-23 18:03:12', NULL),
(6879, 'RO-T0784', 'ที.เอ็น.สตxxxxxxxx', 2, 16, 5, 1, 2, 'พระนครศรีอยุธยา', 'บางปะอิน', NULL, '2025-09-23 18:03:12', NULL),
(6923, 'HW-M0049', 'เคเอ็มที เxxxxxxxx', 1, 13, 1, 4, 3, 'สุพรรณบุรี', 'เดิมบางนางบวช', NULL, '2025-09-23 18:03:12', NULL),
(6986, 'HW-P0355', 'เพชรประสิทxxxxxxxx', 1, 13, 1, 1, 3, 'เพชรบูรณ์', 'เมืองเพชรบูรณ์', NULL, '2025-09-23 18:03:12', NULL),
(7028, 'HW-R0079', ' รุ่งโรจน์xxxxxxxx', 1, 4, 1, 1, 3, 'อุดรธานี', 'เมืองอุดรธานี', NULL, '2025-09-23 18:03:12', NULL),
(7037, 'HW-B0138', 'บัลลังก์วัxxxxxxxx', 1, 4, 1, 1, 3, 'อุดรธานี', 'เมืองอุดรธานี', NULL, '2025-09-23 18:03:12', NULL),
(7039, 'HW-S0636', ' สมปองโฮมพxxxxxxxx', 1, 4, 1, 1, 3, 'อุดรธานี', 'เพ็ญ', NULL, '2025-09-23 18:03:12', NULL),
(7043, 'HW-S0413', 'แสงเพชรxxxxxxxx', 1, 4, 1, 1, 3, 'อุดรธานี', 'เมืองอุดรธานี', NULL, '2025-09-23 18:03:12', NULL),
(7047, 'AK-S0016', '3 ป. รุ่งเxxxxxxxx', 1, 4, 2, 1, 3, 'อุดรธานี', 'เมืองอุดรธานี', NULL, '2025-09-23 18:03:12', NULL),
(7082, 'RO-Y0011AA', 'มาสเตอร์โฮxxxxxxxx', 2, 6, 4, 1, 3, 'เลย', 'หนองหิน', NULL, '2025-09-23 18:03:12', NULL),
(7124, 'HW-N0057', 'น้ำสวยวัสดxxxxxxxx', 1, 4, 1, 1, 3, 'หนองคาย', 'สระใคร', NULL, '2025-09-23 18:03:12', NULL),
(7159, 'RO-U0021', 'อัพโฮมxxxxxxxx', 2, 4, 5, 1, 2, 'หนองคาย', 'รัตนวาปี', NULL, '2025-09-23 18:03:12', NULL),
(7178, 'HW-K0045', 'ก.เจริญคอนxxxxxxxx', 1, 5, 1, 1, 2, 'กาฬสินธุ์', 'ยางตลาด', NULL, '2025-09-23 18:03:12', NULL),
(7201, 'HW-S0589', 'เสรีก่อสร้xxxxxxxx', 1, 6, 1, 3, 2, 'ขอนแก่น', 'หนองสองห้อง', NULL, '2025-09-23 18:03:12', NULL),
(7214, 'AK-K0010', 'เคเค เมททอxxxxxxxx', 1, 6, 2, 1, 2, 'ขอนแก่น', 'เมืองขอนแก่น', NULL, '2025-09-23 18:03:12', NULL),
(7221, 'HW-C0400', 'ช้างชุมแพ xxxxxxxx', 1, 6, 1, 3, 2, 'ขอนแก่น', 'ชุมแพ', NULL, '2025-09-23 18:03:12', NULL),
(7257, 'HW-M0164', 'เม่งฮะ ค้าxxxxxxxx', 1, 6, 1, 3, 2, 'ขอนแก่น', 'หนองเรือ', NULL, '2025-09-23 18:03:12', NULL),
(7260, 'HW-A0257', 'อุทัยเจริญxxxxxxxx', 1, 5, 1, 1, 2, 'กาฬสินธุ์', 'กมลาไสย', NULL, '2025-09-23 18:03:12', NULL),
(7298, 'HW-S0610', 'ศิริธรรมวัxxxxxxxx', 1, 5, 1, 1, 2, 'สกลนคร', 'เจริญศิลป์', NULL, '2025-09-23 18:03:12', NULL),
(7307, 'HW-S0068', 'ทรัพย์ทวีคxxxxxxxx', 1, 5, 1, 1, 2, 'สกลนคร', 'สว่างแดนดิน', NULL, '2025-09-23 18:03:12', NULL),
(7317, 'HK-P0015', 'พิพัฒน์หลัxxxxxxxx', 1, 4, 1, 1, 3, 'บึงกาฬ', 'เซกา', NULL, '2025-09-23 18:03:12', NULL),
(7331, 'HK-K0019', 'เกรียงไกรฮxxxxxxxx', 1, 5, 1, 1, 3, 'สกลนคร', 'เมืองสกลนคร', NULL, '2025-09-23 18:03:12', NULL),
(7332, 'HW-L0078', 'เหรียญทองบxxxxxxxx', 1, 4, 1, 1, 3, 'บึงกาฬ', 'โซ่พิสัย', NULL, '2025-09-23 18:03:12', NULL),
(7348, 'HK-P0001', 'ป.สุทธิสารxxxxxxxx', 1, 4, 1, 1, 2, 'นครพนม', 'เรณูนคร', NULL, '2025-09-23 18:03:12', NULL),
(7374, 'HW-S0211', 'ศิริมงคลโฮxxxxxxxx', 1, 5, 1, 3, 2, 'สกลนคร', 'สว่างแดนดิน', NULL, '2025-09-23 18:03:12', NULL),
(7411, 'HW-C0234AB', 'ชอบเพิ่มพูxxxxxxxx', 1, 4, 1, 1, 2, 'นครพนม', 'ธาตุพนม', NULL, '2025-09-23 18:03:12', NULL),
(7423, 'HW-C0090', 'จุรีภัณฑ์วxxxxxxxx', 1, 4, 1, 1, 3, 'นครพนม', 'ธาตุพนม', NULL, '2025-09-23 18:03:12', NULL),
(7579, 'AG-S0116', 'สุรินทร์เฟxxxxxxxx', 1, 3, 2, 1, 2, 'สุรินทร์', 'เมืองสุรินทร์', NULL, '2025-09-23 18:03:12', NULL),
(7584, 'HW-J0011', 'เจริญกิจ โxxxxxxxx', 1, 3, 1, 1, 2, 'สุรินทร์', 'ปราสาท', NULL, '2025-09-23 18:03:12', NULL),
(7586, 'HW-B0181', 'บูรพาก่อสรxxxxxxxx', 1, 7, 1, 1, 2, 'บุรีรัมย์', 'ลำปลายมาศ', NULL, '2025-09-23 18:03:12', NULL),
(7595, 'HW-S0296', 'สหชัยกรุ๊ปxxxxxxxx', 1, 5, 1, 1, 2, 'ร้อยเอ็ด', 'หนองพอก', NULL, '2025-09-23 18:03:12', NULL),
(7607, 'HK-K0001', 'กิตติศักดิxxxxxxxx', 1, 3, 1, 1, 2, 'ศรีสะเกษ', 'ขุนหาญ', NULL, '2025-09-23 18:03:12', NULL),
(7609, 'HW-H0093', 'โฮมฮักxxxxxxxx', 1, 7, 1, 3, 2, 'บุรีรัมย์', 'พุทไธสง', NULL, '2025-09-23 18:03:12', NULL),
(7637, 'HW-B0191', 'บ้านบัววัสxxxxxxxx', 1, 5, 1, 1, 2, 'ร้อยเอ็ด', 'เมืองร้อยเอ็ด', NULL, '2025-09-23 18:03:12', NULL),
(7712, 'HW-A0019', 'เอี๋ยวฮงxxxxxxxx', 1, 6, 1, 1, 2, 'ชัยภูมิ', 'เมืองชัยภูมิ', NULL, '2025-09-23 18:03:12', NULL),
(7714, 'HW-C0145', 'ชัยพัฒนาค้xxxxxxxx', 1, 6, 1, 1, 2, 'ชัยภูมิ', 'เมืองชัยภูมิ', NULL, '2025-09-23 18:03:12', NULL),
(7721, 'HW-S0651', 'สุขภัณฑ์ปูxxxxxxxx', 1, 7, 1, 1, 2, 'นครราชสีมา', 'เมืองนครราชสีมา', NULL, '2025-09-23 18:03:12', NULL),
(7724, 'HW-B0088', 'บ้านไร่วัสxxxxxxxx', 1, 7, 1, 1, 2, 'นครราชสีมา', 'ปากช่อง', NULL, '2025-09-23 18:03:12', NULL),
(7726, 'HW-K0041', 'โคกกรวดค้าxxxxxxxx', 1, 7, 1, 2, 2, 'นครราชสีมา', 'เมืองนครราชสีมา', NULL, '2025-09-23 18:03:12', NULL),
(7728, 'RO-T0249', 'โตเจริญกรุxxxxxxxx', 2, 7, 5, 1, 2, 'นครราชสีมา', 'เมืองนครราชสีมา', NULL, '2025-09-23 18:03:12', NULL),
(7735, 'HW-C0123B', 'เชิดชัยพัฒxxxxxxxx', 1, 7, 1, 1, 3, 'นครราชสีมา', 'ปากช่อง', NULL, '2025-09-23 18:03:12', NULL),
(7745, 'RO-T0408', 'ไทโฮม 2018xxxxxxxx', 2, 6, 5, 1, 3, 'ชัยภูมิ', 'เกษตรสมบูรณ์', NULL, '2025-09-23 18:03:12', NULL),
(7770, 'HW-N0190', 'นาหนองทุ่มxxxxxxxx', 1, 6, 1, 1, 3, 'ชัยภูมิ', 'ภูเขียว', NULL, '2025-09-23 18:03:12', NULL),
(7771, 'RO-S0792', 'แสงเจริญ หxxxxxxxx', 2, 7, 5, 1, 3, 'นครราชสีมา', 'จักราช', NULL, '2025-09-23 18:03:12', NULL),
(7782, 'RO-S0779', 'ศรีพิพัฒน์xxxxxxxx', 2, 7, 5, 1, 3, 'นครราชสีมา', 'ปากช่อง', NULL, '2025-09-23 18:03:12', NULL),
(7784, 'HW-J0167', 'เจริญผลการxxxxxxxx', 1, 6, 1, 1, 3, 'ชัยภูมิ', 'ภูเขียว', NULL, '2025-09-23 18:03:12', NULL),
(7788, 'HW-B0179', 'บายพาสโฮม xxxxxxxx', 1, 7, 1, 3, 3, 'นครราชสีมา', 'เมืองนครราชสีมา', NULL, '2025-09-23 18:03:12', NULL),
(7798, 'HW-P0040', 'ป.ภัณฑ์วัสxxxxxxxx', 1, 7, 1, 1, 2, 'นครราชสีมา', 'เมืองนครราชสีมา', NULL, '2025-09-23 18:03:12', NULL),
(7960, 'HK-T0008', 'ต้นมะม่วงคxxxxxxxx', 1, 6, 1, 1, 2, 'ชัยภูมิ', 'เทพสถิต', NULL, '2025-09-23 18:03:12', NULL),
(8007, 'HW-C0189', 'ชุมพรตั้งฮxxxxxxxx', 1, 14, 1, 1, 2, 'ชุมพร', 'เมืองชุมพร', NULL, '2025-09-23 18:03:12', NULL),
(8008, 'HW-C0323', 'ชาลีค้าวัสxxxxxxxx', 1, 15, 1, 2, 3, 'ภูเก็ต', 'ถลาง', NULL, '2025-09-23 18:03:12', NULL),
(8009, 'HW-C0354', 'ชัยยันต์ คxxxxxxxx', 1, 15, 1, 1, 3, 'พังงา', 'ท้ายเหมือง', NULL, '2025-09-23 18:03:12', NULL),
(8011, 'HW-H0010', 'หัวถนน(สุรxxxxxxxx', 1, 14, 1, 4, 2, 'สุราษฎร์ธานี', 'เมืองสุราษฎร์ธานี', NULL, '2025-09-23 18:03:12', NULL),
(8024, 'HW-P0107', 'พงษ์ภัณฑ์เxxxxxxxx', 1, 14, 1, 1, 2, 'สุราษฎร์ธานี', 'เวียงสระ', NULL, '2025-09-23 18:03:12', NULL),
(8064, 'HW-K0429', 'เกาะแก้วชัxxxxxxxx', 1, 15, 1, 1, 2, 'ภูเก็ต', 'เมืองภูเก็ต', NULL, '2025-09-23 18:03:12', NULL),
(8074, 'HW-J0041', 'จอมทองเคหะxxxxxxxx', 1, 15, 3, 1, 2, 'ภูเก็ต', 'เมืองภูเก็ต', NULL, '2025-09-23 18:03:12', NULL),
(8075, 'HW-J0137', 'จินตนาค้าวxxxxxxxx', 1, 15, 1, 1, 3, 'พังงา', 'ตะกั่วป่า', NULL, '2025-09-23 18:03:12', NULL),
(8121, 'HW-K0023', 'คูขุดค้าวัxxxxxxxx', 1, 15, 1, 1, 2, 'สงขลา', 'เมืองสงขลา', NULL, '2025-09-23 18:03:12', NULL),
(8126, 'HW-L0084', 'ลี วัสดุก่xxxxxxxx', 1, 15, 1, 1, 2, 'กระบี่', 'คลองท่อม', NULL, '2025-09-23 18:03:12', NULL),
(8131, 'HW-P0010', 'พงษ์สินค้าxxxxxxxx', 1, 15, 1, 1, 2, 'สงขลา', 'เมืองสงขลา', NULL, '2025-09-23 18:03:12', NULL),
(8235, 'RO-Y0012', 'ยุ่ยล้งนครxxxxxxxx', 2, 14, 4, 1, 2, 'นครศรีธรรมราช', 'เมืองนครศรีธรรมราช', NULL, '2025-09-23 18:03:12', NULL),
(8334, 'HW-C0348', 'เชียงใหม่มxxxxxxxx', 1, 11, 1, 1, 2, 'เชียงใหม่', 'เมืองเชียงใหม่', NULL, '2025-09-23 18:03:12', NULL),
(8377, 'HW-K0142', 'กำไลทองวัสxxxxxxxx', 1, 11, 1, 1, 1, 'เชียงใหม่', 'ฝาง', NULL, '2025-09-23 18:03:12', NULL),
(8389, 'HW-L0021', 'ลำปางเหลี่xxxxxxxx', 1, 11, 1, 1, 2, 'ลำปาง', 'เมืองลำปาง', NULL, '2025-09-23 18:03:12', NULL),
(8421, 'HW-P0238', 'พร้าวสินไพxxxxxxxx', 1, 11, 1, 1, 3, 'เชียงใหม่', 'พร้าว', NULL, '2025-09-23 18:03:12', NULL),
(8475, 'RO-S0740A', 'จ.เจริญค้าxxxxxxxx', 2, 11, 5, 1, 3, 'ตาก', 'แม่สอด', NULL, '2025-09-23 18:03:12', NULL),
(8480, 'RO-T0008', 'ทวีพรรณวัสxxxxxxxx', 2, 11, 5, 1, 2, 'เชียงใหม่', 'เมืองเชียงใหม่', NULL, '2025-09-23 18:03:12', NULL),
(8485, 'RO-T0047', 'ชัยเสถียร xxxxxxxx', 2, 11, 5, 1, 2, 'เชียงใหม่', 'ไชยปราการ', NULL, '2025-09-23 18:03:12', NULL),
(8529, 'RO-C002', 'วีระพานิช xxxxxxxx', 2, 11, 4, 1, 2, 'เชียงใหม่', 'เมืองเชียงใหม่', NULL, '2025-09-23 18:03:12', NULL),
(8530, 'RO-C003', 'เชียงใหม่ xxxxxxxx', 2, 11, 4, 1, 2, 'เชียงใหม่', 'หางดง', NULL, '2025-09-23 18:03:12', NULL),
(8532, 'RO-C001', 'เชียงใหม่วxxxxxxxx', 2, 11, 4, 1, 2, 'เชียงใหม่', 'ดอยสะเก็ด', NULL, '2025-09-23 18:03:12', NULL),
(8646, 'HW-J0030A', 'เจอาร์เอ็นxxxxxxxx', 1, 11, 1, 1, 2, 'เชียงใหม่', 'ฝาง', NULL, '2025-09-23 18:03:12', NULL),
(8684, 'RO-S0740', 'สิทธิพลค้าxxxxxxxx', 2, 11, 5, 1, 3, 'ตาก', 'แม่สอด', NULL, '2025-09-23 18:03:12', NULL),
(8926, 'HW-S0171', 'ส.เอื้อสุขxxxxxxxx', 1, 16, 1, 3, 3, 'กาญจนบุรี', 'ท่าม่วง', NULL, '2025-09-23 18:03:12', NULL),
(9016, 'HW-P0253', 'โอเค โฮมพลxxxxxxxx', 1, 3, 1, 1, 2, 'อุบลราชธานี', 'เดชอุดม', NULL, '2025-09-23 18:03:12', NULL),
(9020, 'HW-J0010', 'จั่วเซ้งยโxxxxxxxx', 1, 5, 1, 1, 2, 'ยโสธร', 'เมืองยโสธร', NULL, '2025-09-23 18:03:12', NULL),
(9023, 'HW-L0114', 'ละลมวัสดุxxxxxxxx', 1, 3, 1, 1, 3, 'ศรีสะเกษ', 'ภูสิงห์', NULL, '2025-09-23 18:03:12', NULL),
(9024, 'HW-R0183', 'รุ่งเรืองหxxxxxxxx', 1, 3, 1, 1, 3, 'ศรีสะเกษ', 'กันทรลักษ์', NULL, '2025-09-23 18:03:12', NULL),
(9046, 'RO-S0799', ' ศักดิ์ไทยxxxxxxxx', 2, 3, 5, 1, 3, 'ศรีสะเกษ', 'ศรีรัตนะ', NULL, '2025-09-23 18:03:12', NULL),
(9153, 'RO-V0048', 'วิเชียรเคหxxxxxxxx', 2, 1, 4, 1, 2, 'ปทุมธานี', 'คลองหลวง', NULL, '2025-09-23 18:03:12', NULL),
(9156, 'RO-C0020', 'ซีીએમเอ็มxxxxxxxx', 2, 1, 4, 1, 2, 'ปทุมธานี', 'ลาดหลุมแก้ว', NULL, '2025-09-23 18:03:12', NULL),
(9158, 'RO-V0008', 'วานิชโฮมมาxxxxxxxx', 2, 1, 5, 1, 2, 'ปทุมธานี', 'คลองหลวง', NULL, '2025-09-23 18:03:12', NULL),
(9162, 'HW-S0385', ' ส.ธนทรัพยxxxxxxxx', 1, 1, 1, 1, 2, 'ปทุมธานี', 'คลองหลวง', NULL, '2025-09-23 18:03:12', NULL),
(9164, 'RO-V0119', ' วิเชียร เxxxxxxxx', 2, 1, 4, 1, 2, 'ปทุมธานี', 'คลองหลวง', NULL, '2025-09-23 18:03:12', NULL),
(9168, 'HW-S0478', 'ท่าทรายลิ้xxxxxxxx', 1, 1, 3, 1, 2, 'ปทุมธานี', 'ธัญบุรี', NULL, '2025-09-23 18:03:12', NULL),
(9173, 'RO-V0083B', 'บีเอ็ม & เxxxxxxxx', 2, 16, 4, 1, 2, 'พระนครศรีอยุธยา', 'บางปะหัน', NULL, '2025-09-23 18:03:12', NULL),
(9208, 'RO-T0321', 'ทวีศักดิ์ xxxxxxxx', 2, 1, 5, 3, 2, 'ปทุมธานี', 'คลองหลวง', NULL, '2025-09-23 18:03:12', NULL),
(9212, 'HW-S0227', 'ทองทวีทรัพxxxxxxxx', 1, 1, 1, 1, 2, 'ปทุมธานี', 'ลำลูกกา', NULL, '2025-09-23 18:03:12', NULL),
(9215, 'RO-C0006', 'ไชยฮวด โฮมxxxxxxxx', 2, 1, 4, 1, 2, 'ปทุมธานี', 'เมืองปทุมธานี', NULL, '2025-09-23 18:03:12', NULL),
(9243, 'HW-C0187', 'เซ็นเตอร์รxxxxxxxx', 1, 1, 1, 4, 2, 'ปทุมธานี', 'ธัญบุรี', NULL, '2025-09-23 18:03:12', NULL),
(9254, 'HW-K0069E', 'เกียรติทวีxxxxxxxx', 1, 1, 1, 1, 2, 'ปทุมธานี', 'ลำลูกกา', NULL, '2025-09-23 18:03:12', NULL),
(9265, 'RO-S1081', 'ทองทวีทรัพxxxxxxxx', 2, 1, 5, 3, 2, 'ปทุมธานี', 'ลำลูกกา', NULL, '2025-09-23 18:03:12', NULL),
(9273, 'HW-A0038', 'เอกสตีล จำxxxxxxxx', 1, 1, 1, 1, 2, 'ปทุมธานี', 'ธัญบุรี', NULL, '2025-09-23 18:03:12', NULL),
(10360, 'HK-T0004', 'เทพคีรีวัสxxxxxxxx', 1, 6, 1, 4, 3, 'หนองบัวลำภู', 'นาวัง', NULL, '2025-09-23 18:03:12', NULL),
(10403, 'HW-K0192', 'คูบ้วนเส็งxxxxxxxx', 1, 4, 1, 1, 2, 'หนองคาย', 'ท่าบ่อ', NULL, '2025-09-23 18:03:12', NULL),
(10751, 'HK-R0008', 'ริริน จำกัxxxxxxxx', 1, 5, 1, 1, 2, 'สกลนคร', 'พรรณานิคม', NULL, '2025-09-23 18:03:12', NULL),
(10823, 'RO-T0309', 'นครหลวงวัสxxxxxxxx', 2, 4, 5, 1, 3, 'นครพนม', 'ท่าอุเทน', NULL, '2025-09-23 18:03:12', NULL),
(11123, 'HK-C0019', 'ชัยสว่างเสxxxxxxxx', 1, 7, 1, 1, 3, 'บุรีรัมย์', 'หนองหงส์', NULL, '2025-09-23 18:03:12', NULL),
(11331, 'HW-A0183', 'ออดเสาปูนxxxxxxxx', 1, 7, 1, 1, 2, 'นครราชสีมา', 'ชุมพวง', NULL, '2025-09-23 18:03:12', NULL),
(11387, 'HW-M0024', 'มงคลค้าไมxxxxxxxx', 1, 7, 1, 1, 2, 'นครราชสีมา', 'เมืองนครราชสีมา', NULL, '2025-09-23 18:03:12', NULL),
(11466, 'HW-R0194AA', 'พงศกร มีสิxxxxxxxx', 1, 3, 1, 1, 3, 'อุบลราชธานี', 'น้ำยืน', NULL, '2025-09-23 18:03:12', NULL),
(11615, 'HW-K0208', 'ควอลิตี้ โxxxxxxxx', 1, 15, 1, 3, 2, 'ภูเก็ต', 'ถลาง', NULL, '2025-09-23 18:03:12', NULL),
(11967, 'HW-A0230', 'อนันต์ค้าวxxxxxxxx', 1, 9, 1, 1, 3, 'ชลบุรี', 'ศรีราชา', NULL, '2025-09-23 18:03:12', NULL),
(12012, 'HW-P0088', 'พันหมื่นล้xxxxxxxx', 1, 9, 1, 2, 1, 'ระยอง', 'นิคมพัฒนา', NULL, '2025-09-23 18:03:12', NULL),
(12435, 'HW-M0058', 'มณฑลวัสดุภxxxxxxxx', 1, 1, 1, 3, 2, 'ปทุมธานี', 'คลองหลวง', NULL, '2025-09-23 18:03:12', NULL),
(12513, 'RO-T0085', 'ไทยนพวงศ์ xxxxxxxx', 2, 1, 5, 4, 2, 'ปทุมธานี', 'ลาดหลุมแก้ว', NULL, '2025-09-23 18:03:12', NULL),
(12847, 'HW-C0042', 'ซีเอสเค โฮxxxxxxxx', 1, 8, 1, 1, 2, 'นนทบุรี', 'เมืองนนทบุรี', NULL, '2025-09-23 18:03:12', NULL),
(12869, 'HW-K0091', 'เค.วี.เซ็นxxxxxxxx', 1, 8, 1, 3, 3, 'นนทบุรี', 'บางบัวทอง', NULL, '2025-09-23 18:03:12', NULL),
(12880, 'HW-L0068', 'ลิน คอนส์ xxxxxxxx', 1, 8, 1, 1, 2, 'นนทบุรี', 'เมืองนนทบุรี', NULL, '2025-09-23 18:03:12', NULL),
(12884, 'HW-M0001A', 'เมืองทอง โxxxxxxxx', 1, 8, 1, 1, 3, 'นนทบุรี', 'ปากเกร็ด', NULL, '2025-09-23 18:03:12', NULL),
(12908, 'HW-P0126', 'วินน์ พีค xxxxxxxx', 1, 8, 1, 1, 2, 'นนทบุรี', 'บางกรวย', NULL, '2025-09-23 18:03:12', NULL),
(14871, 'HC-C0002', 'เจริญ ค้าวxxxxxxxx', 1, 12, 1, 1, 3, 'เชียงราย', 'เมืองเชียงราย', NULL, '2025-09-23 18:03:12', NULL),
(14877, 'HC-P0003', 'พงษ์ไพศาลวxxxxxxxx', 1, 12, 1, 1, 2, 'เชียงราย', 'แม่สาย', NULL, '2025-09-23 18:03:12', NULL),
(14939, 'HW-D0001', 'ดวงแสงทอง xxxxxxxx', 1, 12, 1, 1, 2, 'เชียงราย', 'พาน', NULL, '2025-09-23 18:03:12', NULL),
(15006, 'HW-M0040', 'เมืองทองโฮxxxxxxxx', 1, 12, 1, 1, 2, 'สุโขทัย', 'เมืองสุโขทัย', NULL, '2025-09-23 18:03:12', NULL),
(15037, 'HW-P0196', 'ช.ซือวัสดุxxxxxxxx', 1, 12, 1, 1, 3, 'เชียงราย', 'เชียงแสน', NULL, '2025-09-23 18:03:12', NULL),
(15039, 'HW-P0198', 'พีเอสที โลxxxxxxxx', 1, 12, 1, 1, 3, 'เชียงราย', 'แม่สาย', NULL, '2025-09-23 18:03:12', NULL),
(15102, 'RO-S0758', 'สานุพัฐ จำxxxxxxxx', 2, 12, 5, 1, 2, 'เชียงราย', 'เทิง', NULL, '2025-09-23 18:03:12', NULL),
(15128, 'RO-V0013', 'เวียงพานทวxxxxxxxx', 2, 12, 5, 1, 2, 'เชียงราย', 'แม่สาย', NULL, '2025-09-23 18:03:12', NULL),
(15140, 'RO-V0132', 'วานิช บล็อxxxxxxxx', 2, 12, 4, 1, 2, 'เชียงราย', 'แม่สรวย', NULL, '2025-09-23 18:03:12', NULL),
(15263, 'RO-A001', 'อัญชลีเคหะxxxxxxxx', 2, 12, 4, 1, 2, 'เชียงราย', 'แม่สาย', NULL, '2025-09-23 18:03:12', NULL),
(15758, 'HW-S0274', 'เสริมพัฒนาxxxxxxxx', 1, 16, 1, 1, 2, 'ราชบุรี', 'เมืองราชบุรี', NULL, '2025-09-23 18:03:12', NULL),
(17325, 'RO-S0949', 'สีให้โชค จxxxxxxxx', 2, 1, 5, 1, 2, 'ปทุมธานี', 'ลำลูกกา', NULL, '2025-09-23 18:03:12', NULL),
(17633, 'HW-J0059', 'ชานนท์วัสดxxxxxxxx', 1, 17, 1, NULL, NULL, 'สปป.ลาว', '', NULL, '2025-09-23 18:03:12', NULL),
(18299, 'HW-M0058B', 'มณฑลวัสดุภxxxxxxxx', 1, 1, 1, 1, 2, 'ปทุมธานี', 'คลองหลวง', NULL, '2025-09-23 18:03:12', NULL),
(18493, 'HK-H0004', 'ห้างหุ้นส่xxxxxxxx', 1, 5, 1, 1, 2, 'สกลนคร', 'พังโคน', NULL, '2025-09-23 18:03:12', NULL),
(19214, 'RO-C007', 'ไชโยโฮลอินxxxxxxxx', 2, 13, 4, 1, 2, 'นครสวรรค์', 'เมืองนครสวรรค์', NULL, '2025-09-23 18:03:12', NULL),
(20066, 'RO-U0023', 'เอื้อศิริโxxxxxxxx', 2, 9, 5, 2, 1, 'ระยอง', 'เมืองระยอง', NULL, '2025-09-23 18:03:12', NULL),
(21582, 'HW-H0099B', 'โฮม สุขภัณฑxxxxxxxx', 1, 11, 1, 4, 3, 'เชียงใหม่', 'สันทราย', NULL, '2025-09-23 18:03:12', NULL),
(21670, 'HK-H0004B', 'ฮะฮงวัสดุxxxxxxxx', 1, 4, 1, 1, 3, 'อุดรธานี', 'หนองหาน', NULL, '2025-09-23 18:03:12', NULL),
(21974, 'HK-N0009', 'เอ็น.ที.ดัxxxxxxxx', 1, 5, 1, 4, 2, 'มหาสารคาม', 'โกสุมพิสัย', NULL, '2025-09-23 18:03:12', NULL),
(22321, 'HK-K0025', 'เคเค คอนกรxxxxxxxx', 1, 3, 1, 1, 2, 'ศรีสะเกษ', 'กันทรลักษ์', NULL, '2025-09-23 18:03:12', NULL),
(23168, 'RO-W0006', 'วัน มี ดี xxxxxxxx', 2, 13, 4, 1, 3, 'ลพบุรี', 'ชัยบาดาล', NULL, '2025-09-23 18:03:12', NULL),
(23214, 'HW-B0037', 'บ.กรุงไทย xxxxxxxx', 1, 1, 1, 1, 2, 'ปทุมธานี', 'ลำลูกกา', NULL, '2025-09-23 18:03:12', NULL),
(23267, 'HW-S0165AC', 'รนุพล ทองนxxxxxxxx', 1, 6, 1, 1, 2, 'ขอนแก่น', 'ชุมแพ', NULL, '2025-09-23 18:03:12', NULL),
(24054, 'RO-W0007', 'วานิชค้าวัxxxxxxxx', 2, 10, 4, 1, 3, 'สระแก้ว', 'เมืองสระแก้ว', NULL, '2025-09-23 18:03:12', NULL),
(25403, 'HK-I0005', 'ไอคอนโฮม 2xxxxxxxx', 1, 5, 1, 1, 2, 'ร้อยเอ็ด', 'เสลภูมิ', NULL, '2025-09-23 18:03:12', NULL),
(25582, 'HW-N0254', 'หนองเขื่อนxxxxxxxx', 1, 14, 1, 1, 3, 'เพชรบุรี', 'ชะอำ', NULL, '2025-09-23 18:03:12', NULL),
(25603, 'RO-V0151AA', 'ที.เอฟ.เอชxxxxxxxx', 2, 1, 4, 1, 2, 'กรุงเทพมหานคร', 'บางซื่อ', NULL, '2025-09-23 18:03:12', NULL),
(26864, 'RO-T0444', 'ทีวายซี รูxxxxxxxx', 2, 8, 5, 1, 2, 'กรุงเทพมหานคร', 'ตลิ่งชัน', NULL, '2025-09-23 18:03:12', NULL),
(27030, 'RO-T0447', 'ไถ่เส็งมหาxxxxxxxx', 2, 9, 5, 2, NULL, 'ชลบุรี', 'เมืองชลบุรี', NULL, '2025-09-23 18:03:12', NULL),
(27845, 'HW-B0247', 'บัวทองศิริxxxxxxxx', 1, 8, 1, 3, 3, 'นนทบุรี', 'บางบัวทอง', NULL, '2025-09-23 18:03:12', NULL),
(27879, 'HK-H0006', 'โฮมเฮาวัสดxxxxxxxx', 1, 6, 1, 3, 2, 'ขอนแก่น', 'น้ำพอง', NULL, '2025-09-23 18:03:12', NULL),
(28668, 'HW-D0090', 'เด็กสร้างบxxxxxxxx', 1, 9, 1, 3, 1, 'ชลบุรี', 'บางละมุง', NULL, '2025-09-23 18:03:12', NULL),
(28850, 'HK-D0009', 'ดีโฮมxxxxxxxx', 1, 3, 1, 2, 2, 'ศรีสะเกษ', 'ขุนหาญ', NULL, '2025-09-23 18:03:12', NULL),
(28970, 'HC-T0013', 'ไทโย บ้านแxxxxxxxx', 1, 12, 1, 1, NULL, 'เชียงราย', 'แม่สรวย', NULL, '2025-09-23 18:03:12', NULL),
(29094, 'HK-D0009B', ' ดีโฮมxxxxxxxx', 1, 3, 1, 3, 2, 'ศรีสะเกษ', 'ขุขันธ์', NULL, '2025-09-23 18:03:12', NULL),
(29161, 'HW-J0059B', 'ชานนท์วัสดxxxxxxxx', 1, 17, 1, NULL, NULL, 'สปป.ลาว', '', NULL, '2025-09-23 18:03:12', NULL),
(2917903, 'HW-C0503', 'ซีเจ ฮาร์ดxxxxxxxx', 1, 9, 1, 2, 2, 'ชลบุรี', 'สัตหีบ', NULL, '2025-09-23 18:03:12', NULL),
(2918224, 'HK-C0045', 'ชัยเจริญ กxxxxxxxx', 1, 5, 1, 3, 2, 'ยโสธร', 'กุดชุม', NULL, '2025-09-23 18:03:12', NULL),
(2918246, 'RO-T0751BA', ' ฒิลา กรุ๊xxxxxxxx', 2, 11, 5, 2, 2, 'เชียงใหม่', 'สันทราย', NULL, '2025-09-23 18:03:12', NULL),
(2918598, 'HK-S0079', 'สีรุ่งรวี xxxxxxxx', 1, 4, 1, 3, 2, 'อุดรธานี', 'เมืองอุดรธานี', NULL, '2025-09-23 18:03:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customer_groups`
--

CREATE TABLE `customer_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `condition_id` int(10) UNSIGNED DEFAULT NULL,
  `promotion_id` int(10) UNSIGNED DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_group_members`
--

CREATE TABLE `customer_group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `added_by` int(11) DEFAULT NULL,
  `added_at` datetime NOT NULL DEFAULT current_timestamp(),
  `select_all` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_options_area_names`
--

CREATE TABLE `customer_options_area_names` (
  `id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_options_area_names`
--

INSERT INTO `customer_options_area_names` (`id`, `code`, `name`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BKK-1', 'BKK-1', 0, 1, '2025-09-23 17:38:07', NULL),
(2, 'BKK-2', 'BKK-2', 0, 1, '2025-09-23 17:38:07', NULL),
(3, 'BKK-3', 'BKK-3', 0, 1, '2025-09-23 17:38:07', NULL),
(4, 'EAST-1', 'EAST-1', 0, 1, '2025-09-23 17:38:07', NULL),
(5, 'EAST-2', 'EAST-2', 0, 1, '2025-09-23 17:38:07', NULL),
(6, 'ESAN-1', 'ESAN-1', 0, 1, '2025-09-23 17:38:07', NULL),
(7, 'ESAN-2', 'ESAN-2', 0, 1, '2025-09-23 17:38:07', NULL),
(8, 'ESAN-3', 'ESAN-3', 0, 1, '2025-09-23 17:38:07', NULL),
(9, 'ESAN-4', 'ESAN-4', 0, 1, '2025-09-23 17:38:07', NULL),
(10, 'ESAN-5', 'ESAN-5', 0, 1, '2025-09-23 17:38:07', NULL),
(11, 'NORTH-1', 'NORTH-1', 0, 1, '2025-09-23 17:38:07', NULL),
(12, 'NORTH-2', 'NORTH-2', 0, 1, '2025-09-23 17:38:07', NULL),
(13, 'NORTH-3', 'NORTH-3', 0, 1, '2025-09-23 17:38:07', NULL),
(14, 'SOUTH-1', 'SOUTH-1', 0, 1, '2025-09-23 17:38:07', NULL),
(15, 'SOUTH-2', 'SOUTH-2', 0, 1, '2025-09-23 17:38:07', NULL),
(16, 'WEST', 'WEST', 0, 1, '2025-09-23 17:38:07', NULL),
(17, 'ลาว', 'ลาว', 0, 1, '2025-09-23 17:38:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customer_options_grades`
--

CREATE TABLE `customer_options_grades` (
  `id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_options_grades`
--

INSERT INTO `customer_options_grades` (`id`, `code`, `name`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'A+', 'A+', 0, 1, '2025-09-23 17:38:07', NULL),
(2, 'A', 'A', 0, 1, '2025-09-23 17:38:07', NULL),
(3, 'B', 'B', 0, 1, '2025-09-23 17:38:07', NULL),
(4, 'C', 'C', 0, 1, '2025-09-23 17:38:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customer_options_segments`
--

CREATE TABLE `customer_options_segments` (
  `id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_options_segments`
--

INSERT INTO `customer_options_segments` (`id`, `code`, `name`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'AG', 'AG', 0, 1, '2025-09-23 17:38:07', NULL),
(2, 'HW', 'HW', 0, 1, '2025-09-23 17:38:07', NULL),
(3, 'LMT', 'LMT', 0, 1, '2025-09-23 17:38:07', NULL),
(4, 'ร้านเหล็ก', 'ร้านเหล็ก', 0, 1, '2025-09-23 17:38:07', NULL),
(5, 'โรงรีด', 'โรงรีด', 0, 1, '2025-09-23 17:38:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customer_options_sizes`
--

CREATE TABLE `customer_options_sizes` (
  `id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_options_sizes`
--

INSERT INTO `customer_options_sizes` (`id`, `code`, `name`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'L', 'L', 0, 1, '2025-09-23 17:38:07', NULL),
(2, 'M', 'M', 0, 1, '2025-09-23 17:38:07', NULL),
(3, 'S', 'S', 0, 1, '2025-09-23 17:38:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customer_options_type_areas`
--

CREATE TABLE `customer_options_type_areas` (
  `id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_options_type_areas`
--

INSERT INTO `customer_options_type_areas` (`id`, `code`, `name`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'COM', 'COM', 0, 1, '2025-09-23 17:38:07', NULL),
(2, 'CONS', 'CONS', 0, 1, '2025-09-23 17:38:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `name_th` varchar(255) DEFAULT NULL,
  `brand` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `sku`, `name_en`, `name_th`, `brand`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 'FIX-3', 'Fix-3 Self-drill Screw', 'สกรู Fix-3', 'Fix-it', 'สกรูปลายสว่าน Fix-3 เหมาะสำหรับงานทั่วไป ยึดแน่น ทนทาน', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(2, 1, 'FIX-4', 'Fix-4 Corrosion Resistant Screw', 'สกรู Fix-4', 'Fix-it', 'สกรู Fix-4 เคลือบพิเศษ เหมาะงานใกล้ทะเล/กัดกร่อน', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(3, 1, 'FIX-TEK48', 'Fix-Green TEK48', 'สกรู Fix-Green TEK48', 'Fix-it', 'สกรู TEK48 สำหรับแปเหล็ก 2.2-6.5mm (หัวบล็อค)', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(4, 2, 'PROF-TIM-01', 'Timber Installation Screw', 'สกรูยึดไม้ ProFast', 'ProFast', 'สกรูยึดไม้ใส่ในโครงเหล็ก สามารถเจาะได้ถึง 3.2mm', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(5, 2, 'PROF-CORR-01', 'Corrugated Roof Tile Screw', 'สกรูหลังคาไฟเบอร์ซีเมนต์', 'ProFast', 'สกรูหลังคาแบบ dual-thread สำหรับกระเบื้องไฟเบอร์ซีเมนต์', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(6, 3, 'TORO-CD-4', 'TORO Cutting Disc 4\"', 'ใบตัด TORO 4 นิ้ว', 'TORO', 'ใบตัดเหล็ก/สแตนเลส ขนาด 4 นิ้ว Iron-Free ตัดไว ไม่ไหม้', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(7, 3, 'TORO-GR-125', 'TORO Grinding Disc 125mm', 'จานเจียร TORO', 'TORO', 'จานเจียรคุณภาพสูง ทนต่อการบิ่น', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(8, 4, 'SEAL-SX2000', 'Sealex Sx-2000 Silicone Sealant', 'Sealex Sx-2000', 'Sealex', 'Neutral cure silicone sealant, ASTM C-920 standard, เหมาะสำหรับงานซีลทั่วไป', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(9, 4, 'SEAL-SX700', 'Sealex Sx-700 Adhesive', 'Sealex Sx-700', 'Sealex', 'กาวตะปู Sx-700 ใช้ยึดวัสดุก่อสร้างทั่วไป', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(10, 5, 'TOPGLASS-GC', 'Topglass GC Translucent Sheet', 'Topglass GC', 'Topglass', 'แผ่นโปร่งแสงไฟเบอร์กลาส Topglass GC – มีการเคลือบ UV, รับประกันยาว', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(11, 6, 'MINIGOLD-001', 'Mini Gold Translucent Sheet', 'แผ่น Mini Gold', 'Mini Gold', 'แผ่นโปร่งแสง Mini Gold มาตรฐาน มอก. สำหรับกันสาด/หลังคา', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(12, 7, 'KOMAK-POL-01', 'Komak Polishing Compound', 'น้ำยาขัด Komak', 'Komak', 'น้ำยาขัด/ซ่อมสีรถยนต์ ยี่ห้อ Komak', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(13, 8, 'NEO-01', 'NEO', 'NEO', '', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(14, 9, 'FS-01', 'FS-Mixed Sizes', 'FS-คละไซต์', '', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(15, 10, 'STL-01', 'STL', 'STL', '', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(16, 11, 'RHINO-01', 'RHINO', 'RHINO', '', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(17, 12, 'EUTEK-01', 'EUTEK', 'EUTEK', '', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(18, 12, 'EUTEK', 'EUTEK-Mixed Sizes', 'EUTEK-คละไซส์', '', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(19, 4, 'SEAL-SX1300', 'Sealex Sx-1300 Silicone Sealant', 'Sealex Sx-1300', '', '', '2025-09-10 12:51:11', '2025-09-19 14:02:06'),
(20, 14, 'WR-01', 'Welding Wire', 'ลวดเชื่อม', '', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(21, 15, 'AW-01', 'Awning', 'กันสาด', '', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(22, 16, 'TR-01', 'TORO', 'ใบตัด', 'TORO', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11'),
(24, 17, 'TR-02', 'TORO', 'ใบตัด', 'TORO', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11');

-- --------------------------------------------------------

--
-- Table structure for table `products_categories`
--

CREATE TABLE `products_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `name_th` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products_categories`
--

INSERT INTO `products_categories` (`id`, `name_en`, `name_th`, `description`) VALUES
(1, 'Fix-it Screws', 'สกรู Fix-it', 'สกรูปลายสว่านและสกรูเมทัลชีท ภายใต้แบรนด์ Fix-it / ProFast.'),
(2, 'Profast Fasteners', 'PROFAST - อุปกรณ์ยึด', 'สกรูยึดไม้, สกรูยึดแป, สกรูไฟเบอร์ซีเมนต์จาก ProFast.'),
(3, 'TORO Cutting & Abrasives', 'TORO ใบตัด/แผ่นขัด', 'ใบตัด ใบเจียร และแผ่นขัดสำหรับเหล็ก/สแตนเลส.'),
(4, 'Sealex Sealants & Adhesives', 'Sealex ยาแนว/กาว', 'กาวและซีลแลนท์ไฮบริด/ซิลิโคน (Sealex).'),
(5, 'Topglass Translucent Sheets', 'Topglass แผ่นโปร่งแสง', 'แผ่นโปร่งแสงไฟเบอร์กลาส Topglass สำหรับหลังคา/กันสาด.'),
(6, 'Mini Gold Sheets', 'Mini Gold แผ่นโปร่งแสง', 'แผ่นโปร่งแสง Mini Gold (มาตรฐาน มอก.).'),
(7, 'Komak Car Care', 'Komak ดูแลสีรถ', 'ผลิตภัณฑ์ดูแลและซ่อมสีรถยนต์ (Komak).'),
(8, 'NEO', 'NEO', 'สินค้า NEO ต่างๆ'),
(9, 'FS', 'FS', 'สินค้า FS ต่างๆ'),
(10, 'STL', 'STL', 'สินค้า STL ต่างๆ'),
(11, 'RHINO', 'RHINO', 'สินค้า RHINO ต่างๆ'),
(12, 'EUTEK', 'EUTEK', 'สินค้า EUTEK ต่างๆ'),
(14, 'Welding Rod', 'ลวดเชื่อม', 'สินค้าลวดเชื่อมต่างๆ'),
(15, 'Awning', 'กันสาด', 'สินค้ากันสาดต่างๆ'),
(16, 'TORO', 'ใบตัด', 'สินค้าใบตัดต่างๆ'),
(17, 'test', 'test', 'test');

-- --------------------------------------------------------

--
-- Table structure for table `promotion`
--

CREATE TABLE `promotion` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` int(10) UNSIGNED DEFAULT NULL,
  `target` int(10) UNSIGNED DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` int(10) UNSIGNED DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `create_date` datetime NOT NULL DEFAULT current_timestamp(),
  `edit_date` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `promotion` int(10) UNSIGNED DEFAULT 0,
  `code` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `campaign_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotion_target`
--

CREATE TABLE `promotion_target` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promotion_target`
--

INSERT INTO `promotion_target` (`id`, `name`) VALUES
(1, 'เฉพาะร้านเกรด A'),
(2, 'ทุกสาขา');

-- --------------------------------------------------------

--
-- Table structure for table `promotion_type`
--

CREATE TABLE `promotion_type` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promotion_type`
--

INSERT INTO `promotion_type` (`id`, `name`) VALUES
(1, 'ลดราคา'),
(2, 'แถม'),
(3, 'ค่าเชียร์'),
(4, 'ของแจก'),
(5, 'เงินคืน');

-- --------------------------------------------------------

--
-- Table structure for table `status`
--

CREATE TABLE `status` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `thai_name` varchar(191) DEFAULT NULL,
  `id_main` int(10) UNSIGNED DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status`
--

INSERT INTO `status` (`id`, `name`, `short_name`, `thai_name`, `id_main`, `icon`) VALUES
(1, 'Active', 'ACT', 'เปิดใช้งาน', 1, 'check-circle-fill\n-fill'),
(2, 'Pending', 'PND', 'รอดำเนินการ', 2, 'hourglass-split'),
(3, 'Close', 'CLS', 'ปิดใช้งาน', 3, 'x-circle-fill'),
(4, 'Expire', 'EXP', 'หมดอายุ', 4, 'calendar-x');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `campaign`
--
ALTER TABLE `campaign`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_campaign_code` (`code`),
  ADD KEY `ix_campaign_type` (`type`),
  ADD KEY `ix_campaign_target` (`target`),
  ADD KEY `ix_campaign_status` (`status`);

--
-- Indexes for table `campaign_target`
--
ALTER TABLE `campaign_target`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `campaign_type`
--
ALTER TABLE `campaign_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `condition`
--
ALTER TABLE `condition`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotion_id` (`promotion_id`),
  ADD KEY `ix_condition_promotion` (`promotion_id`),
  ADD KEY `ix_condition_campaign` (`campaign_id`),
  ADD KEY `ix_condition_active` (`is_active`),
  ADD KEY `ix_condition_name` (`condition_name`(150));

--
-- Indexes for table `condition_action`
--
ALTER TABLE `condition_action`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `condition_object`
--
ALTER TABLE `condition_object`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `condition_reward_action`
--
ALTER TABLE `condition_reward_action`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `condition_reward_object`
--
ALTER TABLE `condition_reward_object`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_customer_code` (`code`),
  ADD KEY `ix_customer_name` (`name`),
  ADD KEY `ix_customer_type_area_id` (`type_area_id`),
  ADD KEY `ix_customer_area_name_id` (`area_name_id`),
  ADD KEY `ix_customer_segment_id` (`segment_id`),
  ADD KEY `ix_customer_grade_id` (`grade_id`),
  ADD KEY `ix_customer_size_id` (`size_id`),
  ADD KEY `idx_customer_type_area_id` (`type_area_id`),
  ADD KEY `idx_customer_area_name_id` (`area_name_id`),
  ADD KEY `idx_customer_segment_id` (`segment_id`),
  ADD KEY `idx_customer_grade_id` (`grade_id`),
  ADD KEY `idx_customer_size_id` (`size_id`);

--
-- Indexes for table `customer_groups`
--
ALTER TABLE `customer_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_customer_groups_condition_id` (`condition_id`),
  ADD KEY `ix_customer_groups_promotion_id` (`promotion_id`);

--
-- Indexes for table `customer_group_members`
--
ALTER TABLE `customer_group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_group_customer` (`group_id`,`customer_id`),
  ADD KEY `ix_cgm_group_id` (`group_id`),
  ADD KEY `ix_cgm_customer_id` (`customer_id`);

--
-- Indexes for table `customer_options_area_names`
--
ALTER TABLE `customer_options_area_names`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_area_names_name` (`name`);

--
-- Indexes for table `customer_options_grades`
--
ALTER TABLE `customer_options_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_grades_name` (`name`);

--
-- Indexes for table `customer_options_segments`
--
ALTER TABLE `customer_options_segments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_segments_name` (`name`);

--
-- Indexes for table `customer_options_sizes`
--
ALTER TABLE `customer_options_sizes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_sizes_name` (`name`);

--
-- Indexes for table `customer_options_type_areas`
--
ALTER TABLE `customer_options_type_areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_type_areas_name` (`name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_products_sku` (`sku`),
  ADD KEY `ix_products_category` (`category_id`);

--
-- Indexes for table `products_categories`
--
ALTER TABLE `products_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `promotion`
--
ALTER TABLE `promotion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_promotion_campaign` (`campaign_id`),
  ADD KEY `ix_promotion_status` (`status`),
  ADD KEY `ix_promotion_type` (`type`),
  ADD KEY `ix_promotion_target` (`target`),
  ADD KEY `ix_promotion_campaign_status` (`campaign_id`,`status`);

--
-- Indexes for table `promotion_target`
--
ALTER TABLE `promotion_target`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `promotion_type`
--
ALTER TABLE `promotion_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_main` (`id_main`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `campaign`
--
ALTER TABLE `campaign`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campaign_target`
--
ALTER TABLE `campaign_target`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `campaign_type`
--
ALTER TABLE `campaign_type`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `condition`
--
ALTER TABLE `condition`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `condition_action`
--
ALTER TABLE `condition_action`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `condition_object`
--
ALTER TABLE `condition_object`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `condition_reward_action`
--
ALTER TABLE `condition_reward_action`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `condition_reward_object`
--
ALTER TABLE `condition_reward_object`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2918599;

--
-- AUTO_INCREMENT for table `customer_groups`
--
ALTER TABLE `customer_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_group_members`
--
ALTER TABLE `customer_group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_options_area_names`
--
ALTER TABLE `customer_options_area_names`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `customer_options_grades`
--
ALTER TABLE `customer_options_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customer_options_segments`
--
ALTER TABLE `customer_options_segments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `customer_options_sizes`
--
ALTER TABLE `customer_options_sizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `customer_options_type_areas`
--
ALTER TABLE `customer_options_type_areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `products_categories`
--
ALTER TABLE `products_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `promotion`
--
ALTER TABLE `promotion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotion_target`
--
ALTER TABLE `promotion_target`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `promotion_type`
--
ALTER TABLE `promotion_type`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `status`
--
ALTER TABLE `status`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `condition`
--
ALTER TABLE `condition`
  ADD CONSTRAINT `fk_conditions_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customer`
--
ALTER TABLE `customer`
  ADD CONSTRAINT `fk_customer_area_name` FOREIGN KEY (`area_name_id`) REFERENCES `customer_options_area_names` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_customer_grade` FOREIGN KEY (`grade_id`) REFERENCES `customer_options_grades` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_customer_segment` FOREIGN KEY (`segment_id`) REFERENCES `customer_options_segments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_customer_size` FOREIGN KEY (`size_id`) REFERENCES `customer_options_sizes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_customer_type_area` FOREIGN KEY (`type_area_id`) REFERENCES `customer_options_type_areas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `customer_groups`
--
ALTER TABLE `customer_groups`
  ADD CONSTRAINT `fk_cg_condition` FOREIGN KEY (`condition_id`) REFERENCES `condition` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cg_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `customer_group_members`
--
ALTER TABLE `customer_group_members`
  ADD CONSTRAINT `fk_cgm_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cgm_group` FOREIGN KEY (`group_id`) REFERENCES `customer_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `products_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `promotion`
--
ALTER TABLE `promotion`
  ADD CONSTRAINT `fk_promotion_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaign` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;