-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 26, 2025 at 01:08 PM
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
(1, 'โปรลดแรง เดือนเมษา', 'CMP-202504-001', 1, 'แคมเปญลดราคาสินค้าเครื่องมือช่าง', 1, 1, '2025-04-01', '2025-04-30', 'สาขาทั่วประเทศ', 'โปรแรงจำกัดเวลา 1', 2, '2025-03-20 09:00:00', '2025-09-26 11:27:10', 4),
(2, 'Member Exclusive Q2', 'CMP-202505-002', 1, 'สิทธิพิเศษสำหรับสมาชิก', 1, 2, '2025-05-01', '2025-06-30', 'Online', 'แจกคูปองเฉพาะสมาชิก', 3, '2025-04-10 10:00:00', '2025-09-22 10:23:41', 3),
(3, 'แคมเปญเก่ายกเลิก', 'CMP-202301-003', 2, 'แคมเปญหมดอายุ/ยกเลิก', 2, 1, '2024-01-01', '2024-02-28', 'สำนักงานใหญ่', 'ยกเลิกแล้ว', 2, '2024-01-01 08:00:00', '2025-09-22 10:23:43', 0),
(4, 'Back-to-School Promo', 'CMP-202507-004', 2, 'โปรโมชั่นต้อนรับเปิดเทอม', 1, 1, '2025-07-01', '2025-08-15', 'ร้านคู่ค้า', 'เน้นสต็อกสินค้า', 3, '2025-06-01 11:00:00', '2025-09-22 10:23:37', 4),
(5, 'โปรเทศกาลปลายปี', 'CMP-202512-005', 4, 'เตรียมแคมเปญปลายปี', 2, 1, '2025-12-01', '2025-12-31', 'สาขาใหญ่', 'วางแผนแจกของแถม', 2, '2025-10-01 12:00:00', '2025-09-22 10:20:13', 2),
(6, 'Weekly Flash Sale', 'CMP-202509-006', 3, 'Flash sale ทุกสัปดาห์', 1, 1, '2025-09-01', '2025-09-30', 'Online + Store', 'ลดหลายสินค้า', 1, '2025-08-25 09:30:00', '2025-09-22 10:23:45', 4),
(8, 'จดโปร (2025)', 'PROMO25', 2, '', 1, 1, '2025-01-01', '2025-08-31', '', '', NULL, '2025-09-19 12:00:50', '2025-09-23 13:47:01', 8);

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
(19, 5, NULL, NULL, '2025-09-18 14:12:01', '2025-09-19 11:33:06', 0, 'test 11', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_uk5qoe\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_wgp51t\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_sbhfx1\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_sl863h\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_j4xprq\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-18T07:12:22.987Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-18T07:12:22.987Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-18T07:12:22.987Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(20, 5, NULL, NULL, '2025-09-18 14:12:14', '2025-09-19 11:33:10', 0, 'test22', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_peszne\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_uiuq5u\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_4\",\"id\":\"action_4_cejbed\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_2\",\"id\":\"object_2_fza836\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"2\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_6ifa9r\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-18T07:12:30.309Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-18T07:12:30.309Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-18T07:12:30.309Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"2\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
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
(41, 40, NULL, NULL, '2025-09-19 13:53:45', '2025-09-19 13:54:44', 0, 'ซื้อ RHINO ครบ 325 ลัง แถมทอง 2 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_ydudoj\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_bdnvxq\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_t1wpvk\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_v6pmd9\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"16\"],\"PRODUCT_SELECT\":\"16\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_13eg7k\",\"fields\":{\"Value\":325,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_3q7brr\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_ikygsr\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_m603bj\",\"fields\":{\"Value\":2,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:54:44.551Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"16\"],\"product\":\"16\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":325,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:54:44.551Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:54:44.551Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"16\"],\"product\":\"16\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":325,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(42, 41, NULL, NULL, '2025-09-19 13:55:59', '2025-09-19 13:55:59', 0, 'ซื้อ EUTEK ครบ 145 ลัง แจกทอง 1 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_alrdhr\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_crgagb\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_65ijdb\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_e6gdxb\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"17\"],\"PRODUCT_SELECT\":\"17\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_8dmx02\",\"fields\":{\"Value\":145,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_ikxfbz\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_oi5o8i\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_mchkmj\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:55:59.482Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"17\"],\"product\":\"17\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":145,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:55:59.482Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:55:59.482Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"17\"],\"product\":\"17\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":145,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(43, 41, NULL, NULL, '2025-09-19 13:56:41', '2025-09-19 13:56:41', 0, 'ซื้อ EUTEK คละไซต์ ครบ 155 ลัง แจกทอง 1 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_kg6zde\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_mwjy0j\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_k1d6ql\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_s7wo1i\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"18\"],\"PRODUCT_SELECT\":\"18\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_lffp7c\",\"fields\":{\"Value\":155,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_oes0pp\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_8jf9kp\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_gbroca\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-19T06:56:41.731Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"18\"],\"product\":\"18\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":155,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-19T06:56:41.731Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-19T06:56:41.731Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"18\"],\"product\":\"18\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":155,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(44, 40, NULL, NULL, '2025-09-22 09:35:02', '2025-09-22 09:35:15', 0, 'a', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_e2yjjt\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_bpz315\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_88yk9n\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_kmllol\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_fs7hj8\",\"fields\":{\"Value\":102,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_yctvp5\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_xwyohb\",\"fields\":{\"TARGET\":\"product\"},\"inputs\":{\"PRODUCT_INPUT\":{\"block\":{\"type\":\"object_product\",\"id\":\"object_product_hltbmh\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_gy7b24\",\"fields\":{\"Value\":13,\"Unit\":\"4\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_v8fgj0\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_e01lk9\",\"fields\":{\"TARGET\":\"shirt\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_65aufg\",\"fields\":{\"Value\":34,\"Unit\":\"8\"}}}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-22T02:35:02.760Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":102,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"1\"],\"product\":\"1\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":13,\"unit\":\"4\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"shirt\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":34,\"unit\":\"8\"}}]}}]}]},\"saved_at\":\"2025-09-22T02:35:02.760Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-22T02:35:02.760Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":102,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"1\"],\"product\":\"1\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":13,\"unit\":\"4\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"shirt\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":34,\"unit\":\"8\"}}]}}]}]}', 'php', '1', 0, 'admin'),
(45, 41, NULL, NULL, '2025-09-22 14:29:24', '2025-09-22 16:16:48', 0, 'test', '{\"mode\":\"advance\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"Oicv{,UfV.v7$vuN=\\/8q\",\"x\":430,\"y\":110,\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"=1kBKP:lWklk|T3gIi,Y\",\"fields\":{\"OP\":\"GTE\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_buy\",\"id\":\"V2L_*Jp_e}Sax_*H+#MK\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_product\",\"id\":\"fGl1+z_0VDCc0kU`zoZd\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"B\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"qiqQ6Q%YjU*#dZp0Qy{A\",\"fields\":{\"Value\":1000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"fcQOw]Q=TcV3GCHn6mj~\",\"fields\":{\"LABEL_LEFT\":\"ให้ผลตอบแทน\",\"LABEL_EQ\":\"=\"},\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_discount\",\"id\":\"=_l_spyA1,PfC|Lg%X$.\",\"extraState\":\"<mutation target=\\\"PRODUCT\\\"><\\/mutation>\",\"fields\":{\"TARGET\":\"PRODUCT\"},\"inputs\":{\"PRODUCT_INPUT\":{\"block\":{\"type\":\"object_product\",\"id\":\"OuyuCbzFH9J$*^}IS:@M\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"A\"}}}}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"0$36F#q)hyqP7t72tJ+f\",\"fields\":{\"Value\":10,\"Unit\":\"2\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-22T09:16:39.119Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"B\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":1000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"PRODUCT\",\"product\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}}]}]},\"saved_at\":\"2025-09-22T09:16:39.119Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-22T09:16:39.119Z\",\"generated_by\":\"blockly-compiler-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"GTE\",\"A\":{\"type\":\"ACTION\",\"action\":\"BUY\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"B\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":1000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"left\":{\"type\":\"REWARD\",\"subtype\":\"DISCOUNT\",\"target\":\"PRODUCT\",\"product\":{\"type\":\"OBJECT\",\"kind\":\"PRODUCT\",\"product\":\"A\"}},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":10,\"unit\":\"2\"}}}]}]}', 'dsl-json', '1', 0, 'admin'),
(46, 5, NULL, NULL, '2025-09-22 16:47:19', '2025-09-22 16:47:37', 0, 'd', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_mij4bu\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_lnrgkd\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_5\",\"id\":\"action_5_ox7slk\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_963zq2\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_z3owdq\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-22T09:47:19.851Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"5\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-22T09:47:19.851Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-22T09:47:19.851Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"5\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 0, 'admin');
INSERT INTO `condition` (`id`, `promotion_id`, `type`, `data`, `created_at`, `updated_at`, `campaign_id`, `condition_name`, `condition_xml`, `condition_code`, `code_lang`, `version`, `is_active`, `created_by`) VALUES
(47, 41, NULL, NULL, '2025-09-23 09:33:05', '2025-09-23 09:33:19', 0, 'abc', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_fum5hc\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_crm3sp\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_iemwua\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_y8ozks\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"1\",\"2\",\"3\"],\"PRODUCT_SELECT\":\"1\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_1tabj2\",\"fields\":{\"Value\":2000,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_cwd8n3\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_rhbwg6\",\"fields\":{\"TARGET\":\"total\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_ub7ci6\",\"fields\":{\"Value\":20,\"Unit\":\"1\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-23T02:33:05.157Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\",\"2\",\"3\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":20,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-23T02:33:05.157Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-23T02:33:05.157Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"1\",\"2\",\"3\"],\"product\":\"1\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2000,\"unit\":\"1\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"total\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":20,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 0, 'admin'),
(48, 42, NULL, NULL, '2025-09-23 13:14:53', '2025-09-23 13:14:53', 0, 'ซื้อ Sx-1300 ครบ 102 แถม Sx-1300 13 ลัง และ แถมเสื้อ 34 ตัว', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_8hkkdz\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_44zoh0\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_l3hp0q\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_v42jqw\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"19\"],\"PRODUCT_SELECT\":\"19\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_zasri0\",\"fields\":{\"Value\":102,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_otgqbb\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_5myrfw\",\"fields\":{\"TARGET\":\"product\"},\"inputs\":{\"PRODUCT_INPUT\":{\"block\":{\"type\":\"object_product\",\"id\":\"object_product_hrdnno\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"19\"],\"PRODUCT_SELECT\":\"19\"}}}}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_96ojzh\",\"fields\":{\"Value\":13,\"Unit\":\"4\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_c4z8aq\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_cfvum9\",\"fields\":{\"TARGET\":\"shirt\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_smgvoy\",\"fields\":{\"Value\":34,\"Unit\":\"8\"}}}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-23T06:14:53.909Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"19\"],\"product\":\"19\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":102,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"19\"],\"product\":\"19\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":13,\"unit\":\"4\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"shirt\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":34,\"unit\":\"8\"}}]}}]}]},\"saved_at\":\"2025-09-23T06:14:53.910Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-23T06:14:53.909Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"19\"],\"product\":\"19\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":102,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"19\"],\"product\":\"19\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":13,\"unit\":\"4\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"shirt\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":34,\"unit\":\"8\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(49, 42, NULL, NULL, '2025-09-23 13:16:37', '2025-09-23 13:16:37', 0, 'ซื้อ Sx-1300 ครบ 201 แถม Sx-1300 26 ลัง และ แถมเสื้อ 67 ตัว', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_8514o9\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_zn9fsh\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_ljqwvl\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_w0hs7i\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"19\"],\"PRODUCT_SELECT\":\"19\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_eq8bo1\",\"fields\":{\"Value\":201,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_969ctm\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_zjfaur\",\"fields\":{\"TARGET\":\"product\"},\"inputs\":{\"PRODUCT_INPUT\":{\"block\":{\"type\":\"object_product\",\"id\":\"object_product_2e8aux\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"19\"],\"PRODUCT_SELECT\":\"19\"}}}}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_1sbrlr\",\"fields\":{\"Value\":26,\"Unit\":\"4\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_3hwt1y\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_jl1gqe\",\"fields\":{\"TARGET\":\"shirt\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_kupvmc\",\"fields\":{\"Value\":67,\"Unit\":\"8\"}}}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-23T06:16:37.487Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"19\"],\"product\":\"19\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":201,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"19\"],\"product\":\"19\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":26,\"unit\":\"4\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"shirt\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":67,\"unit\":\"8\"}}]}}]}]},\"saved_at\":\"2025-09-23T06:16:37.487Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-23T06:16:37.487Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"19\"],\"product\":\"19\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":201,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"19\"],\"product\":\"19\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":26,\"unit\":\"4\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"shirt\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":67,\"unit\":\"8\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(50, 42, NULL, NULL, '2025-09-23 13:18:04', '2025-09-23 13:25:58', 0, 'ซื้อ Sx-1300 ครบ 235 แถมทอง 1 สลึง และ แถมเสื้อ 34 ตัว', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_v3o54w\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_rrdn59\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_7wmitg\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_mmbj8j\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"8\",\"9\"],\"PRODUCT_SELECT\":\"8\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_d6e3sa\",\"fields\":{\"Value\":235,\"Unit\":\"4\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_d12xlz\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_r9jem2\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_7jylrs\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_v1fyai\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_rbfc10\",\"fields\":{\"TARGET\":\"shirt\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_esn0yu\",\"fields\":{\"Value\":34,\"Unit\":\"8\"}}}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-23T06:25:58.077Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"8\",\"9\"],\"product\":\"8\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":235,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"shirt\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":34,\"unit\":\"8\"}}]}}]}]},\"saved_at\":\"2025-09-23T06:25:58.077Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-23T06:25:58.077Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"8\",\"9\"],\"product\":\"8\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":235,\"unit\":\"4\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"shirt\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":34,\"unit\":\"8\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(51, 42, NULL, NULL, '2025-09-23 13:32:15', '2025-09-23 13:32:21', 0, 'test', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_cts29f\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_4legnu\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_4\",\"id\":\"action_4_h7gejs\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_etblhc\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"4\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_5nkht4\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-23T06:32:15.797Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-23T06:32:15.797Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-23T06:32:15.797Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 0, 'admin'),
(52, 99, NULL, NULL, '2025-09-23 13:45:47', '2025-09-23 13:45:47', 0, 'ซื้อ ลวดเชื่อมครบ 1 ห่อ แถมใบตัด 2 ใบ และค่าหยิบ ห่อละ 5 บาท', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_59ko1d\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_r98drx\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_v5ajr5\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_cm8zuz\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"20\"],\"PRODUCT_SELECT\":\"20\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_h7pk1o\",\"fields\":{\"Value\":1,\"Unit\":\"11\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_a6rhps\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_jrdbh0\",\"fields\":{\"TARGET\":\"product\"},\"inputs\":{\"PRODUCT_INPUT\":{\"block\":{\"type\":\"object_product\",\"id\":\"object_product_94tso0\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"22\"],\"PRODUCT_SELECT\":\"22\"}}}}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_0a29vb\",\"fields\":{\"Value\":2,\"Unit\":\"10\"}}}},\"next\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_2hi68x\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_4\",\"id\":\"reward_4_lgejlw\",\"fields\":{\"TARGET\":\"\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_lyl530\",\"fields\":{\"Value\":5,\"Unit\":\"1\"}}}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-23T06:45:47.971Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"20\"],\"product\":\"20\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"11\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"22\"],\"product\":\"22\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"10\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"4\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":5,\"unit\":\"1\"}}]}}]}]},\"saved_at\":\"2025-09-23T06:45:47.971Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-23T06:45:47.971Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"20\"],\"product\":\"20\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"11\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"product\",\"product_ids\":[\"22\"],\"product\":\"22\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"10\"}},{\"left\":{\"type\":\"REWARD\",\"subtype\":\"4\",\"target\":\"\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":5,\"unit\":\"1\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(53, 100, NULL, NULL, '2025-09-23 13:48:45', '2025-09-23 13:48:45', 0, 'ซื้อ กันสาด ครบ 200 เมตร ลดตาม 3%', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_oedoee\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_b4hbag\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_wc0uqa\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_b5t2nt\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"21\"],\"PRODUCT_SELECT\":\"21\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_t9gzsa\",\"fields\":{\"Value\":200,\"Unit\":\"7\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_ff913l\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_1\",\"id\":\"reward_1_cb858e\",\"fields\":{\"TARGET\":\"product\"},\"inputs\":{\"PRODUCT_INPUT\":{\"block\":{\"type\":\"object_product\",\"id\":\"object_product_t1vbce\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"21\"],\"PRODUCT_SELECT\":\"21\"}}}}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_zgb6p5\",\"fields\":{\"Value\":3,\"Unit\":\"2\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-23T06:48:45.497Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"21\"],\"product\":\"21\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":200,\"unit\":\"7\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"product\",\"product_ids\":[\"21\"],\"product\":\"21\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":3,\"unit\":\"2\"}}]}}]}]},\"saved_at\":\"2025-09-23T06:48:45.497Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-23T06:48:45.497Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"21\"],\"product\":\"21\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":200,\"unit\":\"7\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"1\",\"target\":\"product\",\"product_ids\":[\"21\"],\"product\":\"21\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":3,\"unit\":\"2\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(54, 100, NULL, NULL, '2025-09-23 13:49:50', '2025-09-23 13:49:50', 0, 'ซื้อ กันสาด ครบ 350 เมตร แถมทองครึ่งสลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_hvghpy\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_44vnll\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_lldkm6\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_hh5pah\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"21\"],\"PRODUCT_SELECT\":\"21\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_dj5tlp\",\"fields\":{\"Value\":350,\"Unit\":\"7\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_z24ut1\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_85646s\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_aiu7uh\",\"fields\":{\"Value\":0.5,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-23T06:49:50.391Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"21\"],\"product\":\"21\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":350,\"unit\":\"7\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0.5,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-23T06:49:50.391Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-23T06:49:50.391Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"21\"],\"product\":\"21\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":350,\"unit\":\"7\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":0.5,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(55, 100, NULL, NULL, '2025-09-23 13:50:35', '2025-09-23 13:50:35', 0, 'ซื้อ กันสาด ครบ 500 เมตร แถมทอง 1 สลึง', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_gd5agn\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_h1k8f4\",\"fields\":{\"OP\":\"≥\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_1\",\"id\":\"action_1_74ugjr\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_1\",\"id\":\"object_1_y1yu5t\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_IDS\":[\"21\"],\"PRODUCT_SELECT\":\"21\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_i1pljv\",\"fields\":{\"Value\":500,\"Unit\":\"7\"}}}}}},\"DO0\":{\"block\":{\"type\":\"reward_block\",\"id\":\"reward_block_nim7ke\",\"inputs\":{\"LEFT\":{\"block\":{\"type\":\"reward_2\",\"id\":\"reward_2_6we38j\",\"fields\":{\"TARGET\":\"gold\"}}},\"RIGHT\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_mk2w80\",\"fields\":{\"Value\":1,\"Unit\":\"6\"}}}}}}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-23T06:50:35.704Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"21\"],\"product\":\"21\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":500,\"unit\":\"7\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]},\"saved_at\":\"2025-09-23T06:50:35.704Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-23T06:50:35.704Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"≥\",\"A\":{\"type\":\"ACTION\",\"action\":\"1\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"1\",\"product_ids\":[\"21\"],\"product\":\"21\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":500,\"unit\":\"7\"}},\"then\":{\"type\":\"REWARD_BLOCK\",\"rewards\":[{\"left\":{\"type\":\"REWARD\",\"subtype\":\"2\",\"target\":\"gold\"},\"right\":{\"type\":\"VALUE_UNIT\",\"value\":1,\"unit\":\"6\"}}]}}]}]}', 'php', '1', 1, 'admin'),
(56, 5, NULL, NULL, '2025-09-24 13:27:16', '2025-09-24 13:27:16', 0, 'd', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_ehkxd8\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_0regkh\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_3\",\"id\":\"action_3_8mbhoa\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_5jcu4f\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_o1pyzk\",\"fields\":{\"Value\":null,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-24T06:27:16.039Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-24T06:27:16.040Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-24T06:27:16.039Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(57, 5, NULL, NULL, '2025-09-24 13:27:30', '2025-09-24 13:27:30', 0, 'asdad', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_miv250\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_s89dtf\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_4\",\"id\":\"action_4_cndkfm\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_7jcehq\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_1jrzm1\",\"fields\":{\"Value\":2,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-24T06:27:30.044Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-24T06:27:30.044Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-24T06:27:30.044Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":2,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(58, 5, NULL, NULL, '2025-09-24 13:27:37', '2025-09-24 13:27:37', 0, 'asdad', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_jm6rc5\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_jh7m3i\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_4\",\"id\":\"action_4_graq51\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_rinsz9\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_f554f9\",\"fields\":{\"Value\":4,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-24T06:27:37.210Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":4,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-24T06:27:37.210Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-24T06:27:37.210Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":4,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(59, 5, NULL, NULL, '2025-09-24 13:27:44', '2025-09-24 13:27:44', 0, '12e', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_ikegus\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_b3hezp\",\"fields\":{\"OP\":\"=\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_4\",\"id\":\"action_4_ws5ymk\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_4\",\"id\":\"object_4_ls3sp6\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"4\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_vrn80g\",\"fields\":{\"Value\":null,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-24T06:27:44.449Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-24T06:27:44.449Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-24T06:27:44.449Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"=\",\"A\":{\"type\":\"ACTION\",\"action\":\"4\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"4\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin'),
(60, 4, NULL, NULL, '2025-09-25 14:20:53', '2025-09-25 14:20:53', 0, 'asdads', '{\"mode\":\"basic\",\"workspace\":{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"controls_if\",\"id\":\"controls_if_phvgyz\",\"inputs\":{\"IF0\":{\"block\":{\"type\":\"logic_compare\",\"id\":\"logic_compare_uucjb9\",\"fields\":{\"OP\":\"<\"},\"inputs\":{\"A\":{\"block\":{\"type\":\"action_3\",\"id\":\"action_3_nxnshq\",\"inputs\":{\"OBJECT\":{\"block\":{\"type\":\"object_3\",\"id\":\"object_3_r6layy\",\"fields\":{\"LABEL\":\"สินค้า\",\"PRODUCT_SELECT\":\"3\"}}}}}},\"B\":{\"block\":{\"type\":\"Value_Unit\",\"id\":\"Value_Unit_3zb1yw\",\"fields\":{\"Value\":null,\"Unit\":\"1\"}}}}}},\"DO0\":{\"block\":null}}}]}},\"compiled_dsl\":{\"meta\":{\"generated_at\":\"2025-09-25T07:20:53.663Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"<\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]},\"saved_at\":\"2025-09-25T07:20:53.667Z\"}', '{\"meta\":{\"generated_at\":\"2025-09-25T07:20:53.663Z\",\"generated_by\":\"basic-mapper-v1\"},\"rules\":[{\"type\":\"IF\",\"branches\":[{\"cond\":{\"type\":\"COMPARE\",\"op\":\"<\",\"A\":{\"type\":\"ACTION\",\"action\":\"3\",\"object\":{\"type\":\"OBJECT\",\"kind\":\"3\",\"product_ids\":[],\"product\":\"\"}},\"B\":{\"type\":\"VALUE_UNIT\",\"value\":0,\"unit\":\"1\"}},\"then\":null}]}]}', 'php', '1', 1, 'admin');

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

--
-- Dumping data for table `customer_groups`
--

INSERT INTO `customer_groups` (`id`, `name`, `condition_id`, `promotion_id`, `start_date`, `end_date`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(2, 'b', 19, 5, '2025-01-01 00:00:00', '2025-08-22 00:00:00', NULL, NULL, '2025-09-25 17:28:42', '2025-09-25 17:38:51'),
(3, 'c', 60, 4, '2025-01-01 00:00:00', '2025-08-23 00:00:00', NULL, NULL, '2025-09-25 17:33:00', '2025-09-25 17:38:57'),
(5, 'e', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:06:15', NULL),
(6, 'f', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(8, 'h', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(9, 'i', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(10, 'j', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(11, 'k', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(12, 'l', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(13, 'm', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(14, 'n', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(15, 'o', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(16, 'p', 2, 1, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 11:11:10', NULL),
(17, 'asd', 58, 5, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 15:36:17', NULL),
(18, 'ฟกหฟหกฟก', 58, 5, '2025-01-01 00:00:00', '2025-01-02 00:00:00', NULL, NULL, '2025-09-26 15:42:02', '2025-09-26 16:19:45'),
(20, 'อื่นๆ', 58, 5, '2025-09-01 00:00:00', '2025-09-30 00:00:00', NULL, NULL, '2025-09-26 17:52:22', '2025-09-26 17:53:46');

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

--
-- Dumping data for table `customer_group_members`
--

INSERT INTO `customer_group_members` (`id`, `group_id`, `customer_id`, `added_by`, `added_at`, `select_all`) VALUES
(3, 2, 6676, 0, '2025-09-25 17:28:42', 1),
(4, 2, 6679, 0, '2025-09-25 17:28:42', 1),
(5, 2, 6681, 0, '2025-09-25 17:28:42', 0),
(6, 2, 7028, 0, '2025-09-25 17:28:42', 0),
(7, 2, 7037, 0, '2025-09-25 17:28:42', 0),
(8, 2, 7039, 0, '2025-09-25 17:28:42', 0),
(9, 2, 7043, 0, '2025-09-25 17:28:42', 0),
(10, 2, 7047, 0, '2025-09-25 17:28:42', 0),
(11, 2, 7082, 0, '2025-09-25 17:28:42', 0),
(12, 3, 5402, 0, '2025-09-25 17:33:00', 1),
(13, 3, 5416, 0, '2025-09-25 17:33:00', 0),
(14, 3, 5469, 0, '2025-09-25 17:33:00', 0),
(15, 3, 5553, 0, '2025-09-25 17:33:00', 0),
(16, 3, 6253, 0, '2025-09-25 17:33:00', 1),
(17, 3, 6254, 0, '2025-09-25 17:33:00', 1),
(18, 3, 6256, 0, '2025-09-25 17:33:00', 1),
(28, 5, 5416, 0, '2025-09-26 11:06:15', 0),
(29, 5, 5469, 0, '2025-09-26 11:06:15', 0),
(30, 5, 5553, 0, '2025-09-26 11:06:15', 1),
(31, 6, 5402, 0, '2025-09-26 11:11:10', 0),
(32, 6, 7082, 0, '2025-09-25 17:28:42', 0),
(34, 8, 9168, 0, '2025-09-25 17:44:31', 1),
(35, 9, 9212, 0, '2025-09-25 17:44:31', 1),
(36, 10, 9243, 0, '2025-09-25 17:44:31', 0),
(37, 11, 9254, 0, '2025-09-25 17:44:31', 0),
(38, 12, 9273, 0, '2025-09-25 17:44:31', 0),
(39, 13, 12435, 0, '2025-09-25 17:44:31', 0),
(40, 14, 7047, 0, '2025-09-25 17:28:42', 0),
(46, 15, 7047, 0, '2025-09-25 17:28:42', 0),
(47, 16, 7047, 0, '2025-09-25 17:28:42', 0),
(48, 14, 7082, 0, '2025-09-25 17:28:42', 0),
(49, 12, 7082, 0, '2025-09-25 17:28:42', 0),
(50, 11, 9162, 0, '2025-09-25 17:44:31', 1),
(51, 17, 5402, NULL, '2025-09-26 15:36:17', 0),
(52, 17, 5469, NULL, '2025-09-26 15:36:17', 0),
(53, 17, 6058, NULL, '2025-09-26 15:36:17', 0),
(74, 18, 5385, NULL, '2025-09-26 16:19:45', 0),
(75, 18, 5402, NULL, '2025-09-26 16:19:45', 0),
(76, 18, 5416, NULL, '2025-09-26 16:19:45', 0),
(77, 18, 5469, NULL, '2025-09-26 16:19:45', 0),
(78, 18, 5553, NULL, '2025-09-26 16:19:45', 0),
(79, 18, 6058, NULL, '2025-09-26 16:19:45', 0),
(80, 18, 6253, NULL, '2025-09-26 16:19:45', 0),
(81, 18, 6254, NULL, '2025-09-26 16:19:45', 0),
(82, 18, 6256, NULL, '2025-09-26 16:19:45', 0),
(83, 18, 6259, NULL, '2025-09-26 16:19:45', 0),
(87, 20, 7039, NULL, '2025-09-26 17:53:46', 0),
(88, 20, 7043, NULL, '2025-09-26 17:53:46', 1),
(89, 20, 7124, NULL, '2025-09-26 17:53:46', 1);

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
(22, 16, 'TR-01', 'TORO', 'ใบตัด', 'TORO', '', '2025-09-10 12:51:11', '2025-09-10 12:51:11');

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
(16, 'TORO', 'ใบตัด', 'สินค้าใบตัดต่างๆ');

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
(4, 'คูปอง 100 บาท', 2, 2, '2025-04-01', '2025-04-30', 3, 3, '2025-03-24 10:00:00', '2025-09-10 16:58:08', 0, 'PR-202504-1004', 'สาขาทั่วประเทศ', 'แจกคูปอง', 'ใช้ได้กับการสั่งซื้อครบ 1000', 1),
(5, 'สินค้าตัวโชว์ลด 50%', 1, 1, '2025-04-20', '2025-04-25', 3, 2, '2025-03-25 10:30:00', '2025-09-26 11:27:46', 0, 'PR-202504-1005', 'สาขา C', 'Clearance', 'ตัวโชว์/คืนสภาพ', 1),
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
(37, 'จดโปรNEO (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:07:53', '2025-09-19 13:11:17', 0, 'PROMO-1', '', '', '', 8),
(38, 'จดโปรFS คละไซส์ (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:09:17', '2025-09-19 13:11:35', 0, 'PROMO-2', '', '', '', 8),
(39, 'จดโปรSTL (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:09:50', '2025-09-19 13:11:39', 0, 'PROMO-3', '', '', '', 8),
(40, 'จดโปรRHINO (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:10:24', '2025-09-19 13:11:43', 0, 'PROMO-4', '', '', '', 8),
(41, 'จดโปรEUTEK (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-19 13:10:51', '2025-09-23 09:14:53', 0, 'PROMO-5', '', '', '', 8),
(42, 'จดโปรSX-1300 (2025)', 1, 1, '2025-01-01', '2025-08-31', 1, 0, '2025-09-19 13:58:30', '2025-09-23 13:33:36', 0, 'PROMO-6', '', '', '', 8),
(50, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 16:05:20', NULL, 0, 'PROMO-20250919-4971', '', '', '', NULL),
(51, '3', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 16:05:26', NULL, 0, 'PROMO-20250919-5674', '', '', '', NULL),
(52, '3', 1, 1, '2025-01-03', '2025-01-03', 2, 0, '2025-09-19 16:05:31', NULL, 0, 'PROMO-20250919-2335', '', '', '', NULL),
(53, '3', 1, 1, '2025-01-03', '2025-01-01', 2, 0, '2025-09-19 16:05:36', NULL, 0, 'PROMO-20250919-2980', '', '', '', NULL),
(54, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 16:05:57', NULL, 0, 'PROMO-20250919-7355', '', '', '', NULL),
(55, '3', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 16:06:02', NULL, 0, '3', '', '', '', NULL),
(62, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:11:32', NULL, 0, '2', '', '', '', NULL),
(63, 'd', 1, 1, '2025-01-03', '2025-01-02', 2, 0, '2025-09-19 17:12:41', NULL, 0, 'PROMO-20250919-4596', '', '', '', NULL),
(73, 'd', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:22:46', NULL, 0, 'd', '', '', '', NULL),
(75, 'a', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:23:36', NULL, 0, 'sdadd', '', '', '', NULL),
(76, 's', 1, 1, '2025-01-02', '2025-01-02', 2, 0, '2025-09-19 17:23:43', NULL, 0, 's', '', '', '', NULL),
(80, 'ห', 1, 1, '2025-01-02', '2025-01-02', 2, 0, '2025-09-19 17:25:48', NULL, 0, 'ห', '', '', '', NULL),
(84, 'zxczczxczc', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:29:00', NULL, 0, 'saada', '', '', '', NULL),
(85, '2', 1, 1, '2025-01-02', '2025-01-02', 2, 0, '2025-09-19 17:29:10', NULL, 0, 'PROMO-20250919-1973', '', '', '', NULL),
(88, 'asdadsda', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:33:28', NULL, 0, 'asdadsadada', '', '', '', NULL),
(94, 'asdasda', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:40:46', NULL, 0, '2', '', '', '', NULL),
(95, 'asddsad', 1, 1, '2025-01-02', '2025-01-03', 2, 0, '2025-09-19 17:40:56', NULL, 0, '2', '', '', '', NULL),
(96, 'd', 1, 1, '2025-01-02', '2025-01-02', 2, 0, '2025-09-19 17:42:56', NULL, 0, '2', '', '', '', NULL),
(99, 'จดโปรลวดเชื่อม (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-23 13:42:23', NULL, 0, 'PROMO7', '', '', '', 8),
(100, 'จดโปรกันสาด (2025)', 1, 1, '2025-01-01', '2025-08-31', 2, 0, '2025-09-23 13:47:01', NULL, 0, 'PROMO8', '', '', '', 8);

-- --------------------------------------------------------

--
-- Table structure for table `promotion_customer_records`
--

CREATE TABLE `promotion_customer_records` (
  `id` int(11) NOT NULL,
  `promotion_id` int(10) UNSIGNED NOT NULL,
  `customer_group_id` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `create_date` datetime NOT NULL DEFAULT current_timestamp(),
  `update_date` datetime DEFAULT NULL ON UPDATE current_timestamp()
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
-- Indexes for table `promotion_customer_records`
--
ALTER TABLE `promotion_customer_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_promotion_group` (`promotion_id`,`customer_group_id`),
  ADD KEY `ix_pcr_promotion_id` (`promotion_id`),
  ADD KEY `ix_pcr_customer_group_id` (`customer_group_id`);

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `customer_group_members`
--
ALTER TABLE `customer_group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `products_categories`
--
ALTER TABLE `products_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `promotion`
--
ALTER TABLE `promotion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `promotion_customer_records`
--
ALTER TABLE `promotion_customer_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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

--
-- Constraints for table `promotion_customer_records`
--
ALTER TABLE `promotion_customer_records`
  ADD CONSTRAINT `fk_pcr_customer_group` FOREIGN KEY (`customer_group_id`) REFERENCES `customer_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pcr_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;