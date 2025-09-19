-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 19, 2025 at 12:39 PM
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

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `drop_target_fks` ()   BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE c_name VARCHAR(255);
  DECLARE t_name VARCHAR(255);
  DECLARE col_name VARCHAR(255);
  DECLARE r_table VARCHAR(255);
  DECLARE r_col VARCHAR(255);

  DECLARE cur CURSOR FOR
    SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('conditions','condition','condition_link_product','condition_link_category')
      AND REFERENCED_TABLE_NAME IN ('promotion','campaign','products','products_categories');

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO c_name, t_name, col_name, r_table, r_col;
    IF done THEN
      LEAVE read_loop;
    END IF;

    -- build and execute DROP FOREIGN KEY statement
    SET @s = CONCAT('ALTER TABLE `', t_name, '` DROP FOREIGN KEY `', c_name, '`');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END LOOP;
  CLOSE cur;
END$$

DELIMITER ;

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

--
-- Dumping data for table `campaign`
--

INSERT INTO `campaign` (`id`, `name`, `code`, `status`, `description`, `type`, `target`, `start_date`, `end_date`, `location`, `note`, `created_by`, `create_date`, `edit_date`, `promotion`) VALUES
(1, 'โปรลดแรง เดือนเมษา', 'CMP-202504-001', 1, 'แคมเปญลดราคาสินค้าเครื่องมือช่าง', 1, 1, '2025-04-01', '2025-04-30', 'สาขาทั่วประเทศ', 'โปรแรงจำกัดเวลา 1', 2, '2025-03-20 09:00:00', '2025-09-19 17:10:50', 10),
(2, 'Member Exclusive Q2', 'CMP-202505-002', 1, 'สิทธิพิเศษสำหรับสมาชิก', 1, 2, '2025-05-01', '2025-06-30', 'Online', 'แจกคูปองเฉพาะสมาชิก', 3, '2025-04-10 10:00:00', '2025-09-10 11:20:54', 3),
(3, 'แคมเปญเก่ายกเลิก', 'CMP-202301-003', 2, 'แคมเปญหมดอายุ/ยกเลิก', 2, 1, '2024-01-01', '2024-02-28', 'สำนักงานใหญ่', 'ยกเลิกแล้ว', 2, '2024-01-01 08:00:00', '2025-09-10 13:32:21', 0),
(4, 'Back-to-School Promo', 'CMP-202507-004', 2, 'โปรโมชั่นต้อนรับเปิดเทอม', 1, 1, '2025-07-01', '2025-08-15', 'ร้านคู่ค้า', 'เน้นสต็อกสินค้า', 3, '2025-06-01 11:00:00', '2025-09-10 11:20:54', 4),
(5, 'โปรเทศกาลปลายปี', 'CMP-202512-005', 1, 'เตรียมแคมเปญปลายปี', 2, 1, '2025-12-01', '2025-12-31', 'สาขาใหญ่', 'วางแผนแจกของแถม', 2, '2025-10-01 12:00:00', '2025-09-10 11:20:54', 2),
(6, 'Weekly Flash Sale', 'CMP-202509-006', 3, 'Flash sale ทุกสัปดาห์', 1, 1, '2025-09-01', '2025-09-30', 'Online + Store', 'ลดหลายสินค้า', 1, '2025-08-25 09:30:00', '2025-09-13 11:40:44', 4),
(7, 'test', 'CMP-20250910-2118', 2, '', 1, 1, '2025-01-02', '2025-01-03', '', '', NULL, '2025-09-10 13:31:33', NULL, 0),
(8, 'จดโปร (2025)', 'PROMO25', 2, '', 1, 1, '2025-06-16', '2025-08-31', '', '', NULL, '2025-09-19 12:00:50', '2025-09-19 13:58:30', 6),
(9, 'testv2', 'CMP-20250919-4659', 2, 'aaa', 2, 3, '2025-01-01', '2025-09-12', 'ccc', 'bbb', NULL, '2025-09-19 15:05:12', '2025-09-19 16:05:36', 4),
(10, 'testv3', 'CMP-20250919-1791', 2, '', 1, 1, '2025-01-01', '2025-01-02', '', '', NULL, '2025-09-19 15:40:04', NULL, 0),
(11, 'testv3', 'CMP-20250919-2063', 2, '', 1, 1, '2025-01-02', '2025-01-03', '', '', NULL, '2025-09-19 16:05:48', '2025-09-19 17:33:28', 11),
(12, 'ss', 'fsf', 2, '', 1, 1, '2025-01-02', '2025-01-03', '', '', NULL, '2025-09-19 17:21:20', NULL, 0);

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

--
-- Dumping data for table `condition`
--

INSERT INTO `condition` (`id`, `promotion_id`, `type`, `data`, `created_at`, `updated_at`, `campaign_id`, `condition_name`, `condition_xml`, `condition_code`, `code_lang`, `version`, `is_active`, `created_by`) VALUES
(1, 1, NULL, NULL, '2025-09-10 12:55:34', '2025-09-19 11:32:26', 0, 'เงื่อนไขทดสอบ', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_hj5d9e\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_99xi61\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_a2s2gu\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_vwnecc\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"3\",\"2\"],\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_9o2myq\",\"fields\":{\"Value\":10000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_tae381\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_ywjniy\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_uoleht\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"controls_if_azj1t2\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_1wed8n\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_d2flkb\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_pvud49\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\",\"2\",\"3\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_3rqf05\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_c8bdd1\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_i8s15e\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_e2q7oh\",\"fields\":{\"Value\":15,\"Unit\":\"2\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_66y3vl\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_pxt4he\",\"fields\":{\"TARGET\":\"product\"},\"inputs\":{\"PRODUCT_INPUT\":{\"block\":{\"type\":\"object_product\",\"id\":\"object_product_zrddsu\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"6\"],\"PRODUCT_SELECT\":\"6\"}}}}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_51ljxe\",\"fields\":{\"Value\":1,\"Unit\":\"3\"}}}}}}}}}}}},{\"type\":\"controls_if\",\"id\":\"controls_if_azj1t2\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_1wed8n\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_d2flkb\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_pvud49\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\",\"2\",\"3\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_3rqf05\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_c8bdd1\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_i8s15e\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_e2q7oh\",\"fields\":{\"Value\":15,\"Unit\":\"2\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_66y3vl\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_pxt4he\",\"fields\":{\"TARGET\":\"product\"},\"inputs\":{\"PRODUCT_INPUT\":{\"block\":{\"type\":\"object_product\",\"id\":\"object_product_zrddsu\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"6\"],\"PRODUCT_SELECT\":\"6\"}}}}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_51ljxe\",\"fields\":{\"Value\":1,\"Unit\":\"3\"}}}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-10T05:55:34.133Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"3\",\"2\"],\"product\":\"3\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":10000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\",\"2\",\"3\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":15,\"unit\":\"2\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"6\"],\"product\":\"6\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"3\"}}]}}]}]},\"saved_at\":\"2025-09-10T05:55:34.136Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-10T05:55:34.133Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"3\",\"2\"],\"product\":\"3\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":10000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\",\"2\",\"3\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":15,\"unit\":\"2\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"6\"],\"product\":\"6\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"3\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(2, 1, NULL, NULL, '2025-09-10 13:17:52', '2025-09-10 13:17:52', 0, 'เงื่อนไขทดสอบ2', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"!hgi45%x;W*AC,pmEcj%\",\"x\":170,\"y\":-30,\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"`gsZ,H5G,c20Q7vBG5gU\",\"fields\":{\"OP\":\"EQ\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"math_number\",\"id\":\"d[P%!b3hnlHb=+4vh@+3\",\"fields\":{\"NUM\":0}}},\"B\":{\"block\":{\"type\":\"math_number\",\"id\":\"cOY%3.ZO!lNbfEXxk,dE\",\"fields\":{\"NUM\":0}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"@eeGm[UZzreQmx?RtAMl\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"math_number\",\"id\":\",aG8wHU8JKM-9T(SWfu4\",\"fields\":{\"NUM\":0}}},\"RIGHT\":{\"block\":{\"type\":\"math_number\",\"id\":\"dPPT*)rc?RJy**5NwKt.\",\"fields\":{\"NUM\":2}}}}}}}},{\"type\":\"action_buy\",\"id\":\"Z[P4b:6RV8U-WUeGz_gM\",\"x\":1130,\"y\":390,\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"Nv3)_t#L`5O^~5Cts\\/ZP\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-10T06:17:52.871Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"EQ\",\"A\":{\"type\":\"NUMBER\",\"value\":0},\"B\":{\"type\":\"NUMBER\",\"value\":0}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"NUMBER\",\"value\":0},\"right\":{\"type\":\"NUMBER\",\"value\":2}}}]},{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}}]},\"saved_at\":\"2025-09-10T06:17:52.871Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-10T06:17:52.871Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"EQ\",\"A\":{\"type\":\"NUMBER\",\"value\":0},\"B\":{\"type\":\"NUMBER\",\"value\":0}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"NUMBER\",\"value\":0},\"right\":{\"type\":\"NUMBER\",\"value\":2}}}]},{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}}]}', 'dsl-json', '1', 1, 'admin'),
(3, 19, NULL, NULL, '2025-09-10 13:52:45', '2025-09-19 11:32:29', 0, 'ทดสอบ3', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"#5?qj0e2ROhR)O[UDg#W\",\"x\":330,\"y\":190,\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"j$-iu$qJ;s4jQyhr^qPE\",\"fields\":{\"OP\":\"EQ\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_buy\",\"id\":\"oo8+v8|)Cj_MJ[q$:YeB\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"7-@O`#$Sv}OEh#D,YiC3\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Z1AqWu?nV%AV$meAvE@Q\",\"fields\":{\"Value\":10001,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"Tk]\\/U0vhB4GS@,-a8=nT\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_discount\",\"id\":\"{8|\\/,Jq;JBq7;h`h)3XV\",\"extraState\":\"<mutation target=\\\"TOTAL\\\"><\\/mutation>\",\"fields\":{\"TARGET\":\"TOTAL\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"qE_D#u+Pvq9ua?Vb4`Jc\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-17T02:12:24.973Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"EQ\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":10001,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"TOTAL\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}}]}]},\"saved_at\":\"2025-09-17T02:12:24.976Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-17T02:12:24.973Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"EQ\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":10001,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"TOTAL\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}}]}]}', 'dsl-json', '1', 1, 'admin'),
(5, 19, NULL, NULL, '2025-09-10 14:26:24', '2025-09-19 11:32:32', 0, 'a', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"za;AOFlv00czGyS~X+gE\",\"x\":390,\"y\":130,\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"O(JgeP;lr[O:C{#Vi#dj\",\"fields\":{\"OP\":\"EQ\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_buy\",\"id\":\"GLA}[}+MWuNVeXENy`+3\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"e6z,VdR!(^uM#iZ{Z}y9\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"{lWvC7;ID|csp%O^.9_R\",\"fields\":{\"Value\":0,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\".nP]dd%-n;v.QbGCC_}}\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_discount\",\"id\":\"AH)A6\\/j9$6uIEOH-JApT\",\"extraState\":\"<mutation target=\\\"TOTAL\\\"><\\/mutation>\",\"fields\":{\"TARGET\":\"TOTAL\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"2%_#4Jfn`i%`OP.ipa~8\",\"fields\":{\"Value\":0,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-10T07:26:24.702Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"EQ\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"TOTAL\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}}}]}]},\"saved_at\":\"2025-09-10T07:26:24.702Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-10T07:26:24.702Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"EQ\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"TOTAL\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}}}]}]}', 'dsl-json', '1', 1, 'admin'),
(6, 19, NULL, NULL, '2025-09-10 17:00:19', '2025-09-19 11:32:37', 0, 'เงื่อนไขทดสอบ 4', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_lpieg5\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_pei3av\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_z7p76z\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_rmvxjg\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_yavoma\",\"fields\":{\"Value\":10000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_1h1i2y\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_b9qiht\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_way647\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"controls_if_pt273f\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_oa268j\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_yd59c6\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_qdl5vg\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_3f3003\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_0c6l63\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_7cqtvw\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_yy473l\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"controls_if_e38hsl\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_pb0wis\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_sumu2e\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_5vvef6\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_8q69eo\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_f28anh\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_x2uszk\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_sli564\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"controls_if_xdvhwy\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_789iwi\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_2\",\"id\":\"action_2_yubhsl\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_1ckgec\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_ke9kdt\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_h62rrq\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_vnzy7y\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_3baxjl\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}}}}}}}}},{\"type\":\"controls_if\",\"id\":\"controls_if_pt273f\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_oa268j\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_yd59c6\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_qdl5vg\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_3f3003\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_0c6l63\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_7cqtvw\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_yy473l\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"controls_if_e38hsl\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_pb0wis\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_sumu2e\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_5vvef6\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_8q69eo\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_f28anh\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_x2uszk\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_sli564\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"controls_if_xdvhwy\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_789iwi\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_2\",\"id\":\"action_2_yubhsl\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_1ckgec\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_ke9kdt\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_h62rrq\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_vnzy7y\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_3baxjl\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}}}}}}},{\"type\":\"controls_if\",\"id\":\"controls_if_e38hsl\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_pb0wis\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_sumu2e\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_5vvef6\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_8q69eo\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_f28anh\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_x2uszk\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_sli564\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"controls_if_xdvhwy\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_789iwi\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_2\",\"id\":\"action_2_yubhsl\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_1ckgec\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_ke9kdt\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_h62rrq\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_vnzy7y\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_3baxjl\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}}}}},{\"type\":\"controls_if\",\"id\":\"controls_if_xdvhwy\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_789iwi\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_2\",\"id\":\"action_2_yubhsl\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_1ckgec\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_ke9kdt\",\"fields\":{\"Value\":20000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_h62rrq\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_vnzy7y\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_3baxjl\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-16T02:05:56.931Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":10000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"2\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]}]},\"saved_at\":\"2025-09-16T02:05:56.931Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-16T02:05:56.931Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":10000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"2\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(7, 19, NULL, NULL, '2025-09-15 17:49:38', '2025-09-19 11:32:39', 0, '3', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\";P{L8-@8kB[peodvmZ14\",\"x\":370,\"y\":110,\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"~D}p}Lp*PS%!5,p)A^;{\",\"fields\":{\"OP\":\"GTE\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_buy\",\"id\":\"Wo(VnyQ0RV}.z4SWJIjx\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"eNo9Yf?PJInA?rxo}1DT\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"|K=#B~|dYQx$6[+k|Gr8\",\"fields\":{\"Value\":10000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"^+5Q12g0y4kLw-$VEWLt\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_discount\",\"id\":\"[~zgQd..|zFKvPO8|D!6\",\"extraState\":\"<mutation target=\\\"TOTAL\\\"><\\/mutation>\",\"fields\":{\"TARGET\":\"TOTAL\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"h9@Rdm%2I4K++,W,B%\\/!\",\"fields\":{\"Value\":100,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-15T10:49:38.544Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":10000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"TOTAL\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":100,\"unit\":\"1\"}}}]}]},\"saved_at\":\"2025-09-15T10:49:38.544Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-15T10:49:38.544Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":10000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"TOTAL\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":100,\"unit\":\"1\"}}}]}]}', 'dsl-json', '1', 1, 'admin'),
(8, 19, NULL, NULL, '2025-09-16 10:10:26', '2025-09-19 11:32:40', 0, 'd', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"yuzVz#BPHo?RxDl[er0V\",\"x\":630,\"y\":150,\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"iZvYV$aA,_KX#H-?nur%\",\"fields\":{\"OP\":\"GTE\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_buy\",\"id\":\"eGjCEOe}vnBA[%W3EaVt\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"3Nirz=xI,W1}x.Zz}GwR\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"T?4+U~wZ_)(5DyZ^%kgM\",\"fields\":{\"Value\":0,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"l@n?S*?`Lv9JRbrJ@xN{\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_gift\",\"id\":\"@R?n)V^{hd!p(bqk`vD_\",\"extraState\":\"<mutation target=\\\"GOLD\\\"><\\/mutation>\",\"fields\":{\"TARGET\":\"GOLD\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"I5cngzM9_q2r9xCa0IoE\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-16T03:10:26.518Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"GIFT\",\"target\":\"GOLD\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}}}]}]},\"saved_at\":\"2025-09-16T03:10:26.518Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-16T03:10:26.518Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"GIFT\",\"target\":\"GOLD\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}}}]}]}', 'dsl-json', '1', 1, 'admin'),
(9, 19, NULL, NULL, '2025-09-16 18:00:28', '2025-09-19 11:32:41', 0, 'เงื่อนไขทดสอบ 8', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"=_\\/Syof7CXlz:1KtK+xH\",\"x\":-810,\"y\":-390,\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\";s1w2\\/`KRz:4G.$Y^@}J\",\"fields\":{\"OP\":\"GTE\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_buy\",\"id\":\"B:S_+Od`7391?1f_o\\/#3\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"|j5l1i@h]G$.[?PByswt\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"EqhF?8=p]!J.(~EY!n4C\",\"fields\":{\"Value\":100,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"s[wx7N4X:dy|e^5W.W@Y\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_discount\",\"id\":\"tUnswV60V$;m@V{@IB)X\",\"extraState\":\"<mutation target=\\\"TOTAL\\\"><\\/mutation>\",\"fields\":{\"TARGET\":\"TOTAL\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"t=1Hv8OmgBs}6eT(ehCu\",\"fields\":{\"Value\":100,\"Unit\":\"1\"}}}}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"NgY:@Z*)}C~$kasz`vWI\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"_eFbaD`~zTTOIw$`UyBz\",\"fields\":{\"OP\":\"GTE\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_buy\",\"id\":\"i.;j(dearnb!?TSpsM*u\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"wb*!)hb2Q`;;MR{LaOlC\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Wg^V.vup7VUCKl4aqO_e\",\"fields\":{\"Value\":10000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"{3dP=1t3?x:N5uVege8L\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_discount\",\"id\":\"3~T;~,)I~YFVh%I^-j~9\",\"extraState\":\"<mutation target=\\\"TOTAL\\\"><\\/mutation>\",\"fields\":{\"TARGET\":\"TOTAL\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Q4wIWTc3}1YTff@8.}Iq\",\"fields\":{\"Value\":1000,\"Unit\":\"1\"}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"#pnwHhz`4ajA%\\/Q.X_GM\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"-+_fH1;vdzc[$O2Mkyoc\",\"fields\":{\"OP\":\"GTE\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_buy\",\"id\":\"ONx]Vwa9nAUKdV9I^B8$\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"q#:T]NujOJty.xzO:KVS\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"]a)BC[oE7iby[qn_@DLL\",\"fields\":{\"Value\":100000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"B^0)Dz)eqY)aG6.:8*a@\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_discount\",\"id\":\"#kE{+f}D%i72yI(OuFaj\",\"extraState\":\"<mutation target=\\\"TOTAL\\\"><\\/mutation>\",\"fields\":{\"TARGET\":\"TOTAL\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\")krx%6l]RL\\/S~+K)T^DK\",\"fields\":{\"Value\":9,\"Unit\":\"1\"}}}}}}}}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-16T11:00:28.802Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":100,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"TOTAL\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":100,\"unit\":\"1\"}}}]}]},\"saved_at\":\"2025-09-16T11:00:28.802Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-16T11:00:28.802Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":100,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"TOTAL\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":100,\"unit\":\"1\"}}}]}]}', 'dsl-json', '1', 1, 'admin'),
(10, 19, NULL, NULL, '2025-09-17 11:30:33', '2025-09-19 11:32:43', 0, 's//', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_nsv9la\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_t1yszr\",\"fields\":{\"OP\":\">\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_2\",\"id\":\"action_2_md0l66\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_2\",\"id\":\"object_2_5ba4gi\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"2\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_22k2q2\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-18T03:23:20.540Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\">\",\"A\":{\"type\":\"ACTION\",\"action\":\"2\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-18T03:23:20.540Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-18T03:23:20.540Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\">\",\"A\":{\"type\":\"ACTION\",\"action\":\"2\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(11, 19, NULL, NULL, '2025-09-17 11:32:00', '2025-09-19 11:32:45', 0, 'ad', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_k0xvp8\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_fi5rgk\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_3\",\"id\":\"action_3_00qz3y\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_8yuf41\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_j10y9l\",\"fields\":{\"Value\":null,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-17T04:32:00.389Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-17T04:32:00.389Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-17T04:32:00.389Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(12, 19, NULL, NULL, '2025-09-17 11:32:38', '2025-09-19 11:32:48', 0, 'dasdad1234567', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_oeq6qm\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_o08qwr\",\"fields\":{\"OP\":\"<\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_2\",\"id\":\"action_2_tnznxi\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_2\",\"id\":\"object_2_ueflch\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"2\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_e1hq6a\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-18T02:16:08.999Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"<\",\"A\":{\"type\":\"ACTION\",\"action\":\"2\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-18T02:16:08.999Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-18T02:16:08.999Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"<\",\"A\":{\"type\":\"ACTION\",\"action\":\"2\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(13, 19, NULL, NULL, '2025-09-17 11:35:17', '2025-09-19 11:32:50', 0, 's12', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_6ftk0z\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_ro3ure\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_ekggdk\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_2\",\"id\":\"object_2_v1xwhr\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"2\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_8qw4zp\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-18T02:14:50.061Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-18T02:14:50.061Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-18T02:14:50.061Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(14, 19, NULL, NULL, '2025-09-17 11:35:28', '2025-09-19 11:32:54', 0, 'dadd', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"Bj5I1lMIyVW0E~%w!!@.\",\"x\":170,\"y\":50,\"inputs\":{\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"8]eI!I{pa]\\/B9(173u.^\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-17T04:35:28.298Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":null,\"right\":null}}]}]},\"saved_at\":\"2025-09-17T04:35:28.298Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-17T04:35:28.298Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":null,\"right\":null}}]}]}', 'dsl-json', '1', 1, 'admin'),
(15, 19, NULL, NULL, '2025-09-17 11:36:20', '2025-09-19 11:32:55', 0, 'ad', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"mFWum~U2\\/Y?WM3{e)f,^\",\"x\":310,\"y\":90,\"inputs\":{\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"KeiR|4Nd}#vIVRvqO#J8\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-17T04:40:28.140Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":null,\"right\":null}}]}]},\"saved_at\":\"2025-09-17T04:40:28.140Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-17T04:40:28.140Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":null,\"right\":null}}]}]}', 'dsl-json', '1', 1, 'admin'),
(16, 19, NULL, NULL, '2025-09-17 11:54:55', '2025-09-19 11:32:57', 0, 's', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"Bj5I1lMIyVW0E~%w!!@.\",\"x\":170,\"y\":50,\"inputs\":{\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"8]eI!I{pa]\\/B9(173u.^\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-17T04:55:34.148Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":null,\"right\":null}}]}]},\"saved_at\":\"2025-09-17T04:55:34.148Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-17T04:55:34.148Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":null,\"right\":null}}]}]}', 'dsl-json', '1', 1, 'admin'),
(17, 19, NULL, NULL, '2025-09-17 11:55:29', '2025-09-19 11:33:00', 0, 's', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"Bj5I1lMIyVW0E~%w!!@.\",\"x\":170,\"y\":50,\"inputs\":{\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"8]eI!I{pa]\\/B9(173u.^\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-17T04:55:29.429Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":null,\"right\":null}}]}]},\"saved_at\":\"2025-09-17T04:55:29.429Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-17T04:55:29.429Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":null,\"right\":null}}]}]}', 'dsl-json', '1', 1, 'admin'),
(18, 19, NULL, NULL, '2025-09-17 12:13:40', '2025-09-19 11:33:03', 0, 'dd12333', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_ntwx15\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_eyb2eb\",\"fields\":{\"OP\":\"<\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_vjbai5\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_rtikax\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_8e6kqd\",\"fields\":{\"Value\":0,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-18T06:39:46.694Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"<\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-18T06:39:46.694Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-18T06:39:46.694Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"<\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(19, 5, NULL, NULL, '2025-09-18 14:12:01', '2025-09-19 11:33:06', 0, 'test 11', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_uk5qoe\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_wgp51t\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_sbhfx1\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_sl863h\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_j4xprq\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-18T07:12:22.987Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-18T07:12:22.987Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-18T07:12:22.987Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin');
INSERT INTO `condition` (`id`, `promotion_id`, `type`, `data`, `created_at`, `updated_at`, `campaign_id`, `condition_name`, `condition_xml`, `condition_code`, `code_lang`, `version`, `is_active`, `created_by`) VALUES
(20, 5, NULL, NULL, '2025-09-18 14:12:14', '2025-09-19 11:33:10', 0, 'test22', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_peszne\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_uiuq5u\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_4\",\"id\":\"action_4_cejbed\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_2\",\"id\":\"object_2_fza836\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"2\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_6ifa9r\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-18T07:12:30.309Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-18T07:12:30.309Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-18T07:12:30.309Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(21, 19, NULL, NULL, '2025-09-18 15:06:22', '2025-09-19 11:33:12', 0, 'd123', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_h8ljha\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_d6zj2f\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_0tumhq\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_2\",\"id\":\"object_2_jj6h06\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"2\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_jpa3s0\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-18T11:09:52.940Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-18T11:09:52.940Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-18T11:09:52.940Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(22, 19, NULL, NULL, '2025-09-19 09:28:59', '2025-09-19 11:54:27', 0, 'test123321', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_sfmvbq\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_wbajc5\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_3\",\"id\":\"action_3_ixkjnx\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_0bqeqn\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_z6oy9d\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_qjg3zc\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_3\",\"id\":\"reward_3_35uqgb\",\"fields\":{\"TARGET\":\"\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_ae73j3\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}}},\"next\":{\"block\":{\"type\":\"controls_if\",\"id\":\"controls_if_dg7ig6\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_r6qipp\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_3\",\"id\":\"action_3_u5imxn\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_4gczvw\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"4\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_9dojb2\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_3cyetl\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_ldkrj8\",\"fields\":{\"TARGET\":\"shipping\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_lkd5sa\",\"fields\":{\"Value\":3,\"Unit\":\"1\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_zf0b1d\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_3\",\"id\":\"reward_3_l0ber2\",\"fields\":{\"TARGET\":\"\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_y5yicp\",\"fields\":{\"Value\":3,\"Unit\":\"1\"}}}}}}}}}}}},{\"type\":\"controls_if\",\"id\":\"controls_if_dg7ig6\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_r6qipp\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_3\",\"id\":\"action_3_u5imxn\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_4gczvw\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"4\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_9dojb2\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_3cyetl\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_ldkrj8\",\"fields\":{\"TARGET\":\"shipping\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_lkd5sa\",\"fields\":{\"Value\":3,\"Unit\":\"1\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_zf0b1d\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_3\",\"id\":\"reward_3_l0ber2\",\"fields\":{\"TARGET\":\"\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_y5yicp\",\"fields\":{\"Value\":3,\"Unit\":\"1\"}}}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T02:28:58.962Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"shipping\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":3,\"unit\":\"1\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":3,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-19T02:28:58.963Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T02:28:58.962Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}}]}}]},{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"shipping\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":3,\"unit\":\"1\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":3,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 0, 'admin'),
(23, 19, NULL, NULL, '2025-09-19 10:10:08', '2025-09-19 11:33:17', 0, 'advance ทดสอบ', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"Qvk#[XeU;QVPuK!3LZXm\",\"x\":390,\"y\":170,\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"=KbakVLs8Jubj7efvo}p\",\"fields\":{\"OP\":\"GTE\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_buy\",\"id\":\"J^%fEHEx_r2J3Lf+6$a:\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"H?vD`b+{jw35XmR+{b?#\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"P0Robv7PAN{P2981O0(v\",\"fields\":{\"Value\":20,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"If~Ldf4Fg}6GVR3H|z*C\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_point\",\"id\":\"Z7|ugECxIqTO@KxJr,Q@\"}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"LX3eMnGCJNdgc1Wc5Y[@\",\"fields\":{\"Value\":20,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T03:10:08.652Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"POINT\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":20,\"unit\":\"1\"}}}]}]},\"saved_at\":\"2025-09-19T03:10:08.652Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T03:10:08.652Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":20,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"POINT\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":20,\"unit\":\"1\"}}}]}]}', 'dsl-json', '1', 1, 'admin'),
(25, 19, NULL, NULL, '2025-09-19 10:43:42', '2025-09-19 11:33:20', 0, 'd', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_1wvnq4\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_qx8ih1\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_x3j14e\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_dnu1en\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_rkxw9s\",\"fields\":{\"Value\":null,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_l3zo3e\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_rbakni\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_och04k\",\"fields\":{\"Value\":0,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T03:43:42.221Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-19T03:43:42.221Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T03:43:42.221Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(26, 19, NULL, NULL, '2025-09-19 10:43:55', '2025-09-19 11:33:22', 0, 'd', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_p8o5p7\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_hh1llb\",\"fields\":{\"OP\":\"<\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_5\",\"id\":\"action_5_fgn3h0\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_80zwmh\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"4\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_fiixgi\",\"fields\":{\"Value\":null,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_5flbn4\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_3\",\"id\":\"reward_3_chhea4\",\"fields\":{\"TARGET\":\"\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_stg2uh\",\"fields\":{\"Value\":0,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T03:43:55.481Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"<\",\"A\":{\"type\":\"ACTION\",\"action\":\"5\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-19T03:43:55.481Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T03:43:55.481Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"<\",\"A\":{\"type\":\"ACTION\",\"action\":\"5\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(27, 19, NULL, NULL, '2025-09-19 10:44:20', '2025-09-19 11:35:22', 0, 's', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"6)rZ;:vthRWpKF|~bH([\",\"x\":550,\"y\":130,\"inputs\":{\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"H4V!j~G8|9sriXI`Wf4Q\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_discount\",\"id\":\"4g3~nWkD}eY+yxAqbg,:\",\"extraState\":\"<mutation target=\\\"PRODUCT\\\"><\\/mutation>\",\"fields\":{\"TARGET\":\"PRODUCT\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"X6JPJrW?,mpDJ9M$1bI{\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_point\",\"id\":\"9%rZcAAV]b04lGTvw\\/:{\"}}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T04:35:22.914Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"PRODUCT\"},\"right\":null}}]}]},\"saved_at\":\"2025-09-19T04:35:22.914Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T04:35:22.914Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":null,\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"PRODUCT\"},\"right\":null}}]}]}', 'dsl-json', '1', 1, 'admin'),
(28, 19, NULL, NULL, '2025-09-19 11:17:07', '2025-09-19 11:33:26', 0, 'test213123', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_bl5r05\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_ajwdxs\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_2\",\"id\":\"action_2_7tdrkj\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_2\",\"id\":\"object_2_6zpnct\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"2\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_cfqoy7\",\"fields\":{\"Value\":3,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_rv4tdy\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_3\",\"id\":\"reward_3_2dp1v7\",\"fields\":{\"TARGET\":\"\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_p5zgop\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T04:17:28.658Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"2\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":3,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-19T04:17:28.658Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T04:17:28.658Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"2\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":3,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(29, 19, NULL, NULL, '2025-09-19 11:29:44', '2025-09-19 11:33:35', 0, 'asdwadwa123123', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_szl2it\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_xe26lh\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_4\",\"id\":\"action_4_zcu4at\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_2\",\"id\":\"object_2_z8lp5c\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"2\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_ldt466\",\"fields\":{\"Value\":0,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_ab5w44\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_3\",\"id\":\"reward_3_hlkqbl\",\"fields\":{\"TARGET\":\"\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_x36kvq\",\"fields\":{\"Value\":0,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T04:29:50.212Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-19T04:29:50.212Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T04:29:50.212Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 0, 'admin'),
(30, 19, NULL, NULL, '2025-09-19 11:30:28', '2025-09-19 11:31:04', 0, 'asdw', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_ol0v5j\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_f3k29s\",\"fields\":{\"OP\":\">\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_5\",\"id\":\"action_5_or1z06\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_sqf5r2\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"4\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_eziqum\",\"fields\":{\"Value\":null,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_6c6zdg\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_3\",\"id\":\"reward_3_s6dghv\",\"fields\":{\"TARGET\":\"\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_xzocch\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T04:30:28.758Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\">\",\"A\":{\"type\":\"ACTION\",\"action\":\"5\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-19T04:30:28.758Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T04:30:28.758Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\">\",\"A\":{\"type\":\"ACTION\",\"action\":\"5\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"3\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 0, 'admin'),
(31, 37, NULL, NULL, '2025-09-19 13:36:09', '2025-09-19 13:36:09', 0, 'ซื้อ NEO 155 ลัง แถมทอง 1 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_o8cmph\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_nb3pz3\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_htbau1\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_ghyd1x\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"13\"],\"PRODUCT_SELECT\":\"13\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_y0u8z8\",\"fields\":{\"Value\":155,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_rwuvxd\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_13gwk4\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_qj7c2m\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:36:09.828Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"13\"],\"product\":\"13\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":155,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:36:09.828Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:36:09.828Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"13\"],\"product\":\"13\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":155,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(32, 37, NULL, NULL, '2025-09-19 13:46:25', '2025-09-19 13:46:25', 0, 'ซื้อ NEO 307 ลัง แถมทอง 2 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_rtqsoy\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_gzz8q1\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_8k8hzn\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_03jeru\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"13\"],\"PRODUCT_SELECT\":\"13\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_ncidbg\",\"fields\":{\"Value\":307,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_oazhcz\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_25lczf\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_h8id87\",\"fields\":{\"Value\":2,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:46:25.917Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"13\"],\"product\":\"13\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":307,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:46:25.917Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:46:25.917Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"13\"],\"product\":\"13\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":307,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(33, 37, NULL, NULL, '2025-09-19 13:47:17', '2025-09-19 13:47:17', 0, 'ซื้อ NEO 610 ลัง แถมทอง 1 บาท', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_ddz3op\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_4r8hhk\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_grxamz\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_8uarda\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"13\"],\"PRODUCT_SELECT\":\"13\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_nkkvs2\",\"fields\":{\"Value\":1,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:47:17.794Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"13\"],\"product\":\"13\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-19T06:47:17.794Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:47:17.794Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"13\"],\"product\":\"13\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(34, 38, NULL, NULL, '2025-09-19 13:48:20', '2025-09-19 13:48:20', 0, 'ซื้อ FS คละไซต์ 185 ลัง แจกทอง 1 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_7rwzxz\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_acd92s\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_ux4ke5\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_amfu9x\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"14\"],\"PRODUCT_SELECT\":\"14\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_ft350x\",\"fields\":{\"Value\":185,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_1tx6am\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_g17i6i\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_tmwpig\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:48:20.344Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"14\"],\"product\":\"14\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":185,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:48:20.344Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:48:20.344Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"14\"],\"product\":\"14\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":185,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(35, 38, NULL, NULL, '2025-09-19 13:48:20', '2025-09-19 13:49:23', 0, 'ซื้อ FS คละไซต์ 325 ลัง แจกทอง 2 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_h4jtfa\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_n743o8\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_xyeiht\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_rqil83\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"14\"],\"PRODUCT_SELECT\":\"14\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_imzyk0\",\"fields\":{\"Value\":325,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_rz4331\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_agdr91\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_9yz497\",\"fields\":{\"Value\":2,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:49:23.727Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"14\"],\"product\":\"14\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":325,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:49:23.727Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:49:23.727Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"14\"],\"product\":\"14\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":325,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(36, 38, NULL, NULL, '2025-09-19 13:48:20', '2025-09-19 13:49:49', 0, 'ซื้อ FS คละไซต์ 460 ลัง แจกทอง 1 บาท', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_axhbcx\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_g0bd9e\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_cmaswo\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_94dywe\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"14\"],\"PRODUCT_SELECT\":\"14\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_2azdaz\",\"fields\":{\"Value\":460,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_feu32p\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_zrofrf\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_uvcw63\",\"fields\":{\"Value\":1,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:49:49.540Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"14\"],\"product\":\"14\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":460,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:49:49.540Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:49:49.540Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"14\"],\"product\":\"14\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":460,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(37, 39, NULL, NULL, '2025-09-19 13:51:10', '2025-09-19 13:51:10', 0, 'ซื้อ STL มากกว่าหรือเท่ากับ 185 ลัง แถมทอง 1 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_8e1ofy\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_3irwin\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_m7rroj\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_ty7ed4\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"15\"],\"PRODUCT_SELECT\":\"15\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_jy2pdu\",\"fields\":{\"Value\":185,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_d0xspp\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_tnfeqs\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_su87t9\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:51:10.214Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"15\"],\"product\":\"15\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":185,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:51:10.214Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:51:10.214Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"15\"],\"product\":\"15\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":185,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(38, 39, NULL, NULL, '2025-09-19 13:51:10', '2025-09-19 13:52:26', 0, 'ซื้อ STL มากกว่าหรือเท่ากับ 325 ลัง แถมทอง 2 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_m57h8n\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_vk36jm\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_cykxli\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_t4iri6\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"15\"],\"PRODUCT_SELECT\":\"15\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_sh4pj6\",\"fields\":{\"Value\":325,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_mybg7o\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_vngixr\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_k8hmkc\",\"fields\":{\"Value\":2,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:52:26.909Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"15\"],\"product\":\"15\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":325,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:52:26.909Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:52:26.909Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"15\"],\"product\":\"15\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":325,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(39, 39, NULL, NULL, '2025-09-19 13:51:10', '2025-09-19 13:52:37', 0, 'ซื้อ STL มากกว่าหรือเท่ากับ 460 ลัง แถมทอง 1 บาท', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_7izdfq\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_t4iuai\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_jjk227\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_c9tvzk\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"15\"],\"PRODUCT_SELECT\":\"15\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_epeml8\",\"fields\":{\"Value\":460,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_zq09cj\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_cig188\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_djx0sn\",\"fields\":{\"Value\":1,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:52:37.952Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"15\"],\"product\":\"15\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":460,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:52:37.952Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:52:37.952Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"15\"],\"product\":\"15\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":460,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(40, 40, NULL, NULL, '2025-09-19 13:53:45', '2025-09-19 13:53:45', 0, 'ซื้อ RHINO ครบ 185 ลัง แถมทอง 1 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_s9i4bi\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_q1qgg6\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_rwp00k\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_t7rced\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"16\"],\"PRODUCT_SELECT\":\"16\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_tfgh7i\",\"fields\":{\"Value\":185,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_rf0wqq\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_5sd6tq\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_1xln9e\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:53:45.809Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"16\"],\"product\":\"16\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":185,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:53:45.809Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:53:45.809Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"16\"],\"product\":\"16\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":185,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(41, 40, NULL, NULL, '2025-09-19 13:53:45', '2025-09-19 13:54:44', 0, 'ซื้อ RHINO ครบ 325 ลัง แถมทอง 2 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_ydudoj\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_bdnvxq\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_t1wpvk\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_v6pmd9\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"16\"],\"PRODUCT_SELECT\":\"16\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_13eg7k\",\"fields\":{\"Value\":325,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_3q7brr\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_ikygsr\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_m603bj\",\"fields\":{\"Value\":2,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:54:44.551Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"16\"],\"product\":\"16\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":325,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:54:44.551Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:54:44.551Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"16\"],\"product\":\"16\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":325,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin');
INSERT INTO `condition` (`id`, `promotion_id`, `type`, `data`, `created_at`, `updated_at`, `campaign_id`, `condition_name`, `condition_xml`, `condition_code`, `code_lang`, `version`, `is_active`, `created_by`) VALUES
(42, 41, NULL, NULL, '2025-09-19 13:55:59', '2025-09-19 13:55:59', 0, 'ซื้อ EUTEK ครบ 145 ลัง แจกทอง 1 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_alrdhr\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_crgagb\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_65ijdb\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_e6gdxb\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"17\"],\"PRODUCT_SELECT\":\"17\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_8dmx02\",\"fields\":{\"Value\":145,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_ikxfbz\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_oi5o8i\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_mchkmj\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:55:59.482Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"17\"],\"product\":\"17\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":145,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:55:59.482Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:55:59.482Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"17\"],\"product\":\"17\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":145,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(43, 41, NULL, NULL, '2025-09-19 13:56:41', '2025-09-19 13:56:41', 0, 'ซื้อ EUTEK คละไซต์ ครบ 155 ลัง แจกทอง 1 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_kg6zde\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_mwjy0j\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_k1d6ql\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_s7wo1i\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"18\"],\"PRODUCT_SELECT\":\"18\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_lffp7c\",\"fields\":{\"Value\":155,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_oes0pp\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_8jf9kp\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_gbroca\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:56:41.731Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"18\"],\"product\":\"18\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":155,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:56:41.731Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:56:41.731Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"18\"],\"product\":\"18\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":155,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin');

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
-- Table structure for table `condition_link_category`
--

CREATE TABLE `condition_link_category` (
  `id` int(10) UNSIGNED NOT NULL,
  `condition_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `condition_link_product`
--

CREATE TABLE `condition_link_product` (
  `id` int(10) UNSIGNED NOT NULL,
  `condition_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(3, 'point', 'คะแนน');

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
(21, 15, 'AW-01', 'Awning', 'กันสาด', '', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11');

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
(15, 'Awning', 'กันสาด', 'สินค้ากันสาดต่างๆ');

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

--
-- Dumping data for table `promotion`
--

INSERT INTO `promotion` (`id`, `name`, `type`, `target`, `start_date`, `end_date`, `status`, `created_by`, `create_date`, `edit_date`, `promotion`, `code`, `location`, `note`, `description`, `campaign_id`) VALUES
(1, 'ลดตะปู 20%', 1, 1, '2025-04-01', '2025-04-10', 1, 2, '2025-03-21 09:00:00', NULL, 0, 'PR-202504-1001', 'สาขา A', 'ลดพิเศษเริ่มสัปดาห์แรก', 'ลดตะปูยี่ห้อ X 20%', 1),
(2, 'ซื้อ 2 แถม 1 สกรู', 1, 1, '2025-04-05', '2025-04-20', 1, 2, '2025-03-22 09:15:00', NULL, 0, 'PR-202504-1002', 'สาขา B', 'โปรกลางเดือน', 'Buy2Get1 สกรูทุกรุ่น', 1),
(3, 'ลดชุดเครื่องมือ 15%', 1, 1, '2025-04-10', '2025-04-30', 2, 2, '2025-03-23 09:30:00', NULL, 0, 'PR-202504-1003', 'Online', 'โปรเฉพาะออนไลน์', 'ส่วนลดชุดเครื่องมือ', 1),
(4, 'คูปอง 100 บาท', 2, 2, '2025-04-01', '2025-04-30', 3, 3, '2025-03-24 10:00:00', '2025-09-10 16:58:08', 0, 'PR-202504-1004', 'สาขาทั่วประเทศ', 'แจกคูปอง', 'ใช้ได้กับการสั่งซื้อครบ 1000', 1),
(5, 'สินค้าตัวโชว์ลด 50%', 1, 1, '2025-04-20', '2025-04-25', 3, 2, '2025-03-25 10:30:00', '2025-09-10 16:58:13', 0, 'PR-202504-1005', 'สาขา C', 'Clearance', 'ตัวโชว์/คืนสภาพ', 1),
(6, 'Member ลด 10% ทุกชิ้น', 1, 2, '2025-05-01', '2025-05-31', 1, 3, '2025-04-11 10:00:00', NULL, 0, 'PR-202505-2001', 'Online', 'เฉพาะสมาชิก', 'เฉพาะลูกค้าที่ล็อกอินและเป็น member', 2),
(7, 'คูปองสมาชิก 200', 2, 2, '2025-05-15', '2025-06-15', 1, 3, '2025-04-12 11:00:00', NULL, 0, 'PR-202505-2002', 'Online', 'แจกคูปองส่งท้ายเดือน', 'ใช้กับสินค้าที่ร่วมรายการ', 2),
(8, 'แจกคะแนนสะสม x2', 1, 2, '2025-06-01', '2025-06-30', 1, 3, '2025-04-13 11:30:00', NULL, 0, 'PR-202506-2003', 'Online', 'สมาชิกเท่านั้น', 'คะแนนสะสม 2 เท่า', 2),
(9, 'กระเป๋าช่างลด 30%', 1, 1, '2025-07-01', '2025-07-15', 2, 3, '2025-06-02 09:00:00', NULL, 0, 'PR-202507-4001', 'ร้านคู่ค้า', 'Early-bird', 'ลดเฉพาะร้านคู่ค้ารายใหญ่', 4),
(10, 'ชุดเครื่องมือเด็กโปรโมชั่น', 1, 1, '2025-07-10', '2025-07-25', 1, 3, '2025-06-03 09:30:00', NULL, 0, 'PR-202507-4002', 'สาขา D', 'Back-to-school', 'ลดสำหรับนักเรียน', 4),
(11, 'แถมอุปกรณ์ฟรีเมื่อซื้อ 3 ชิ้น', 2, 1, '2025-07-05', '2025-08-01', 1, 2, '2025-06-04 10:00:00', NULL, 0, 'PR-202507-4003', 'ร้านคู่ค้า', 'Bundle', 'โปรแถมเมื่อซื้อครบเงื่อนไข', 4),
(12, 'แจกของสมนาคุณครูช่าง', 2, 1, '2025-07-20', '2025-08-10', 1, 3, '2025-06-05 10:30:00', NULL, 0, 'PR-202507-4004', 'สาขา E', 'CSR', 'แจกของให้ครูช่าง', 4),
(13, 'ปลายปี ลดทั้งร้าน 12%', 1, 1, '2025-12-01', '2025-12-31', 3, 2, '2025-10-02 12:00:00', '2025-09-10 13:29:45', 0, 'PR-202512-5001', 'สาขาใหญ่', 'เทศกาลปลายปี', 'ลดเฉพาะรายการที่ร่วม', 5),
(14, 'จับฉลากของขวัญ', 2, 1, '2025-12-24', '2025-12-31', 3, 2, '2025-10-03 12:30:00', '2025-09-10 13:29:49', 0, 'PR-202512-5002', 'สาขาใหญ่', 'จับฉลาก', 'ของขวัญสำหรับลูกค้าหน้าร้าน', 5),
(15, 'Flash Sale - สว่าน 35%', 1, 1, '2025-09-03', '2025-09-03', 1, 1, '2025-08-26 09:30:00', NULL, 0, 'PR-202509-6001', 'Online', 'Flash sale วันเดียว', 'ลดสว่านรุ่นยอดนิยม', 6),
(16, 'Flash Sale - ใบตัด 40%', 1, 1, '2025-09-10', '2025-09-10', 1, 1, '2025-08-27 09:45:00', NULL, 0, 'PR-202509-6002', 'Online', 'Flash sale วันเดียว', 'ลดใบตัดทุกขนาด', 6),
(17, 'Weekend Deal - น้ำยาเชื่อม', 1, 1, '2025-09-12', '2025-09-14', 1, 1, '2025-08-28 10:00:00', NULL, 0, 'PR-202509-6003', 'Online + Store', 'ลดช่วงสุดสัปดาห์', 'โปรสินค้าบางรายการ', 6),
(18, 'คูปองส่งฟรี 7 วัน', 2, 2, '2025-09-01', '2025-09-07', 1, 1, '2025-08-29 10:15:00', NULL, 0, 'PR-202509-6004', 'Online', 'คูปองส่งฟรี', 'สำหรับการสั่งซื้อผ่านเว็บ', 6),
(19, 'test', 1, 2, '2025-09-17', '2025-09-25', 2, 0, '2025-09-10 13:28:02', '2025-09-18 15:38:43', 0, 'PROMO-20250910-4848', '2', '32', '12222123133221221231', 1),
(35, 'test2', 1, 1, '2025-01-03', '2025-01-02', 2, 0, '2025-09-18 15:17:07', '2025-09-18 15:21:11', 0, 'PROMO-20250918-8535', '', '', '3232223112', 1),
(37, 'จดโปรNEO (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:07:53', '2025-09-19 13:11:17', 0, 'PROMO-1', '', '', '', 8),
(38, 'จดโปรFS คละไซส์ (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:09:17', '2025-09-19 13:11:35', 0, 'PROMO-2', '', '', '', 8),
(39, 'จดโปรSTL (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:09:50', '2025-09-19 13:11:39', 0, 'PROMO-3', '', '', '', 8),
(40, 'จดโปรRHINO (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:10:24', '2025-09-19 13:11:43', 0, 'PROMO-4', '', '', '', 8),
(41, 'จดโปรEUTEK (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:10:51', '2025-09-19 13:11:47', 0, 'PROMO-5', '', '', '', 8),
(42, 'จดโปรSX-1300 (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:58:30', NULL, 0, 'PROMO-6', '', '', '', 8),
(50, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 16:05:20', NULL, 0, 'PROMO-20250919-4971', '', '', '', 9),
(51, '3', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 16:05:26', NULL, 0, 'PROMO-20250919-5674', '', '', '', 9),
(52, '3', 1, 1, '2025-01-03', '2025-01-03', 2, 0, '2025-09-19 16:05:31', NULL, 0, 'PROMO-20250919-2335', '', '', '', 9),
(53, '3', 1, 1, '2025-01-03', '2025-01-01', 2, 0, '2025-09-19 16:05:36', NULL, 0, 'PROMO-20250919-2980', '', '', '', 9),
(54, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 16:05:57', NULL, 0, 'PROMO-20250919-7355', '', '', '', 11),
(55, '3', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 16:06:02', NULL, 0, '3', '', '', '', 11),
(57, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:06:24', NULL, 0, 'PROMO-20250919-6095', '', '', '', 1),
(59, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:08:24', NULL, 0, 'PROMO-20250919-7060', '', '', '', 1),
(60, 's', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:10:50', NULL, 0, 'PROMO-20250919-2628', '', '', '', 1),
(62, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:11:32', NULL, 0, '2', '', '', '', 11),
(63, 'd', 1, 1, '2025-01-03', '2025-01-02', 2, 0, '2025-09-19 17:12:41', NULL, 0, 'PROMO-20250919-4596', '', '', '', 11),
(73, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:22:46', NULL, 0, 'd', '', '', '', 11),
(75, 'a', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:23:36', NULL, 0, 'sdadd', '', '', '', 11),
(76, 's', 1, 1, '2025-01-02', '2025-01-02', 2, 0, '2025-09-19 17:23:43', NULL, 0, 's', '', '', '', 11),
(80, 'ห', 1, 1, '2025-01-02', '2025-01-02', 2, 0, '2025-09-19 17:25:48', NULL, 0, 'ห', '', '', '', 11),
(84, 'zxczczxczc', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:29:00', NULL, 0, 'saada', '', '', '', 11),
(85, '2', 1, 1, '2025-01-02', '2025-01-02', 2, 0, '2025-09-19 17:29:10', NULL, 0, 'PROMO-20250919-1973', '', '', '', 11),
(88, 'asdadsda', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:33:28', NULL, 0, 'asdadsadada', '', '', '', 11);

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
(1, 'active', 'ACT', 'เปิดใช้งาน', 1, 'check-circle-fill\n-fill'),
(2, 'pending', 'PND', 'รอดำเนินการ', 2, 'hourglass-split'),
(3, 'Close', 'CLS', 'ปิดใช้งาน', 3, 'x-circle-fill');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(150) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Indexes for table `condition_link_category`
--
ALTER TABLE `condition_link_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `condition_id` (`condition_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `condition_link_product`
--
ALTER TABLE `condition_link_product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `condition_id` (`condition_id`),
  ADD KEY `product_id` (`product_id`);

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
  ADD UNIQUE KEY `ux_promotion_code` (`code`),
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
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_users_username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `campaign`
--
ALTER TABLE `campaign`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `condition_action`
--
ALTER TABLE `condition_action`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `condition_link_category`
--
ALTER TABLE `condition_link_category`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `condition_link_product`
--
ALTER TABLE `condition_link_product`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `condition_object`
--
ALTER TABLE `condition_object`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `condition_reward_action`
--
ALTER TABLE `condition_reward_action`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `condition_reward_object`
--
ALTER TABLE `condition_reward_object`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `products_categories`
--
ALTER TABLE `products_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `promotion`
--
ALTER TABLE `promotion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `condition`
--
ALTER TABLE `condition`
  ADD CONSTRAINT `fk_conditions_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `condition_link_category`
--
ALTER TABLE `condition_link_category`
  ADD CONSTRAINT `fk_clc_category` FOREIGN KEY (`category_id`) REFERENCES `products_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_clc_condition` FOREIGN KEY (`condition_id`) REFERENCES `condition` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `condition_link_product`
--
ALTER TABLE `condition_link_product`
  ADD CONSTRAINT `fk_clp_condition` FOREIGN KEY (`condition_id`) REFERENCES `condition` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_clp_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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