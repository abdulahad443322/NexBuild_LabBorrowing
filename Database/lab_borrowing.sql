-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2026 at 02:34 PM
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
-- Database: `lab_borrowing`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `old_status` varchar(30) DEFAULT NULL,
  `new_status` varchar(30) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `request_id`, `old_status`, `new_status`, `changed_by`, `changed_at`) VALUES
(1, 50, NULL, 'pending', 40, '2026-11-22 11:26:33'),
(2, 51, NULL, 'pending', 40, '2026-11-22 11:26:38'),
(3, 52, NULL, 'pending', 41, '2026-11-22 11:27:26'),
(4, 53, NULL, 'pending', 41, '2026-11-22 11:27:29'),
(5, 53, 'pending', 'cancelled', NULL, '2026-11-22 11:27:34'),
(6, 54, NULL, 'pending', 41, '2026-11-22 11:27:40'),
(7, 52, 'pending', 'approved', 31, '2026-11-22 11:28:48'),
(8, 52, 'approved', 'issued', 31, '2026-11-22 11:28:54'),
(9, 50, 'pending', 'rejected', 31, '2026-11-22 11:28:58'),
(10, 54, 'pending', 'approved', 31, '2026-11-22 11:29:01'),
(11, 51, 'pending', 'approved', 31, '2026-11-22 11:29:06'),
(12, 51, 'approved', 'issued', 31, '2026-11-22 11:29:11'),
(13, 51, 'issued', 'returned', 16, '2026-11-22 11:31:53'),
(14, 52, 'issued', 'returned', 16, '2026-11-22 11:32:03');

-- --------------------------------------------------------

--
-- Table structure for table `borrow_requests`
--

CREATE TABLE `borrow_requests` (
  `request_id` int(11) NOT NULL,
  `borrower_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `status` enum('issued','pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `request_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` int(11) DEFAULT NULL,
  `staff_note` text DEFAULT NULL,
  `review_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrow_requests`
--

INSERT INTO `borrow_requests` (`request_id`, `borrower_id`, `item_id`, `status`, `request_time`, `reviewed_by`, `staff_note`, `review_time`) VALUES
(50, 40, 16, 'rejected', '2026-11-22 11:26:33', 31, NULL, '2026-11-22 16:28:58'),
(51, 40, 17, 'approved', '2026-11-22 11:26:38', 31, NULL, '2026-11-22 16:29:06'),
(52, 41, 14, 'approved', '2026-11-22 11:27:26', 31, NULL, '2026-11-22 16:28:48'),
(53, 41, 16, 'cancelled', '2026-11-22 11:27:29', NULL, NULL, '2026-11-22 16:27:34'),
(54, 41, 16, 'approved', '2026-11-22 11:27:40', 31, NULL, '2026-11-22 16:29:01');

--
-- Triggers `borrow_requests`
--
DELIMITER $$
CREATE TRIGGER `request_creation_history` AFTER INSERT ON `borrow_requests` FOR EACH ROW BEGIN
    INSERT INTO activity_logs
    (request_id, old_status, new_status, changed_by)
    VALUES
    (NEW.request_id, NULL, NEW.status, NEW.borrower_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `request_status_history` AFTER UPDATE ON `borrow_requests` FOR EACH ROW BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO activity_logs
        (request_id,old_status,new_status,changed_by
        )
        VALUES
        (
            NEW.request_id,
            OLD.status,
            NEW.status,
            NEW.reviewed_by
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_items`
--

CREATE TABLE `inventory_items` (
  `item_id` int(11) NOT NULL,
  `category` int(11) NOT NULL,
  `item_name` varchar(150) NOT NULL,
  `item_description` text DEFAULT NULL,
  `item_condition` enum('good','fair','damaged') NOT NULL DEFAULT 'good',
  `availability` enum('available','reserved','borrowed','maintenance','retired') NOT NULL DEFAULT 'available',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_items`
--

INSERT INTO `inventory_items` (`item_id`, `category`, `item_name`, `item_description`, `item_condition`, `availability`, `created_by`, `created_at`, `updated_at`) VALUES
(14, 6, 'urdu', '', 'good', 'available', 16, '2026-11-12 14:50:33', '2026-11-22 11:32:03'),
(16, 6, 'Notebook', '', 'good', 'available', 16, '2026-11-12 15:02:20', '2026-11-22 11:25:53'),
(17, 7, 'Mouse', '', 'good', 'available', 16, '2026-11-21 18:58:06', '2026-11-22 11:31:53'),
(21, 17, 'BAT', '', 'good', 'available', 31, '2026-11-22 11:28:41', '2026-11-22 11:28:41');

-- --------------------------------------------------------

--
-- Table structure for table `item_categories`
--

CREATE TABLE `item_categories` (
  `c_id` int(11) NOT NULL,
  `c_name` varchar(100) NOT NULL,
  `c_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `item_categories`
--

INSERT INTO `item_categories` (`c_id`, `c_name`, `c_description`, `created_at`, `updated_at`) VALUES
(6, 'Books', '', '2026-11-07 15:27:34', '2026-11-21 22:39:49'),
(7, 'Electronics', 'electronics', '2026-11-12 12:41:28', '2026-11-22 16:28:30'),
(17, 'Sports', '', '2026-11-22 11:28:22', '2026-11-22 16:28:22');

-- --------------------------------------------------------

--
-- Table structure for table `loan_transactions`
--

CREATE TABLE `loan_transactions` (
  `loan_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `issued_by` int(11) NOT NULL,
  `issued_at` datetime NOT NULL DEFAULT current_timestamp(),
  `due_date` date NOT NULL,
  `is_returned` tinyint(1) NOT NULL DEFAULT 0,
  `returned_at` datetime DEFAULT NULL,
  `received_by` int(11) DEFAULT NULL,
  `return_condition` enum('good','fair','damaged') DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_transactions`
--

INSERT INTO `loan_transactions` (`loan_id`, `request_id`, `issued_by`, `issued_at`, `due_date`, `is_returned`, `returned_at`, `received_by`, `return_condition`, `notes`) VALUES
(41, 52, 31, '2026-11-22 16:28:54', '2026-11-23', 1, '2026-11-22 16:32:03', 16, 'good', ''),
(42, 51, 31, '2026-11-22 16:29:11', '2026-11-24', 1, '2026-11-22 16:31:53', 16, 'good', '');

--
-- Triggers `loan_transactions`
--
DELIMITER $$
CREATE TRIGGER `item_borrowed` AFTER INSERT ON `loan_transactions` FOR EACH ROW BEGIN
    UPDATE inventory_items
    SET availability = 'borrowed'
    WHERE item_id = (
        SELECT item_id
        FROM borrow_requests
        WHERE request_id = NEW.request_id
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `item_returned` AFTER UPDATE ON `loan_transactions` FOR EACH ROW BEGIN
    IF OLD.returned_at IS NULL
       AND NEW.returned_at IS NOT NULL THEN
        UPDATE inventory_items
        SET availability =
            CASE
                WHEN NEW.return_condition = 'damaged'
                THEN 'maintenance'
                ELSE 'available'
            END
        WHERE item_id = (
            SELECT item_id
            FROM borrow_requests
            WHERE request_id = NEW.request_id
        );
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `loan_issue_history` AFTER INSERT ON `loan_transactions` FOR EACH ROW BEGIN
    INSERT INTO activity_logs
    (
        request_id,
        old_status,
        new_status,
        changed_by
    )
    VALUES
    (
        NEW.request_id,
        'approved',
        'issued',
        NEW.issued_by
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `loan_return_history` AFTER UPDATE ON `loan_transactions` FOR EACH ROW BEGIN
    IF OLD.returned_at IS NULL
       AND NEW.returned_at IS NOT NULL THEN
        INSERT INTO activity_logs
        (
            request_id,
            old_status,
            new_status,
            changed_by
        )
       VALUES
        (
            NEW.request_id,
            'issued',
            'returned',
            NEW.received_by
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','staff','admin') NOT NULL DEFAULT 'student',
  `is_logged_in` tinyint(1) NOT NULL DEFAULT 0,
  `reg_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `user_name`, `email`, `password`, `role`, `is_logged_in`, `reg_time`, `update_time`) VALUES
(16, 'Admin', 'admin@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$elLNUDgugj2uH6NFguSaMQ$3DNLbW+NINzkO3XhmQNw0Q3ueGUMSt58xAWnjVjO5uA', 'admin', 0, '2026-11-07 10:08:37', '2026-11-22 11:32:56'),
(31, 'Staff', 'staff@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$cTxH6UBxnUp2sVPkeB7Wzg$QhLsh8WF2h96NQRnm1Qp7DNDqBAyfXy5Fl1BFVC7VcI', 'staff', 0, '2026-11-09 15:22:28', '2026-11-22 11:29:16'),
(40, 'Asad', 'asad@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$iOCCOL4PVgJy9DRHkOhm4g$FyDGLoF8IKmIdQTc+afj6gnb/FtwWR+8TYvmHlR6grI', 'student', 0, '2026-11-10 11:52:52', '2026-11-22 11:33:32'),
(41, 'Ali', 'ali@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$DFprKnMB/ISU3AQ6EpsWgQ$BIuMn0WWtD7kKxFwAKtKygUR3WxJksE4sbsWxtPzfuM', 'student', 0, '2026-11-15 12:03:07', '2026-11-22 11:33:49'),
(45, 'Hasan', 'hasan@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$gJ/IqnzjjHMHlGAFHw6pQQ$/m/aEFjjn1GGf10SCSWGdl2j3R6IDNc4RC/dHfMbKi8', 'student', 0, '2026-11-21 19:37:21', '2026-11-21 19:37:21'),
(46, 'abc', 'abc@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$XuiDZpo6K8cDCO9Acbhsag$HZAw0XV1zuGsUEwZ2CCrqWItdizfJGhWcyLn+Qwkekw', 'student', 0, '2026-11-22 11:31:35', '2026-11-22 11:31:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_activity_request` (`request_id`);

--
-- Indexes for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_borrower` (`borrower_id`),
  ADD KEY `idx_request_status` (`status`);

--
-- Indexes for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `category` (`category`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_item_availability` (`availability`);

--
-- Indexes for table `item_categories`
--
ALTER TABLE `item_categories`
  ADD PRIMARY KEY (`c_id`),
  ADD UNIQUE KEY `name` (`c_name`);

--
-- Indexes for table `loan_transactions`
--
ALTER TABLE `loan_transactions`
  ADD PRIMARY KEY (`loan_id`),
  ADD UNIQUE KEY `request_id` (`request_id`),
  ADD KEY `issued_by` (`issued_by`),
  ADD KEY `received_by` (`received_by`),
  ADD KEY `idx_loan_due_date` (`due_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `item_categories`
--
ALTER TABLE `item_categories`
  MODIFY `c_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `loan_transactions`
--
ALTER TABLE `loan_transactions`
  MODIFY `loan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `borrow_requests` (`request_id`),
  ADD CONSTRAINT `activity_logs_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD CONSTRAINT `borrow_requests_ibfk_1` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `borrow_requests_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`item_id`),
  ADD CONSTRAINT `borrow_requests_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD CONSTRAINT `inventory_items_ibfk_1` FOREIGN KEY (`category`) REFERENCES `item_categories` (`c_id`),
  ADD CONSTRAINT `inventory_items_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `loan_transactions`
--
ALTER TABLE `loan_transactions`
  ADD CONSTRAINT `loan_transactions_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `borrow_requests` (`request_id`),
  ADD CONSTRAINT `loan_transactions_ibfk_2` FOREIGN KEY (`issued_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `loan_transactions_ibfk_3` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
