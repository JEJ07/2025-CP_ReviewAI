-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 15, 2025 at 06:36 AM
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
-- Database: `reviewai`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add user', 4, 'add_user'),
(14, 'Can change user', 4, 'change_user'),
(15, 'Can delete user', 4, 'delete_user'),
(16, 'Can view user', 4, 'view_user'),
(17, 'Can add content type', 5, 'add_contenttype'),
(18, 'Can change content type', 5, 'change_contenttype'),
(19, 'Can delete content type', 5, 'delete_contenttype'),
(20, 'Can view content type', 5, 'view_contenttype'),
(21, 'Can add session', 6, 'add_session'),
(22, 'Can change session', 6, 'change_session'),
(23, 'Can delete session', 6, 'delete_session'),
(24, 'Can view session', 6, 'view_session'),
(25, 'Can add review', 7, 'add_review'),
(26, 'Can change review', 7, 'change_review'),
(27, 'Can delete review', 7, 'delete_review'),
(28, 'Can view review', 7, 'view_review'),
(29, 'Can add review analysis', 8, 'add_reviewanalysis'),
(30, 'Can change review analysis', 8, 'change_reviewanalysis'),
(31, 'Can delete review analysis', 8, 'delete_reviewanalysis'),
(32, 'Can view review analysis', 8, 'view_reviewanalysis');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$600000$NGQqDxgG4td1o32EABvLY6$ZA9FqMWUu9QYDKdhMRXG7OA3VPd6JceZhJfQJemLJVA=', '2025-09-11 15:40:31.275439', 1, 'admin', '', '', 'admin@gmail.com', 1, 1, '2025-08-29 13:55:43.969389'),
(2, 'pbkdf2_sha256$600000$UpzU3BGmdrhP1WAVUfpjxL$3j4KmegwitpeCTLqwM5L89cX5z5uxqGPcxxt7YuiJ2A=', '2025-08-30 04:37:24.795585', 0, 'user', '', '', '', 0, 1, '2025-08-29 16:20:44.201581');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_groups`
--

CREATE TABLE `auth_user_groups` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_user_permissions`
--

CREATE TABLE `auth_user_user_permissions` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(4, 'auth', 'user'),
(5, 'contenttypes', 'contenttype'),
(7, 'reviewai', 'review'),
(8, 'reviewai', 'reviewanalysis'),
(6, 'sessions', 'session');

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-08-29 13:29:23.040221'),
(2, 'auth', '0001_initial', '2025-08-29 13:29:29.673623'),
(3, 'admin', '0001_initial', '2025-08-29 13:29:30.031451'),
(4, 'admin', '0002_logentry_remove_auto_add', '2025-08-29 13:29:30.042255'),
(5, 'admin', '0003_logentry_add_action_flag_choices', '2025-08-29 13:29:30.059499'),
(6, 'contenttypes', '0002_remove_content_type_name', '2025-08-29 13:29:30.185497'),
(7, 'auth', '0002_alter_permission_name_max_length', '2025-08-29 13:29:30.345585'),
(8, 'auth', '0003_alter_user_email_max_length', '2025-08-29 13:29:30.380310'),
(9, 'auth', '0004_alter_user_username_opts', '2025-08-29 13:29:30.405242'),
(10, 'auth', '0005_alter_user_last_login_null', '2025-08-29 13:29:30.506384'),
(11, 'auth', '0006_require_contenttypes_0002', '2025-08-29 13:29:30.515125'),
(12, 'auth', '0007_alter_validators_add_error_messages', '2025-08-29 13:29:30.530555'),
(13, 'auth', '0008_alter_user_username_max_length', '2025-08-29 13:29:30.557413'),
(14, 'auth', '0009_alter_user_last_name_max_length', '2025-08-29 13:29:30.584282'),
(15, 'auth', '0010_alter_group_name_max_length', '2025-08-29 13:29:30.612436'),
(16, 'auth', '0011_update_proxy_permissions', '2025-08-29 13:29:30.629408'),
(17, 'auth', '0012_alter_user_first_name_max_length', '2025-08-29 13:29:30.656699'),
(18, 'sessions', '0001_initial', '2025-08-29 13:29:30.729036'),
(21, 'reviewai', '0001_initial', '2025-08-29 17:59:18.444134'),
(22, 'reviewai', '0002_alter_review_user', '2025-08-30 03:33:34.706388'),
(23, 'reviewai', '0003_review_platform', '2025-08-30 05:40:25.017720'),
(24, 'reviewai', '0004_review_link', '2025-09-15 04:25:51.601691');

-- --------------------------------------------------------

--
-- Table structure for table `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('gxkcl7mwfr3ghx6yp7ni2xj3uad8qwzu', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1uwjPT:2IwYJyF0_7g2CZ_QLDNwJn4oGj0tyoFNh0t_MyMOkXc', '2025-09-25 15:40:31.277998'),
('kvi33a6kbpeaeh50aahyv7v8mdfzyn40', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1uu2gm:_Obk6ODxMsZYaooV4zYe4EWY9YHJs7AfXa-wNk79jyg', '2025-09-18 05:39:16.112315'),
('omby76epubimcoytqitxsgistw78d6k0', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1us4j9:h4-VBu5-k9qKu3qbHr_N83Z9QRq0aFwg2oLofLCf12E', '2025-09-12 19:25:35.563239'),
('vufbwp25d237tynpxp9f8cawl1lbazcz', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1usDYF:20kRq0JLiIoxn1rjEcuSDE5lJrXCHU3sOq5EXpInv1w', '2025-09-13 04:50:55.252764');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `id` bigint(20) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `review_text` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `platform` varchar(32) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`id`, `product_name`, `review_text`, `created_at`, `user_id`, `platform`, `link`) VALUES
(1, 'Unknown Product', 'test review', '2025-08-29 18:08:20.834893', 2, 'web', NULL),
(2, 'Unknown Product', 'tasdas', '2025-08-29 19:25:21.767560', 2, 'web', NULL),
(3, 'Unknown Product', 'Let our AI tell you what\'s real and what\'s not.', '2025-08-30 02:37:59.374104', 2, 'web', NULL),
(4, 'Unknown Product', 'guest test', '2025-08-30 03:34:09.441113', NULL, 'web', NULL),
(5, 'Unknown Product', 'testing product review', '2025-08-30 03:36:56.870121', 2, 'web', NULL),
(6, 'Unknown Product', 'another one!', '2025-08-30 04:00:47.860540', 2, 'web', NULL),
(7, 'iPhone 15 Pro', 'This product is amazing! Best purchase ever!', '2025-08-30 05:52:20.218943', NULL, 'amazon', NULL),
(8, 'Samsung Galaxy #1', 'Great product, highly recommend!', '2025-08-30 05:52:20.335879', NULL, 'ebay', NULL),
(9, 'Samsung Galaxy #2', 'Terrible quality, waste of money!', '2025-08-30 05:52:20.452361', NULL, 'ebay', NULL),
(10, 'Astron 0.6HP Inverter Class Window Type Aircon - Manual | TCL60MA | Energy Saving| Built-in Filter | Anti-Rust Body | Ideal for Small Rooms #1', 'Functionality:Good\n Quality:Fair\n Material:Fair\n Great value for money, Durable anti-rust body,1', '2025-08-30 06:15:41.242991', NULL, 'lazada', NULL),
(11, 'Astron 0.6HP Inverter Class Window Type Aircon - Manual | TCL60MA | Energy Saving| Built-in Filter | Anti-Rust Body | Ideal for Small Rooms #2', 'Easy to install and use, Quiet operation for a peaceful environment, Convenient built-in air filter, fast delivery.\nWorking Fine, mabilis lumamig .. .waiting for my 2nd  order. \nThank You ‼️‼️‼️2', '2025-08-30 06:15:41.505665', NULL, 'lazada', NULL),
(12, 'Astron 0.6HP Inverter Class Window Type Aircon - Manual | TCL60MA | Energy Saving| Built-in Filter | Anti-Rust Body | Ideal for Small Rooms #3', 'Mabilis lumamig at maganda quality ♥️♥️♥️ Thank you Efficient cooling performance, Quiet operation for a peaceful environment,3', '2025-08-30 06:15:41.642609', NULL, 'lazada', NULL),
(13, 'Astron 0.6HP Inverter Class Window Type Aircon - Manual | TCL60MA | Energy Saving| Built-in Filter | Anti-Rust Body | Ideal for Small Rooms #4', 'Convenient built-in air filter, Efficient cooling performance, Reliable brand with a 5-year warranty, Compact size, perfect for small rooms, easy install and use.\nFast Delivery ‼️????\n#2nd Order4', '2025-08-30 06:15:41.782024', NULL, 'lazada', NULL),
(14, 'Astron 0.6HP Inverter Class Window Type Aircon - Manual | TCL60MA | Energy Saving| Built-in Filter | Anti-Rust Body | Ideal for Small Rooms #5', 'Functionality:5\n Quality:5\n Material:5\n Ayos! Mabilis ang delivery, then umandar agad using my genset, no issues. malamig kaagad. Thanks Astron!5', '2025-08-30 06:15:41.927644', NULL, 'lazada', NULL),
(15, 'Unknown Product', 'super nice product.. legit seller and very accomodating..', '2025-08-30 06:38:22.071152', NULL, 'extension', NULL),
(16, 'Tory Burch (TB) T Monogram Jacquard Shoulder Bag (retail bag)', 'very accomodating and efficient!! thank you sm!!', '2025-08-30 06:38:59.873578', NULL, 'carousell', NULL),
(17, 'Vintage 2007 Adidas Microbounce + Men\'s size 11 shoes white silver #1', 'Once the seller shipped it arrived super fast. Was extremely well packed and was EXACTLY as described. \n\nMy only concern is that there was a delay after I purchased the item and it was shipped. After talking with the buyer I get the impression they’ve been burned before and just want to make sure everyone is happy with the deal.', '2025-08-30 06:42:15.632775', NULL, 'ebay', NULL),
(18, 'Vintage 2007 Adidas Microbounce + Men\'s size 11 shoes white silver #2', 'Seller is 5 out of 5 stars. Product arrived on time in the exact way as described. It was packaged very safely. The seller even reached out to make sure I read the description to make sure I wasn\'t disappointed.', '2025-08-30 06:42:15.818661', NULL, 'ebay', NULL),
(19, 'Vintage 2007 Adidas Microbounce + Men\'s size 11 shoes white silver #3', 'time to get it shipped took a hot minute but i sent the seller a message and they got back to me fast and did exactly what they said they would. came as described in good shape', '2025-08-30 06:42:15.969677', NULL, 'ebay', NULL),
(20, 'Vintage 2007 Adidas Microbounce + Men\'s size 11 shoes white silver #4', 'Fast Shipping, Carefully packaged, Item as described, Great Value. Trusted Seller A++++', '2025-08-30 06:42:16.096599', NULL, 'ebay', NULL),
(21, 'Vintage 2007 Adidas Microbounce + Men\'s size 11 shoes white silver #5', 'Shipped fast and was packed well. Item was in great shape as advertised. Price was fair. Will do business again.', '2025-08-30 06:42:16.202534', NULL, 'ebay', NULL),
(22, 'Vintage 2007 Adidas Microbounce + Men\'s size 11 shoes white silver #6', 'The seller was extremely respectful and the item came in earlier than expected and as described condition 10/10 services  :)', '2025-08-30 06:42:16.342449', NULL, 'ebay', NULL),
(23, 'Vintage 2007 Adidas Microbounce + Men\'s size 11 shoes white silver #7', 'Item is as described, very well packaged and quick shipping. Thank you.', '2025-08-30 06:42:16.453379', NULL, 'ebay', NULL),
(24, 'Vintage 2007 Adidas Microbounce + Men\'s size 11 shoes white silver #8', 'Awesome seller as described good contact!', '2025-08-30 06:42:16.684878', NULL, 'ebay', NULL),
(25, 'New Balance530 Lifestyle Shoes6795.004417.00 #1', 'True to size, love how they fit. Thanks Zalora for the offer price, worth every $11', '2025-08-30 06:51:54.056379', NULL, 'zalora', NULL),
(26, 'New Balance530 Lifestyle Shoes6795.004417.00 #2', 'Bought during sale, worth the price. Highly recommended. Will buy again if have sales.22', '2025-08-30 06:51:54.172283', NULL, 'zalora', NULL),
(27, 'New Balance530 Lifestyle Shoes6795.004417.00 #3', 'Good pair. Nice and fitting. Good price too, recommended.33', '2025-08-30 06:51:54.266030', NULL, 'zalora', NULL),
(28, 'New Balance530 Lifestyle Shoes6795.004417.00 #4', 'good quality + super fast transaction - delivered immediately - the next day I ordered ;)4', '2025-08-30 06:51:54.384709', NULL, 'zalora', NULL),
(41, 'UGREEN IPX5 Bluetooth 5.4 HiTune S3 Open Ear Clip Wireless Earbuds Bluetooth Sports Earphones Headphones in Mic with Earhooks & Ear Hook #1', '????Sound Quality:Responsive touch controls, Crystal clear sound quality! i did not expect that this open ear ear phone conductors are this good!  nabudol ako ni daniela roi lol plus factor rin yung colorway ang lakas maka premium feels! this is a best buy for this year i hope it would last! nakakarindi kasi minsan yung rrgular bluetooth earphones. ito hindi nalalag kahit magagalaw, perfect for running and workout without compromising hearing awareness. thank you ugreen ph!', '2025-09-02 23:28:00.564803', NULL, 'lazada', NULL),
(42, 'UGREEN IPX5 Bluetooth 5.4 HiTune S3 Open Ear Clip Wireless Earbuds Bluetooth Sports Earphones Headphones in Mic with Earhooks & Ear Hook #2', '????Sound Quality:Durable and well-made, Sleek and stylish design,', '2025-09-02 23:28:00.623621', NULL, 'lazada', NULL),
(43, 'UGREEN IPX5 Bluetooth 5.4 HiTune S3 Open Ear Clip Wireless Earbuds Bluetooth Sports Earphones Headphones in Mic with Earhooks & Ear Hook #3', 'legit ito. nakaselead pa. ganda ng sound. mukhng matibay din.. very nice design.\n ????Sound Quality:very good\n ????Comfort:convenient sa ear\n ????Battery Life:sana nga matagal malobat..', '2025-09-02 23:28:00.676290', NULL, 'lazada', NULL),
(44, 'UGREEN IPX5 Bluetooth 5.4 HiTune S3 Open Ear Clip Wireless Earbuds Bluetooth Sports Earphones Headphones in Mic with Earhooks & Ear Hook #4', '????Sound Quality:good\n ????Comfort:good\n ????Battery Life:not sure yet\nGreat value for the price, \nCrystal clear sound quality,', '2025-09-02 23:28:00.721707', NULL, 'lazada', NULL),
(45, 'UGREEN IPX5 Bluetooth 5.4 HiTune S3 Open Ear Clip Wireless Earbuds Bluetooth Sports Earphones Headphones in Mic with Earhooks & Ear Hook #5', '????Sound Quality:very nice\nEasy to pair with my devices, Convenient answer/end call feature,', '2025-09-02 23:28:00.764656', NULL, 'lazada', NULL),
(52, 'Unknown Product', 'vdvewv', '2025-09-04 03:40:31.178364', NULL, 'web', NULL),
(53, 'Unknown Product', 'wowowowow', '2025-09-04 03:40:37.940322', NULL, 'web', NULL),
(54, 'Unknown Product', 'very easy application to the watch. no air bubbles and fit to the watch. the tempered glass has a thickness on it so i think this is not the ordinary screen protector you can buy on other stores. really love the applicator makes my life easy. will buy again soon', '2025-09-04 03:41:42.912525', NULL, 'web', NULL),
(55, 'Unknown Product', 'analyze fake reviews', '2025-09-04 05:34:35.845358', NULL, 'web', NULL),
(56, 'Pedigree Beef Canned Dog Food 1.15KG', 'nutritional value:provides essential nutrients, my dog loves this food!,', '2025-09-04 05:47:12.297026', NULL, 'lazada', NULL),
(57, 'Pedigree Beef Canned Dog Food 1.15KG', 'flavor variety:10/10perfect for all dog breeds, highly recommended for dog owners,', '2025-09-04 05:47:12.461272', NULL, 'lazada', NULL),
(58, 'Pedigree Beef Canned Dog Food 1.15KG', 'highly recommended for dog owners, high quality beef flavor, healthy coat guaranteed!, my adult dog enjoys it,', '2025-09-04 05:47:12.627846', NULL, 'lazada', NULL),
(59, 'Pedigree Beef Canned Dog Food 1.15KG', 'ordered so many times and im satisfied thanks seller,my dogs favorite food well packed', '2025-09-04 05:47:12.799096', NULL, 'lazada', NULL),
(60, 'Pedigree Beef Canned Dog Food 1.15KG', 'perfect for all dog breeds, high quality beef flavor, my dog s coat looks amazing, my dog loves this food!,', '2025-09-04 05:47:12.965464', NULL, 'lazada', NULL),
(61, 'Pedigree Beef Canned Dog Food 1.15KG', 'tipid talaga pag may sale at maramihan ang bili. so far, gustong gusto naman nilang kainin, yun lang naaamoy ko minsan yung tatak pag dumumi rin sila haha dalawa na lang ang naiwan sa pitong binili namin kasi matatakaw sila, pero tumagal naman, ¼ lata para sa isang kainan nilang lahat na may kasamang kanin', '2025-09-04 05:47:13.200030', NULL, 'lazada', NULL),
(62, 'Rivers Snow Foam Shampoo for cars or motorcycles - 1 gal.', 'product received in good condition. ngayon lang nakapagreview kasi ngayon ko lang nagamit. 4 stars lang kasi yung snowy foam na ineexpect ko ay hindi nangyare even though nafollow ko naman yung 70:30 ratio. after kasi gamitan ng sprayer babagsak na kaagad yung sabon hindi na pedeng ibrush or gamitan ng foam kahit touchless. pero yung pagiging foamy is not as expected. pero ok naman na kasi mabango din siya. maraming salamat po.', '2025-09-12 05:42:36.825776', NULL, 'lazada', NULL),
(63, 'Rivers Snow Foam Shampoo for cars or motorcycles - 1 gal.', 'provides a glossy shine, long lasting and economical, provides a glossy shine, long lasting and economical,', '2025-09-12 05:42:37.212666', NULL, 'lazada', NULL),
(64, 'Rivers Snow Foam Shampoo for cars or motorcycles - 1 gal.', 'effortlessly removes dirt and grime, safe for all car surfaces, creates a thick foam easily,', '2025-09-12 05:42:37.606338', NULL, 'lazada', NULL),
(65, 'Rivers Snow Foam Shampoo for cars or motorcycles - 1 gal.', 'effortlessly removes dirt and grime, provides a glossy shine, perfect for foam washing machines, leaves a scratch free finish, safe for all car surfaces, easy to use with a foam lance,', '2025-09-12 05:42:38.043597', NULL, 'lazada', NULL),
(66, 'Rivers Snow Foam Shampoo for cars or motorcycles - 1 gal.', 'creates a thick foam easily, leaves a scratch free finish, cleans without stripping wax, safe for all car surfaces,', '2025-09-12 05:42:38.453789', NULL, 'lazada', NULL),
(67, 'Unknown Product', 'akwdowajfowajfwajfwa', '2025-09-12 05:45:46.582925', 1, 'web', NULL),
(68, 'Original Type C Charger Set 120W Super Fast For Android HW XM TypeC Fast Charging Cable Adapter Set', 'it was packed good to protect the item and it works also as fast charging, recently purchased this charger, and it has exceeded all my expectations! the quality of the materials and the attention to detail are outstanding. it s clear that a lot of thought went into the design and functionality of this product. what impressed me the most was the fast charging or benefit, e.g., how easy it is to use, its durability, the sleek design, or the value for money . it has made charging so much easier, and i couldn t be happier with the results.1', '2025-09-14 10:10:50.546679', NULL, 'shopee', NULL),
(69, 'Original Type C Charger Set 120W Super Fast For Android HW XM TypeC Fast Charging Cable Adapter Set', 'the charger has been received and the charging speed is very fast. it will be fully charged in no time. it is the preferred choice for huawei smartphones. other brands of mobile phones also charge quickly. the data cable is also very long. good quality2', '2025-09-14 10:10:51.007170', NULL, 'shopee', NULL),
(70, 'Original Type C Charger Set 120W Super Fast For Android HW XM TypeC Fast Charging Cable Adapter Set', 'delivered fast, charges quickly, does not heat, and works well. highly recommended, worth the price.3', '2025-09-14 10:10:51.435613', NULL, 'shopee', NULL),
(71, 'Original Type C Charger Set 120W Super Fast For Android HW XM TypeC Fast Charging Cable Adapter Set', 'the purchased item has been received. i purchased a 120w package for flash charging. after receiving it, i immediately tried it to see if the charging speed is fast? i am very satisfied with the result. i hereby recommend it to everyone.4', '2025-09-14 10:10:51.932773', NULL, 'shopee', NULL),
(72, 'Original Type C Charger Set 120W Super Fast For Android HW XM TypeC Fast Charging Cable Adapter Set', 'delivery well.. no damage at all.. mabilis idelivery.. sulit na sulit ang bayad.. fast charger.. perfect na perfect talga5', '2025-09-14 10:10:52.406020', NULL, 'shopee', NULL),
(73, 'Original Type C Charger Set 120W Super Fast For Android HW XM TypeC Fast Charging Cable Adapter Set', 'legit item. nice quality. perfect for iphone 16 type c charger. well packed and no damage fast delivery6', '2025-09-14 10:10:52.840241', NULL, 'shopee', NULL),
(74, 'TP-Link Tapo C200C CCTV Camera 1080P Security Wireless indoor CCTV Camera Pan/Tilt Home Security Wi-Fi Camera with Privacy Mode', 'kahapon lang inorder, dumating agad ngayon. palitan ko na yung lightbulb na may v380 app need pa magsubscribe with monthly fee para lang magamit yung playback speed feature.', '2025-09-15 04:28:02.633961', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i4566758536-s26244582495.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aip%252Bsecurity%252Bcameras%253Bnid%253A4566758536%253Bsrc%253ALazadaMainSrp%253Brn%253A042cf268ccb3536381cef77c89cbf0f8%253Bregion%253Aph%253Bsku%253A4566758536_PH%253Bprice%253A799%253Bclient%253Adesktop%253Bsupplier_id%253A500163768049%253Bbiz_source%253Ahp_categories%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A24957%253Bitem_id%253A4566758536%253Bsku_i'),
(75, 'TP-Link Tapo C200C CCTV Camera 1080P Security Wireless indoor CCTV Camera Pan/Tilt Home Security Wi-Fi Camera with Privacy Mode', 'mganda yung quality,malinaw at malakas ang audio wala nga lang yung wall mounting base nya.', '2025-09-15 04:28:02.777071', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i4566758536-s26244582495.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aip%252Bsecurity%252Bcameras%253Bnid%253A4566758536%253Bsrc%253ALazadaMainSrp%253Brn%253A042cf268ccb3536381cef77c89cbf0f8%253Bregion%253Aph%253Bsku%253A4566758536_PH%253Bprice%253A799%253Bclient%253Adesktop%253Bsupplier_id%253A500163768049%253Bbiz_source%253Ahp_categories%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A24957%253Bitem_id%253A4566758536%253Bsku_i'),
(76, 'TP-Link Tapo C200C CCTV Camera 1080P Security Wireless indoor CCTV Camera Pan/Tilt Home Security Wi-Fi Camera with Privacy Mode', 'great value for money., versatile storage options., easy to set up.,', '2025-09-15 04:28:02.909632', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i4566758536-s26244582495.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aip%252Bsecurity%252Bcameras%253Bnid%253A4566758536%253Bsrc%253ALazadaMainSrp%253Brn%253A042cf268ccb3536381cef77c89cbf0f8%253Bregion%253Aph%253Bsku%253A4566758536_PH%253Bprice%253A799%253Bclient%253Adesktop%253Bsupplier_id%253A500163768049%253Bbiz_source%253Ahp_categories%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A24957%253Bitem_id%253A4566758536%253Bsku_i'),
(77, 'TP-Link Tapo C200C CCTV Camera 1080P Security Wireless indoor CCTV Camera Pan/Tilt Home Security Wi-Fi Camera with Privacy Mode', 'resolution:1080 perfect', '2025-09-15 04:28:03.024591', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i4566758536-s26244582495.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aip%252Bsecurity%252Bcameras%253Bnid%253A4566758536%253Bsrc%253ALazadaMainSrp%253Brn%253A042cf268ccb3536381cef77c89cbf0f8%253Bregion%253Aph%253Bsku%253A4566758536_PH%253Bprice%253A799%253Bclient%253Adesktop%253Bsupplier_id%253A500163768049%253Bbiz_source%253Ahp_categories%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A24957%253Bitem_id%253A4566758536%253Bsku_i'),
(78, 'TP-Link Tapo C200C CCTV Camera 1080P Security Wireless indoor CCTV Camera Pan/Tilt Home Security Wi-Fi Camera with Privacy Mode', 'resolution:convenient pan and tilt feature., excellent video quality.,', '2025-09-15 04:28:03.157493', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i4566758536-s26244582495.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aip%252Bsecurity%252Bcameras%253Bnid%253A4566758536%253Bsrc%253ALazadaMainSrp%253Brn%253A042cf268ccb3536381cef77c89cbf0f8%253Bregion%253Aph%253Bsku%253A4566758536_PH%253Bprice%253A799%253Bclient%253Adesktop%253Bsupplier_id%253A500163768049%253Bbiz_source%253Ahp_categories%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A24957%253Bitem_id%253A4566758536%253Bsku_i'),
(79, 'TP-Link Tapo C200C CCTV Camera 1080P Security Wireless indoor CCTV Camera Pan/Tilt Home Security Wi-Fi Camera with Privacy Mode', 'remote access:easy access great app', '2025-09-15 04:28:03.264058', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i4566758536-s26244582495.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aip%252Bsecurity%252Bcameras%253Bnid%253A4566758536%253Bsrc%253ALazadaMainSrp%253Brn%253A042cf268ccb3536381cef77c89cbf0f8%253Bregion%253Aph%253Bsku%253A4566758536_PH%253Bprice%253A799%253Bclient%253Adesktop%253Bsupplier_id%253A500163768049%253Bbiz_source%253Ahp_categories%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A24957%253Bitem_id%253A4566758536%253Bsku_i'),
(80, 'TP-Link Tapo C200C CCTV Camera 1080P Security Wireless indoor CCTV Camera Pan/Tilt Home Security Wi-Fi Camera with Privacy Mode', 'ok naman sya. maayos ang packaging,walang damage at kumpletoyung orders ko. gumagana din ng maayos yung mga cctv. thank you seller', '2025-09-15 04:28:03.413035', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i4566758536-s26244582495.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aip%252Bsecurity%252Bcameras%253Bnid%253A4566758536%253Bsrc%253ALazadaMainSrp%253Brn%253A042cf268ccb3536381cef77c89cbf0f8%253Bregion%253Aph%253Bsku%253A4566758536_PH%253Bprice%253A799%253Bclient%253Adesktop%253Bsupplier_id%253A500163768049%253Bbiz_source%253Ahp_categories%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A24957%253Bitem_id%253A4566758536%253Bsku_i');

-- --------------------------------------------------------

--
-- Table structure for table `review_analysis`
--

CREATE TABLE `review_analysis` (
  `id` bigint(20) NOT NULL,
  `result` varchar(20) NOT NULL,
  `confidence_score` double NOT NULL,
  `model` varchar(100) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `review_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review_analysis`
--

INSERT INTO `review_analysis` (`id`, `result`, `confidence_score`, `model`, `created_at`, `review_id`) VALUES
(1, 'likely_fake', 0.8046051912521948, 'ensemble_svm_rf_distilbert', '2025-08-29 18:08:20.840889', 1),
(2, 'likely_fake', 0.8128574026860957, 'ensemble_svm_rf_distilbert', '2025-08-29 19:25:21.767560', 2),
(3, 'uncertain', 0.5523259533803994, 'ensemble_svm_rf_distilbert', '2025-08-30 02:37:59.384139', 3),
(4, 'possibly_fake', 0.7297398940239619, 'ensemble_svm_rf_distilbert', '2025-08-30 03:34:09.496701', 4),
(5, 'likely_fake', 0.8574817167038778, 'ensemble_svm_rf_distilbert', '2025-08-30 03:36:56.876179', 5),
(6, 'likely_genuine', 0.7768970708285683, 'ensemble_svm_rf_distilbert', '2025-08-30 04:00:47.865571', 6),
(7, 'genuine', 0.9030368141728423, 'ensemble_svm_rf_distilbert', '2025-08-30 05:52:20.235962', 7),
(8, 'uncertain', 0.5767764948663967, 'ensemble_svm_rf_distilbert', '2025-08-30 05:52:20.351859', 8),
(9, 'likely_genuine', 0.8843648773104775, 'ensemble_svm_rf_distilbert', '2025-08-30 05:52:20.452361', 9),
(10, 'genuine', 0.9089102942867655, 'ensemble_svm_rf_distilbert', '2025-08-30 06:15:41.251019', 10),
(11, 'genuine', 0.9844761765242049, 'ensemble_svm_rf_distilbert', '2025-08-30 06:15:41.525810', 11),
(12, 'genuine', 0.962602726215327, 'ensemble_svm_rf_distilbert', '2025-08-30 06:15:41.649643', 12),
(13, 'genuine', 0.9506648234202929, 'ensemble_svm_rf_distilbert', '2025-08-30 06:15:41.795073', 13),
(14, 'genuine', 0.9708405084003713, 'ensemble_svm_rf_distilbert', '2025-08-30 06:15:41.936718', 14),
(15, 'genuine', 0.9500777823855658, 'ensemble_svm_rf_distilbert', '2025-08-30 06:38:22.137149', 15),
(16, 'genuine', 0.9320495404685899, 'ensemble_svm_rf_distilbert', '2025-08-30 06:38:59.873578', 16),
(17, 'likely_genuine', 0.8900229414774394, 'ensemble_svm_rf_distilbert', '2025-08-30 06:42:15.671751', 17),
(18, 'genuine', 0.9597004605085955, 'ensemble_svm_rf_distilbert', '2025-08-30 06:42:15.841646', 18),
(19, 'genuine', 0.9695464046907932, 'ensemble_svm_rf_distilbert', '2025-08-30 06:42:15.975672', 19),
(20, 'likely_genuine', 0.8799896567421839, 'ensemble_svm_rf_distilbert', '2025-08-30 06:42:16.101595', 20),
(21, 'genuine', 0.9111567768478918, 'ensemble_svm_rf_distilbert', '2025-08-30 06:42:16.244507', 21),
(22, 'likely_genuine', 0.8379238866646969, 'ensemble_svm_rf_distilbert', '2025-08-30 06:42:16.349444', 22),
(23, 'genuine', 0.9469444005532652, 'ensemble_svm_rf_distilbert', '2025-08-30 06:42:16.586297', 23),
(24, 'genuine', 0.9278461162562066, 'ensemble_svm_rf_distilbert', '2025-08-30 06:42:16.691873', 24),
(25, 'genuine', 0.9076472782607738, 'ensemble_svm_rf_distilbert', '2025-08-30 06:51:54.062910', 25),
(26, 'likely_genuine', 0.8926706357624554, 'ensemble_svm_rf_distilbert', '2025-08-30 06:51:54.172283', 26),
(27, 'genuine', 0.930992177697049, 'ensemble_svm_rf_distilbert', '2025-08-30 06:51:54.266030', 27),
(41, 'genuine', 0.9517985713209307, 'ensemble_svm_rf_distilbert', '2025-09-02 23:28:00.579728', 41),
(42, 'uncertain', 0.5357749479735767, 'ensemble_svm_rf_distilbert', '2025-09-02 23:28:00.625262', 42),
(43, 'possibly_genuine', 0.6804289852128229, 'ensemble_svm_rf_distilbert', '2025-09-02 23:28:00.678000', 43),
(44, 'possibly_genuine', 0.734666645038943, 'ensemble_svm_rf_distilbert', '2025-09-02 23:28:00.723095', 44),
(45, 'genuine', 0.9331550925241472, 'ensemble_svm_rf_distilbert', '2025-09-02 23:28:00.766231', 45),
(52, 'likely_fake', 0.813043220166183, 'ensemble_svm_rf_distilbert', '2025-09-04 03:40:31.195214', 52),
(53, 'likely_fake', 0.8126288784780269, 'ensemble_svm_rf_distilbert', '2025-09-04 03:40:37.948981', 53),
(54, 'genuine', 0.9453149795523408, 'ensemble_svm_rf_distilbert', '2025-09-04 03:41:42.936833', 54),
(55, 'likely_fake', 0.7726546657153013, 'ensemble_svm_rf_distilbert', '2025-09-04 05:34:35.853696', 55),
(56, 'likely_genuine', 0.7648419020874611, 'ensemble_svm_rf_distilbert', '2025-09-04 05:47:12.315475', 56),
(57, 'uncertain', 0.5864102355795081, 'ensemble_svm_rf_distilbert', '2025-09-04 05:47:12.480354', 57),
(58, 'genuine', 0.9728619817184703, 'ensemble_svm_rf_distilbert', '2025-09-04 05:47:12.645746', 58),
(59, 'genuine', 0.9765401421858315, 'ensemble_svm_rf_distilbert', '2025-09-04 05:47:12.804563', 59),
(60, 'likely_genuine', 0.8984769710353335, 'ensemble_svm_rf_distilbert', '2025-09-04 05:47:12.968510', 60),
(61, 'genuine', 0.9530479429234284, 'ensemble_svm_rf_distilbert', '2025-09-04 05:47:13.203788', 61),
(62, 'genuine', 0.9481137694364279, 'ensemble_svm_rf_distilbert', '2025-09-12 05:42:36.828641', 62),
(63, 'uncertain', 0.5082340186506487, 'ensemble_svm_rf_distilbert', '2025-09-12 05:42:37.218046', 63),
(64, 'genuine', 0.9212720785431696, 'ensemble_svm_rf_distilbert', '2025-09-12 05:42:37.609435', 64),
(65, 'genuine', 0.9320900043982704, 'ensemble_svm_rf_distilbert', '2025-09-12 05:42:38.061929', 65),
(66, 'genuine', 0.928585591543815, 'ensemble_svm_rf_distilbert', '2025-09-12 05:42:38.469432', 66),
(67, 'fake', 0.9891811324744767, 'ensemble_svm_rf_distilbert', '2025-09-12 05:45:46.585727', 67),
(68, 'likely_genuine', 0.8406748326478811, 'ensemble_svm_rf_distilbert', '2025-09-14 10:10:50.550404', 68),
(69, 'possibly_fake', 0.7043278168396792, 'ensemble_svm_rf_distilbert', '2025-09-14 10:10:51.025214', 69),
(70, 'uncertain', 0.5757166371122951, 'ensemble_svm_rf_distilbert', '2025-09-14 10:10:51.441171', 70),
(71, 'likely_genuine', 0.8405440787323286, 'ensemble_svm_rf_distilbert', '2025-09-14 10:10:51.951042', 71),
(72, 'uncertain', 0.5685801003976688, 'ensemble_svm_rf_distilbert', '2025-09-14 10:10:52.423435', 72),
(73, 'genuine', 0.945394109571761, 'ensemble_svm_rf_distilbert', '2025-09-14 10:10:52.858385', 73),
(74, 'likely_genuine', 0.7567229186666504, 'ensemble_svm_rf_distilbert', '2025-09-15 04:28:02.636124', 74),
(75, 'likely_genuine', 0.8709204166729607, 'ensemble_svm_rf_distilbert', '2025-09-15 04:28:02.778830', 75),
(76, 'likely_genuine', 0.8615130849919725, 'ensemble_svm_rf_distilbert', '2025-09-15 04:28:02.912266', 76),
(77, 'fake', 0.9926997132161826, 'ensemble_svm_rf_distilbert', '2025-09-15 04:28:03.026302', 77),
(78, 'uncertain', 0.5178535134048374, 'ensemble_svm_rf_distilbert', '2025-09-15 04:28:03.159358', 78),
(79, 'fake', 0.94182592838238, 'ensemble_svm_rf_distilbert', '2025-09-15 04:28:03.265456', 79),
(80, 'genuine', 0.9248298842460416, 'ensemble_svm_rf_distilbert', '2025-09-15 04:28:03.418957', 80);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indexes for table `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  ADD KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`);

--
-- Indexes for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  ADD KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id`),
  ADD KEY `review_user_id_1520d914_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `review_analysis`
--
ALTER TABLE `review_analysis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `review_analysis_review_id_5e9ccb40_fk_review_id` (`review_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `review_analysis`
--
ALTER TABLE `review_analysis`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Constraints for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Constraints for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `review_user_id_1520d914_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `review_analysis`
--
ALTER TABLE `review_analysis`
  ADD CONSTRAINT `review_analysis_review_id_5e9ccb40_fk_review_id` FOREIGN KEY (`review_id`) REFERENCES `review` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
