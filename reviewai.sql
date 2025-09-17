-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 17, 2025 at 08:09 PM
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
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint(20) NOT NULL,
  `action` varchar(32) NOT NULL,
  `description` longtext NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `ip_address` char(39) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `action`, `description`, `timestamp`, `ip_address`, `user_id`) VALUES
(1, 'analysis', 'Analyzed review for \"Unknown Product...\" via web app', '2025-09-17 17:40:59.498726', '127.0.0.1', 2),
(2, 'batch_analysis', 'Batch analyzed 0 reviews (0 saved) via lazada extension', '2025-09-17 17:41:55.873242', '127.0.0.1', 2),
(3, 'batch_analysis', 'Batch analyzed 1 reviews (1 saved) via lazada extension', '2025-09-17 17:41:56.236299', '127.0.0.1', 2),
(4, 'batch_analysis', 'Batch analyzed 2 reviews (2 saved) via lazada extension', '2025-09-17 17:41:56.556708', '127.0.0.1', 2),
(5, 'batch_analysis', 'Batch analyzed 3 reviews (3 saved) via lazada extension', '2025-09-17 17:41:56.761822', '127.0.0.1', 2),
(6, 'batch_analysis', 'Batch analyzed 4 reviews (4 saved) via lazada extension', '2025-09-17 17:41:56.982673', '127.0.0.1', 2),
(7, 'batch_analysis', 'Batch analyzed 5 reviews (5 saved) via lazada extension', '2025-09-17 17:41:57.331832', '127.0.0.1', 2),
(8, 'logout', 'User logged out via browser extension', '2025-09-17 17:42:29.645160', '127.0.0.1', 2),
(9, 'batch_analysis', 'Batch analyzed 0 reviews (0 saved) via lazada extension', '2025-09-17 17:42:33.238643', '127.0.0.1', NULL),
(10, 'batch_analysis', 'Batch analyzed 1 reviews (1 saved) via lazada extension', '2025-09-17 17:42:33.573032', '127.0.0.1', NULL),
(11, 'batch_analysis', 'Batch analyzed 2 reviews (2 saved) via lazada extension', '2025-09-17 17:42:33.947865', '127.0.0.1', NULL),
(12, 'batch_analysis', 'Batch analyzed 3 reviews (3 saved) via lazada extension', '2025-09-17 17:42:34.173373', '127.0.0.1', NULL),
(13, 'batch_analysis', 'Batch analyzed 4 reviews (4 saved) via lazada extension', '2025-09-17 17:42:34.366374', '127.0.0.1', NULL),
(14, 'batch_analysis', 'Batch analyzed 5 reviews (5 saved) via lazada extension', '2025-09-17 17:42:34.645395', '127.0.0.1', NULL),
(15, 'batch_analysis', 'Batch analyzed 0 reviews (0 saved) via lazada extension', '2025-09-17 17:51:49.152059', '127.0.0.1', NULL),
(16, 'batch_analysis', 'Batch analyzed 1 reviews (1 saved) via lazada extension', '2025-09-17 17:51:49.481924', '127.0.0.1', NULL),
(17, 'batch_analysis', 'Batch analyzed 2 reviews (2 saved) via lazada extension', '2025-09-17 17:51:49.723542', '127.0.0.1', NULL),
(18, 'batch_analysis', 'Batch analyzed 3 reviews (3 saved) via lazada extension', '2025-09-17 17:51:49.939645', '127.0.0.1', NULL),
(19, 'batch_analysis', 'Batch analyzed 4 reviews (4 saved) via lazada extension', '2025-09-17 17:51:50.162014', '127.0.0.1', NULL),
(20, 'login', 'User logged in via web app', '2025-09-17 17:56:17.882264', '127.0.0.1', 2),
(21, 'login', 'User logged in via web app', '2025-09-17 17:56:27.147304', '127.0.0.1', 1),
(22, 'login', 'User logged in via browser extension', '2025-09-17 17:57:29.011413', '127.0.0.1', 2),
(23, 'login', 'User logged in via web app', '2025-09-17 17:58:55.239844', '127.0.0.1', 1),
(24, 'login', 'User logged in via web app', '2025-09-17 18:06:59.247062', '127.0.0.1', 1),
(25, 'login', 'User logged in via web app', '2025-09-17 18:06:59.248989', '127.0.0.1', 1),
(26, 'login', 'User logged in via web app', '2025-09-17 18:06:59.314438', '127.0.0.1', 1),
(27, 'login', 'User logged in via web app', '2025-09-17 18:06:59.307441', '127.0.0.1', 1),
(28, 'logout', 'User logged out via web app', '2025-09-17 18:08:54.027011', '127.0.0.1', 2),
(29, 'login', 'User logged in via web app', '2025-09-17 18:09:00.780874', '127.0.0.1', 1),
(30, 'logout', 'User logged out via web app', '2025-09-17 18:09:04.604835', '127.0.0.1', 1),
(31, 'login', 'User logged in via web app', '2025-09-17 18:09:21.086325', '127.0.0.1', 2);

-- --------------------------------------------------------

--
-- Table structure for table `authtoken_token`
--

CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authtoken_token`
--

INSERT INTO `authtoken_token` (`key`, `created`, `user_id`) VALUES
('5d9ec67c1218d0145d0b2cd75764fb23dafa687d', '2025-09-17 17:57:29.002396', 2);

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
(32, 'Can view review analysis', 8, 'view_reviewanalysis'),
(33, 'Can add Token', 9, 'add_token'),
(34, 'Can change Token', 9, 'change_token'),
(35, 'Can delete Token', 9, 'delete_token'),
(36, 'Can view Token', 9, 'view_token'),
(37, 'Can add Token', 10, 'add_tokenproxy'),
(38, 'Can change Token', 10, 'change_tokenproxy'),
(39, 'Can delete Token', 10, 'delete_tokenproxy'),
(40, 'Can view Token', 10, 'view_tokenproxy'),
(41, 'Can add activity log', 11, 'add_activitylog'),
(42, 'Can change activity log', 11, 'change_activitylog'),
(43, 'Can delete activity log', 11, 'delete_activitylog'),
(44, 'Can view activity log', 11, 'view_activitylog');

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
(1, 'pbkdf2_sha256$600000$NGQqDxgG4td1o32EABvLY6$ZA9FqMWUu9QYDKdhMRXG7OA3VPd6JceZhJfQJemLJVA=', '2025-09-17 18:09:00.769880', 1, 'admin', '', '', 'admin@gmail.com', 1, 1, '2025-08-29 13:55:43.969389'),
(2, 'pbkdf2_sha256$600000$UpzU3BGmdrhP1WAVUfpjxL$3j4KmegwitpeCTLqwM5L89cX5z5uxqGPcxxt7YuiJ2A=', '2025-09-17 18:09:21.079328', 0, 'user', '', '', '', 0, 1, '2025-08-29 16:20:44.201581');

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
(9, 'authtoken', 'token'),
(10, 'authtoken', 'tokenproxy'),
(5, 'contenttypes', 'contenttype'),
(11, 'reviewai', 'activitylog'),
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
(24, 'reviewai', '0004_review_link', '2025-09-15 04:25:51.601691'),
(25, 'authtoken', '0001_initial', '2025-09-17 14:58:08.927011'),
(26, 'authtoken', '0002_auto_20160226_1747', '2025-09-17 14:58:08.963986'),
(27, 'authtoken', '0003_tokenproxy', '2025-09-17 14:58:08.972981'),
(28, 'authtoken', '0004_alter_tokenproxy_options', '2025-09-17 14:58:08.982978'),
(29, 'reviewai', '0005_activitylog', '2025-09-17 17:39:22.911923'),
(30, 'reviewai', '0006_rename_activitylog_table', '2025-09-17 17:49:23.967695');

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
('ewr6bzn2yf6wt8aft7ajxr928wkga8hu', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1uywYV:r5AAkxbFvsr2DZ8G71plisslu4_6cTuydfrc6REm5Co', '2025-10-01 18:06:59.325431'),
('gxkcl7mwfr3ghx6yp7ni2xj3uad8qwzu', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1uwjPT:2IwYJyF0_7g2CZ_QLDNwJn4oGj0tyoFNh0t_MyMOkXc', '2025-09-25 15:40:31.277998'),
('kvi33a6kbpeaeh50aahyv7v8mdfzyn40', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1uu2gm:_Obk6ODxMsZYaooV4zYe4EWY9YHJs7AfXa-wNk79jyg', '2025-09-18 05:39:16.112315'),
('m312d6b661z5dw8n5dagbqcz98ljw9lx', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1uywYV:r5AAkxbFvsr2DZ8G71plisslu4_6cTuydfrc6REm5Co', '2025-10-01 18:06:59.340301'),
('omby76epubimcoytqitxsgistw78d6k0', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1us4j9:h4-VBu5-k9qKu3qbHr_N83Z9QRq0aFwg2oLofLCf12E', '2025-09-12 19:25:35.563239'),
('p3uvsjef1te2vjh7nfgbnjwgr622d7lx', '.eJxVjMsOwiAQRf-FtSEwtDxcuvcbCAwzUjU0Ke3K-O_apAvd3nPOfYmYtrXGrdMSpyLOAsTpd8sJH9R2UO6p3WaJc1uXKctdkQft8joXel4O9--gpl6_tUIMTmcwozPOaCTNXhFzAXQ-G1OYEw4QStLZBg6OODAM4K3ydtQo3h_uuzgV:1uywan:S4labyeryN8-OcUrKoFSPvcXRvmfsnfMUCSjEkJ7rH0', '2025-10-01 18:09:21.092319'),
('vufbwp25d237tynpxp9f8cawl1lbazcz', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1usDYF:20kRq0JLiIoxn1rjEcuSDE5lJrXCHU3sOq5EXpInv1w', '2025-09-13 04:50:55.252764'),
('wt5uqut3kr2i04k950xmntkhi25cssr8', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1uywYV:r5AAkxbFvsr2DZ8G71plisslu4_6cTuydfrc6REm5Co', '2025-10-01 18:06:59.312439'),
('yii1q0j4l88uszk2i4n213quguejwx1s', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1uyWGL:CvF8Z5Ph-hRWPcjhsMJL6VJbqqcH2Hg5u4XX5LFbWmY', '2025-09-30 14:02:29.107820'),
('yt2739ef5xwb1kgbin7pq4mqrx26yt8f', '.eJxVjEEOwiAQRe_C2hAGChSX7j0DgZlBqoYmpV0Z765NutDtf-_9l4hpW2vcOi9xInEWIE6_W0744LYDuqd2myXObV2mLHdFHrTL60z8vBzu30FNvX5rAxmcSwAIoYwDOutAEYFPiB69Yza5aDDZkC6WycAQ2Ho2wWk1khLvD9jvN5Y:1uywYV:r5AAkxbFvsr2DZ8G71plisslu4_6cTuydfrc6REm5Co', '2025-10-01 18:06:59.352296');

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
(80, 'TP-Link Tapo C200C CCTV Camera 1080P Security Wireless indoor CCTV Camera Pan/Tilt Home Security Wi-Fi Camera with Privacy Mode', 'ok naman sya. maayos ang packaging,walang damage at kumpletoyung orders ko. gumagana din ng maayos yung mga cctv. thank you seller', '2025-09-15 04:28:03.413035', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i4566758536-s26244582495.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aip%252Bsecurity%252Bcameras%253Bnid%253A4566758536%253Bsrc%253ALazadaMainSrp%253Brn%253A042cf268ccb3536381cef77c89cbf0f8%253Bregion%253Aph%253Bsku%253A4566758536_PH%253Bprice%253A799%253Bclient%253Adesktop%253Bsupplier_id%253A500163768049%253Bbiz_source%253Ahp_categories%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A24957%253Bitem_id%253A4566758536%253Bsku_i'),
(81, 'High Speed Turbo Mini Fan 100% Speed Fast Charging Mini Fan', 'the sleek, modern design looks great and feels sturdy in hand. it s lightweight, easy to carry, and the digital display adds a high tech touch that makes it feel premium. the airflow is surprisingly strong for its size, and the controls are simple and responsive. perfect for staying cool on the go, whether i m indoors or outside. definitely a great buy!', '2025-09-17 15:09:58.645381', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i5121060409-s30232040773.html?pvid=b1022863-e621-45a4-9044-8f574756beb5&search=jfy&scm=1007.17519.386432.0&priceCompare=skuId%3A30232040773%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3Ab1022863-e621-45a4-9044-8f574756beb5%3BoriginPrice%3A10500%3BdisplayPrice%3A10500%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1758121605187&spm=a2o4l.homepage.just4u.d_5121060409'),
(82, 'High Speed Turbo Mini Fan 100% Speed Fast Charging Mini Fan', 'expectation vs reality! iba ang dumating sa order ko! ang pangit scammer wag kayo mag oorder dito sa shop na ito! cinonfirm ko pa bago ko e check out pero iba ang dumating sa ordwr makabenta lang! di na makakaulit!', '2025-09-17 15:09:59.113527', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i5121060409-s30232040773.html?pvid=b1022863-e621-45a4-9044-8f574756beb5&search=jfy&scm=1007.17519.386432.0&priceCompare=skuId%3A30232040773%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3Ab1022863-e621-45a4-9044-8f574756beb5%3BoriginPrice%3A10500%3BdisplayPrice%3A10500%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1758121605187&spm=a2o4l.homepage.just4u.d_5121060409'),
(83, 'High Speed Turbo Mini Fan 100% Speed Fast Charging Mini Fan', 'battery life:ok', '2025-09-17 15:09:59.317924', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i5121060409-s30232040773.html?pvid=b1022863-e621-45a4-9044-8f574756beb5&search=jfy&scm=1007.17519.386432.0&priceCompare=skuId%3A30232040773%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3Ab1022863-e621-45a4-9044-8f574756beb5%3BoriginPrice%3A10500%3BdisplayPrice%3A10500%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1758121605187&spm=a2o4l.homepage.just4u.d_5121060409'),
(84, 'High Speed Turbo Mini Fan 100% Speed Fast Charging Mini Fan', 'speed settings:ok', '2025-09-17 15:09:59.641064', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i5121060409-s30232040773.html?pvid=b1022863-e621-45a4-9044-8f574756beb5&search=jfy&scm=1007.17519.386432.0&priceCompare=skuId%3A30232040773%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3Ab1022863-e621-45a4-9044-8f574756beb5%3BoriginPrice%3A10500%3BdisplayPrice%3A10500%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1758121605187&spm=a2o4l.homepage.just4u.d_5121060409'),
(85, 'High Speed Turbo Mini Fan 100% Speed Fast Charging Mini Fan', 'hindi liget,dumating na order ko, layo sa picture,hndi ko inasahan na ito dadating sakin', '2025-09-17 15:09:59.965888', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i5121060409-s30232040773.html?pvid=b1022863-e621-45a4-9044-8f574756beb5&search=jfy&scm=1007.17519.386432.0&priceCompare=skuId%3A30232040773%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3Ab1022863-e621-45a4-9044-8f574756beb5%3BoriginPrice%3A10500%3BdisplayPrice%3A10500%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1758121605187&spm=a2o4l.homepage.just4u.d_5121060409'),
(86, 'High Speed Turbo Mini Fan 100% Speed Fast Charging Mini Fan', 'napaka sinungaling ng store iba ung nsa picture sa dumating mag papa dti talaga ako neto nag ssyang lang ako ng pera sa store na to!!! wag n wag kaung bibili sa store na to', '2025-09-17 15:10:00.258208', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i5121060409-s30232040773.html?pvid=b1022863-e621-45a4-9044-8f574756beb5&search=jfy&scm=1007.17519.386432.0&priceCompare=skuId%3A30232040773%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3Ab1022863-e621-45a4-9044-8f574756beb5%3BoriginPrice%3A10500%3BdisplayPrice%3A10500%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1758121605187&spm=a2o4l.homepage.just4u.d_5121060409'),
(87, 'High Speed Turbo Mini Fan 100% Speed Fast Charging Mini Fan', 'the metal body feels premium and survived accidental drops on rocky terrain, while the 4000mah battery lasted 2 full days on a single charge. plus, the usb c fast charging powered it up during my coffee break!', '2025-09-17 15:10:00.560476', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i5121060409-s30232040773.html?pvid=b1022863-e621-45a4-9044-8f574756beb5&search=jfy&scm=1007.17519.386432.0&priceCompare=skuId%3A30232040773%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3Ab1022863-e621-45a4-9044-8f574756beb5%3BoriginPrice%3A10500%3BdisplayPrice%3A10500%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1758121605187&spm=a2o4l.homepage.just4u.d_5121060409'),
(88, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'great headset, especially for the price! i grabbed it with a 30 credit and it s definitely worth it. the sound is crisp with solid bass, and the mic picks up my voice clearly without extra noise. super comfortable for long gaming sessions lightweight with soft ear cushions. also nice that it works across devices with the 3.5mm jack. couldn t be happier with this deal!', '2025-09-17 15:12:04.265097', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(89, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'price is amazing for the quality you are getting. good design and its cool to see that they added pink not only to the case but also terminals and cable.confortable design and audio is unmatched. good noise cancelling.', '2025-09-17 15:12:04.529264', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(90, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'awesome gaming headset for the price. immersive and crisp sounds with a mic that relays clear sound. lightweight design, no connectivity issues, functional and easy to use. love these headphones for marathon gaming sessions, soft cushion support is appreciated for maximum comfort.', '2025-09-17 15:12:04.808578', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(91, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'it s a pretty decent headset for the price point. really no complaints and sound quality is actually quite good. the only downside which is substantial enough for me to remove a star is the non removable cable length, it should be at least a few feet longer, i don t understand how they think having such a short cable is okay for even laptop users. the extension cord is actually a splitter, designed for desktops with separate jack ports. i constantly yank on the cable as a result of its length, but you get used to it eventually. the mute and volume controls in analog are a nice thing to have as well. they are quite comfortable for long use sessions, as well as sound isolation being quite good given the cushioning of the ear pads. i would recommend it.', '2025-09-17 15:12:05.144878', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(92, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'i m a new gamer i just got an xbox one at the beginning of the year. i started playing games with a few friends and got this headset so i wouldn t have to call them on a separate device/platform. it s definitely a great starting headset! they ve lasted great so far and i ve had them for about 5 months now. there s been no damage so far to the headset material, and the volume knob functions perfectly. they do cancel noise very well, i typically can t hear much when i am wearing them properly sometimes i have 1 side off .they are lightweight, they don t feel heavy on the top of my head even when wearing them for a while. if you are one of those people whose ears start to hurt from being pushed in for a long period, like me, these headphones may help with how long you can use them. i am able to use these headphones longer than others like it.i will say it is only for the devices that it lists in the title/description. i ve tried to use them with my computer a few times and the sound works great, as usual, but when i chat with friends or if i m on a video call using the headset, the microphone doesn t work as well. i m often told that it s more difficult to hear me, so i end up switching over to a pair of wired earbuds i have.', '2025-09-17 15:12:05.604072', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(93, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'i ve tried quite a few gaming headsets, and the razer blackshark v2 x quickly became one of my favorites. it s super lightweight, the ear cushions are soft and breathable, and i can wear it for hours without discomfort.the sound quality is excellent footsteps and voices come through sharp and clear, while bass hits just right for explosions and music. the microphone is also impressive my teammates say my voice sounds crisp with almost no background noise.it plugs right into pc and xbox controller with a simple 3.5mm jack, no setup needed. for the price, you re getting amazing performance and comfort. highly recommend this headset for anyone who wants reliable, no nonsense quality.', '2025-09-17 15:12:05.951435', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(94, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'punchy bass, great sound quality best headset i ve ever owned so far. i went to target and they had the turtle beach stealth 500 that caught my ear as a tester but it was over double the price. so i went for the razer i have a razer kraken that i ve had for 5 years the pleather came apart and its just the cloth now so i had to get a new headset. i trust razer besides the pleather of course. this new razer headset is definitely an upgrade from the kraken in all ways. there s foam on the inside and out on the top of the headset and no pleather that goes on the ear just around the cuff of the muffs so i know it ll last. it fit the head very well and is noise canceling however it makes the ears a little warm due to it. will be good for kids as it can adjusted to a kids length. they are very nice and are great quality idk how they priced it so low? it comes packaged nicely with a nice size cloth bag to store the headset in and a cotton on the mic. i can t tell the sound difference between this and the turtle beach stealth 500 the stealth may provide some better airflow and have slightly better treble overall, it s a bassy type of headset sounds good but not crispy clear has a gaming headset type of low muffled treble sound that is hard to tell but for the price, easy steal. kinda reminds me of jbl quality music headphones. there s obviously no better headset at this price or maybe even under 100 but if you re looking for the best beats or bose style music headphones quality from this gaming headset you won t get it. this would be the best gift of the year at the best price for to gift any gamer. i used my extra headset budget money to get a new controller!', '2025-09-17 15:12:06.446935', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(95, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'el producto es cómodo, no esa y se siente resistente, de muy buena calidad!es hermoso. se escucha bien y el micrófono es bueno. lo uso para mi xbox', '2025-09-17 15:12:06.677977', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(96, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'buenos audifonosla calidad del micrófono es buenalos materiales tal vez puedan sentirse algo sencillo pero no se percibe tantolas almohadillas son muy cómodasel de cable trae la entrada 3.5 mm y otro para pc siendo la de audio y micrófonoel sonido puede ser espacial pero no siento que sea tan 7.1pero se siente buenos', '2025-09-17 15:12:07.065357', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(97, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'comfortable good 7.1 surround sound', '2025-09-17 15:12:07.339633', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(98, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'i had the original blackshark v1 headset and recently picked up the v2, and while the v2 is a solid overall improvement in terms of sound and comfort, there are a few trade offs. the audio quality is definitely a step up wider soundstage, clearer detail, and better balance overall. the ear cushions are softer and more breathable, making long sessions much more comfortable. that said, the mic is pretty mediocre. it gets the job done for voice chat, but it sounds a bit flat and compressed compared to other headsets in the same price range. also, while the v2 has a more modern and refined look, i still think the original v1 looked better purely from an aesthetic standpoint it had more of that tactical, distinctive vibe. still, the v2 delivers where it counts in terms of sound and comfort, even if it lost a bit of personality along the way but i would absoluetly recommend it for a budget friendly gaming headset.', '2025-09-17 15:12:07.674382', NULL, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(99, 'Razer BlackShark V2 X Gaming Headset: 7.1 Surround Sound - 50mm Drivers - Memory Foam Cushion - For PC, PS4, PS5, Switch - 3.5mm Audio Jack - Black', 'this is a nice basic headphone with microphone. i cannot speak for the quality of the mic i don t use it yet. the sound is fine on the game i play quake 2. the cord length is fine for my application it comes with a splitter cord for the sound and the mic on the sound card. the volume control works nice an smooth as does the button to mute the mic. my use is obviously for pc. i did not have to use the software recommended and have no issues with the sound it is crisp and clear and as loud as you can stand it. came packaged nicely and securely. it came with a manual that does not call out pink for mic and green for speakers but most should be able to figure that out. it came with a bag for storage too but myself i would rather see the money put into the technology, mtc. there were a couple of stickers with it as well that have the razer logo, one went on my antec case. overall they work quite well and too, i don t have big ears but plenty of ear and these fit completely over my ears and do not pinch too tightly on my head. i d buy them again.', '2025-09-17 16:11:34.013742', 2, 'amazon', 'https://www.amazon.com/Razer-BlackShark-V2-Gaming-Headset/dp/B086PKMZ21/ref=sr_1_14?_encoding=UTF8&content-id=amzn1.sym.edf433e2-b6d4-408e-986d-75239a5ced10&dib=eyJ2IjoiMSJ9.wyvLZSrGM6LAVK00nQm6aVwwGAJO_1iPx9E9EUquq_0ypOgrhbpWGx_szAi_3vaptt2DVxSm0QAbMruaV5LUBRPa4xhHMyq3mROuH29hUQ4CzrdfcjAAgj9he6c-2yoos5Ydv-sPycagC7MWnRmkysghMdZGjXxksYJfJ3fz-cn3JvOHWlyq6KKfn7X8ar3HMbEXLirIn68VPvx50-5-zwpada1txgdMbut_xQqWR2xwsrQBlSk6C5iFDnpCYBSHGiBeUvLkxg8RG4iIHMt7y597YfoH8qkbYmDaG2FHWvY.2K-onnQxfDP8EkDcN7E-w9JNyF'),
(100, 'Razer BlackShark V2 Pro Wireless Gaming Headset: Super Wideband Mic - Pro Tuned FPS Profiles - 50mm Drivers - Plush Noise Isolating Earcups - 70 Hr Battery - Bluetooth - for PC, PS5, Switch 2 - Black', 'i ve had these for a little over two months now and they are working amazing and feeling great! for reference, i am a small person who wears glasses and has a sensitivity to loud noises, so if you re in a similar boat, then these will work well for you!pros: comfort: these headphones are really light, but sturdy. they don t put too much tight pressure on my ears or head which helps when wearing glasses and don t make me sweat either. they stay on my head pretty well too. noise cancelling: the noise cancellation is pretty good, but that is kind of subjective for people. most dull noises like fans, cat fountains, air conditioners, outdoor noises, etc. will be cancelled out by this when sound is coming through. i can hear people talking if they come in the room, but it s very easy to drown them out and i sometimes will hear them, but not understand them. this won t block out all of the loud noises out there, but it will lessen them considerably. i m personally fine with this level, but i live in a mostly quiet home. this might be a downside for those with barking dogs, noisy kids, etc. quality microphone: this microphone picks up my voice well and i sound clear and good when i play with friends. it will pick up quite a bit of noise though, even from a distance like my cat meowing across the house , but i wouldn t say that s the mic s fault and instead my software s noise filtering capabilities. there are probably more things i could do for it or advance settings i can mess with, but for my needs it isn t important and my friends don t mind. a big thing i like is that the microphone piece is detachable, so i can actually get into more comfortable head positions if i want when i m just by myself. plus if the mic gets bad, i can just replace one piece rather than the whole headset. bluetooth freedom: i got this so that way i could see what it s like enjoying a cordless lifestyle. i ve heard mix things about bluetooth headphones in the past that were made for computers rather than phones, but i have not been disappointed. it doesn t really have a high range about maybe 30 feet? before it starts cutting out here and there, but i can go to my kitchen or even sit outside and not have any issues. it s really nice being able to grab a quick snack or make a meal and still chat with people instead of having to step away. it would be nice if this had just a bit more range to it, but for now it works. low light profile: i get that people enjoy rgb colors and all, but when i m gaming at night, i don t want bright lights affecting my peripherals as i play. the only lighting this headset has is a green power indicator light that is pointed downward and provides minimal light. that might make it a little dull for some, but i m not bothered by it. good volume range: these headphones can get pretty loud or quiet quiet being the important part , which i personally enjoy. i listen to heavy rock or punk music sometimes, and unfortunately that music can get too loud for my liking and i had struggled to find headphones that could get low enough without having to be muted. it s common that i find headphones or earbuds that can t get low enough for the louder music out there, but i haven t had an issue with this one. there is a good balance of being able to get low enough for loud songs, but also high enough for quiet songs.cons: connectivity issues: occasionally but rarely the headphones might disconnect from my computer even though i haven t unplugged the usb from it. it s not every day, and it s only happened maybe twice now since i ve had them. it s never when in active use, just when i want to use them. i can turn them off or charge them and once i m ready to use them it ll be fine, but this just sometimes happens. however, i don t believe it s entirely the headset s fault, as the same thing happens with my xbox bluetooth controller. might just be a computer issue. low sound popping issues: these headphones seem to struggle with super quiet noises. it feels like instead of these headphones staying on to play any sound that comes, it almost shuts off when there is perceived silence or lags when very faint noises are projected. if you turn up your volume, even just a little, you won t have that issue, but it is something i notice when listening to music. that does mean though that songs that get super quiet and then really loud will probably suck depending on the difference in scale.', '2025-09-17 16:25:09.943813', 2, 'amazon', 'https://www.amazon.com/dp/B0BY1FXC9N?ref=emc_p_m_5_i_atc&th=1'),
(101, 'Razer BlackShark V2 Pro Wireless Gaming Headset: Super Wideband Mic - Pro Tuned FPS Profiles - 50mm Drivers - Plush Noise Isolating Earcups - 70 Hr Battery - Bluetooth - for PC, PS5, Switch 2 - Black', 'let me preface by stating i am reviewing the blackshark v2 pro. sometimes amazon combines similar item reviews, this is important and that i have owned this for over a year with consistent usage, using it multiple days a week for 1 8 hours.this thing has a lot going for it with very few downsides that in my opinion do not outweigh the pros and if you can get this for 150 or less it is 100 worth it.pros noise cancellation is so strong, sometimes i don t hear my wife when she calls for me. she was the one who bought this for me lol sound quality through synapse can be adjusted to your liking, and i can t recommend it without it kind of a con incredibly comfortable even with glasses. there is a lot of good padding on the head and ears, prior headsets this was always an issue, recently before this i owned a corsair void elite and even that wasn t perfect, but it was close in this category. battery life is actually really strong, just be sure to charge it after each usage. i ve only ever gotten this to low battery where it beeps at me if i use it for 10 12 hours without charging it. sometimes thats a long gaming day sometimes thats multiple days. i m pretty good about keeping things charged, so this isn t a pain point for me, but may be for you. that said you can charge while using it. removable microphone, probably not a huge deal for most, but i use these as headphones not a headset. i use an external usb mic for better quality i ll get into that later . ability to use this with 3.5mm port. i wouldn t recommend this without the usb function, as the usb dac it comes with is decent enough and having used it without it, this is where it fails, but i m labeling the 3.5mm port as a pro in case you have a multipurpose headset in mind thx 7.1, now this is just virtual surround sound but in the couple games i have tried, notably monster hunter world, it performs really well, its weird to get used to but its done well enough. not a huge selling point, you can get this elsewhere, but noted.cons without the usb dac and synapse you are losing a lot of potential. this thing is really good for sound quality once you configure it, but on it s own it s horrible, this is why i did not get the wired version of the blackshark v2 with just 3.5mm. microphone quality isn t great, its honestly worse than most and for 180 it should be a lot better, this is why i use an external mic. unless you re yelling, your friends will probably say you re quiet. intermittent disconnects, unsure if this is a hardware, connection or synapse issue but it happens infrequently it doesn t bother me, but should be noted. synapse, i swear i ve had issues with every gaming software ghub, icue, synapse but recently synapse has been a pain. i love icue or did but hate corsair software, but if synapse continues to get worse i will look elsewhere for another headset.overall, if i had to buy this thing again i d do it for 130 or so. i wouldn t spend 180, i d just get professional wired headphones, but this thing has a lot going on that it made it worth it to me. i recommend these headphones to anyone who is in the market for a wireless headset in this budget range who doesn t hold grudges against razer. in that niche, i think its perfect.', '2025-09-17 16:25:10.381193', 2, 'amazon', 'https://www.amazon.com/dp/B0BY1FXC9N?ref=emc_p_m_5_i_atc&th=1'),
(102, 'Razer BlackShark V2 Pro Wireless Gaming Headset: Super Wideband Mic - Pro Tuned FPS Profiles - 50mm Drivers - Plush Noise Isolating Earcups - 70 Hr Battery - Bluetooth - for PC, PS5, Switch 2 - Black', 'after like 2 months of using this, don t buy it. that s it!', '2025-09-17 16:25:10.588450', 2, 'amazon', 'https://www.amazon.com/dp/B0BY1FXC9N?ref=emc_p_m_5_i_atc&th=1');
INSERT INTO `review` (`id`, `product_name`, `review_text`, `created_at`, `user_id`, `platform`, `link`) VALUES
(103, 'Razer BlackShark V2 Pro Wireless Gaming Headset: Super Wideband Mic - Pro Tuned FPS Profiles - 50mm Drivers - Plush Noise Isolating Earcups - 70 Hr Battery - Bluetooth - for PC, PS5, Switch 2 - Black', 'acabo de recibir estos audífonos. tenía unos razer kraken no recuerdo el modelo , pero después de cuatro años de uso intenso, aunque aún funcionan, la diadema se rompió, así que decidí comprar estos.llevo apenas dos días usándolos y estoy más que satisfecho con la compra. el micrófono suena increíble con los ajustes correctos, pero incluso sin configuraciones adicionales, la calidad es bastante buena. en cuanto al audio, me encanta. nunca he usado audífonos hi fi, que supongo que tienen una calidad excepcional, pero estos realmente se escuchan increíblemente bien esto es solo mi opinión .he visto que algunos usuarios mencionan que se les rompen, algo que hasta ahora no me ha pasado y espero que no suceda . estaré atento a su durabilidad.en conclusión, los recomiendo ampliamente por su calidad de audio y micrófono. creo que, con un uso adecuado y sin ser brusco con ellos, pueden durar bastante tiempo.edit 5 mayo 2025: siguen sin tener ningún rasguño, de igual manera el audio y micrófono son increíbles, como dije anterior mente con un uso normal sin ser brusco pueden durar bastante tiempo, hasta el momento no he encontrado nada que les falle como comentan algunos usuarios. una compra 10/10', '2025-09-17 16:25:11.091544', 2, 'amazon', 'https://www.amazon.com/dp/B0BY1FXC9N?ref=emc_p_m_5_i_atc&th=1'),
(104, 'Razer BlackShark V2 Pro Wireless Gaming Headset: Super Wideband Mic - Pro Tuned FPS Profiles - 50mm Drivers - Plush Noise Isolating Earcups - 70 Hr Battery - Bluetooth - for PC, PS5, Switch 2 - Black', 'i bought a new monitor, which doesn t have speakers in it a deliberate choice so wanted some good headphones that i could use to watch films with and play games with. read loads of reviews and these were considered the best for the price. very comfotable on the head and they cut out the surrounding noise amazingly beware your partner/parent shouting you as you won t hear them! . i use them with my ps4 and have set it up to work on everything, not just games. the quality of the sound is fantastic. i can t fault them at all. the mic just unplugs as well, so if you don t need it, just pop it to one side', '2025-09-17 16:25:11.590468', 2, 'amazon', 'https://www.amazon.com/dp/B0BY1FXC9N?ref=emc_p_m_5_i_atc&th=1'),
(105, 'Razer BlackShark V2 Pro Wireless Gaming Headset: Super Wideband Mic - Pro Tuned FPS Profiles - 50mm Drivers - Plush Noise Isolating Earcups - 70 Hr Battery - Bluetooth - for PC, PS5, Switch 2 - Black', 'i ve never had a headset this comfortable, with such a good microphone all in one. be careful with them as the plastic parts that hold the leather headband to the small metal rods can break after years of usage. they will still last a minimum of 3 years if you re careful with them.', '2025-09-17 16:25:11.944372', 2, 'amazon', 'https://www.amazon.com/dp/B0BY1FXC9N?ref=emc_p_m_5_i_atc&th=1'),
(106, 'Razer BlackShark V2 Pro Wireless Gaming Headset: Super Wideband Mic - Pro Tuned FPS Profiles - 50mm Drivers - Plush Noise Isolating Earcups - 70 Hr Battery - Bluetooth - for PC, PS5, Switch 2 - Black', 'big upgrade over my previous headset. great for just about anything including gaming and listening to music.', '2025-09-17 16:25:12.159988', 2, 'amazon', 'https://www.amazon.com/dp/B0BY1FXC9N?ref=emc_p_m_5_i_atc&th=1'),
(107, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'ordered this pen in 2020 when i first got my ipad. i just lost that one and had to order another one. it works amazing, stays charged for a while, and looks very similar to the apple pen for a lower price. it lasted me 5 years and was still working when i lost it.', '2025-09-17 16:26:21.960766', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(108, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'very easy to use, good quality, works great!', '2025-09-17 16:26:22.174024', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(109, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'so far i am really enjoying this pencil. it works great with my ipad and is very responsive to what i m trying to do. only reason i m giving it 4 stars is because it will just turn off while i m in the middle of writing and i have to tap it to get it to reconnect. other than that it works great and is worth the price.i also like that it comes with extra tips and it seems to hold a pretty decent charge.', '2025-09-17 16:26:22.503885', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(110, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'bought this for my ipad pro 13. ipad hasn t arrived yet so i tested this on my ipad air 5th generation. simply tap the end where the eraser would be to turn it on, didn t have to pair anything, it started working with the ipad air immediately. just tap the end to turn off. comes with 3 replacement tips. charging cable is included. great for the price. apple pen is expensive and i don t like that it doesn t have any options for colors. so with this one you save money, and have several color choices.', '2025-09-17 16:26:22.895727', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(111, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'my apple pencil stopped working so i wanted to get a replacement that s a lot more affordable and this stylus is amazing! it connected easily and writes really well on my ipad! great quality for price!', '2025-09-17 16:26:23.165314', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(112, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'works just like the apple stylist. it is great quality, lasts a long time, and stays connected. i find that the battery life is pretty long.', '2025-09-17 16:26:23.371556', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(113, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'i actually really like this stylus pen! it feels very similar to the apple pencil in terms of performance, just without the pressure sensitivity, which honestly isn t a dealbreaker for me. it connects effortlessly, is super easy to use, and the response time is spot on. there s no noticeable lag at all between writing or drawing and what appears on the screen.another big plus: the battery life is excellent. i can go days without needing to recharge it, which makes it super convenient for both work and creative projects. if you re looking for a solid, affordable alternative to the apple pencil, this is definitely worth trying!', '2025-09-17 16:26:23.881577', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(114, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'i grabbed this as a cheaper alternative to the apple pencil and honestly, i m impressed. here s the lowdown:what s awesome:works with my ipad air 10.9 right out of the box, it paired easily with bluetooth on , though it did turn off after a bit of inactivity. no big deal, just tap the cap and you re good to go again.amazonsweet art tool i ve used it for sketching, note taking, and quick doodles. it feels responsive and smooth definitely more precise than using my finger.amazongreat value several users say it s a surprising bargain. one even mentioned it blew my mind in several ways, despite a few small trade offs.woot! electronicsheads up:no pressure sensitivity unlike an apple pencil, it doesn t recognize how hard you press, so no pressure based shading for drawing.limited battery lifestyle it powers off automatically to save battery, which might throw you off at first. but once you get the tap on habit, it s fine.final thoughtsif you re looking for a reliable, budget friendly stylus for everyday ipad use like drawing, note taking, or general poking around this is a solid pick. it looks and feels sturdy, charges fast, and gets the job done without emptying your wallet. just don t expect the full apple pencil experience, and you ll be pleasantly surprised.', '2025-09-17 16:26:24.333569', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(115, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'veio sem carregar. tive que descartar.', '2025-09-17 16:26:24.529500', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(116, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'muy bien el producto, llegó a tiempo, funciona perfectamente.', '2025-09-17 16:26:24.751744', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(117, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'it is perfect. works very well', '2025-09-17 16:26:24.959951', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(118, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'l article lorsqu il marche est très bien, mais il n a duré que 1 jour. après ça je n ai pas su le chargé une seule fois et lorsqu il était allumé il ne se connecte plus à mon ipad. ne l achetez pas !', '2025-09-17 16:26:25.551413', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(119, 'Stylus Pen for iPad 6th-11th Generation-2X Fast Charge Active Pencil Compatible with 2018-2025 Apple iPad Pro 11\"/12.9\"/M4, iPad Air 3/4/5/M2/M3,iPad mini 5/6 Gen-White', 'great product with high quality', '2025-09-17 16:26:25.789841', 2, 'amazon', 'https://www.amazon.com/Rejection-Compatible-2018-2021-Precise-Writing/dp/B0831BF1FH/ref=pd_rhf_dp_s_pd_crcbs_d_sccl_2_1/134-0137872-0986603?pd_rd_w=xVsE9&content-id=amzn1.sym.31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_p=31346ea4-6dbc-4ac4-b4f3-cbf5f8cab4b9&pf_rd_r=8SJYBRYAYSKNCB3B4W4B&pd_rd_wg=iT9xY&pd_rd_r=4392801f-168b-4b81-9fce-f150d5098f4f&pd_rd_i=B0831BF1FH&th=1'),
(120, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'short of plugging these into a hyperx quadcast mic, i doubt you ll find a much better setup for gaming....especially at this price point. the sound quality is amazing for headphones in any context and the earcups are very very comfy. the built in mic sounds very good for a headset mic, but i digress...i started off with the cloud i s first and absolutely loved them, but the volume pot started getting scratchy and i worried about damage to the attached cable becoming an issue. so i figured i d stick with hyperx and give these cloud alpha s a try, since the cable does detach. i love the cloud i s, so i ll just stick to comparing the two of those as they are both phenomenal headsets and would both be a good buy. build and comfort hyperx is just killing it on the comfort front imo. the earcups are basically like tempurpedic memory foam and are a joy to wear. where the alpha differs from the cloud i s is how they feel out of the box. the alphas still super comfy, but firmer than the cloud i s. after some wear in, they soften up, but i can imagine the alphas lasting longer because of this. still comfy, just not quite as squishy. some people may prefer a firmer feel, ymmv.both headphones feel very solid and have a good weight to them. could use some more padding in the headband, but i don t really feel much discomfort after wearing them. this is about the only comfort area i could see them needing improvement on. not sure if it really amounts to build quality, but the previously mentioned attached cable on the cloud i s has become an issue for me the volume pot is really scratchy , but the alphas have a removable cord and the volume pot feels much more sturdy as well. sound quality holy crap, i have literally returned 500 shure headphones in favor of these. and to all assuming i have unrefined, plebian ears...16 years as a guitarist/bassist, audio engineering work for 6 of those years, running pa boards at a few venues, and a gig as a backing bassist for a solo artist using in ears would put me a cut above the typical dude listening to spotify on his iphone. i know a good pair when i hear it.now the shures were not flat response for mixing or monitoring, they were listening headphones, but while there is a slight eq curve and some signature enhancements on the alphas, they are surprisingly flat in a good way...albeit with some extended bass and very smooth highs. the difference is the cloud i s seemed to have more bass due to an eq bump in the low end response along with the seal being tighter on your ears with their squishier earcups. the alphas are firmer and so the seal isn t quite as tight on my head, making for less perceived bass at first, but if you squish them on your ears you catch a bit more of the low end.i will also say the low end on the alphas is much cleaner than on the cloud i s, which may not be caught by some listeners. when you hear explosions, rumbling, or are listening to bassy music you won t hear these buzzing or bottoming out like the cloud i s can. i use an external sound blaster card with one of my pcs and my custom eq curve for music listening is handled beautifully by these alphas. this by no means is an insult to the cloud i s, they are easily contenders with most 100 250 listening headsets out there, but in comparison to the alphas, these are the differences you ll experience. noise isolation the alphas are, again, not as tight a seal as the cloud i s but that could change in time. fwiw, these cut out a noticeable amount of noise...with only really rumbly or booming sounds getting through. a neighbor firing up a giant truck or thunder outside will catch my attention, but high pitched sounds get drowned out when you are listening to music or playing a game. i m sure with wear they ll get even better, but for a passive headset they do a fine job. mic quality the mic is perfectly fine and right in line with most 100 gaming headset mics. don t expect something on par with a dedicated mic like the hyperx quadcast or a razer siren, this is a totally different league of mic, but does a respectable job. most people use these for discord or zoom calls, or want to cut down on background noise as opposed to using an external mic. connectors the core cable has the headphone/mic conductors built into one 3.5mm plug, the same as old iphone headsets and many other gaming headsets do. there is an extender cable that splits it out to a headphone and mic plug separately. one thing i found weird, is my cloud i s were the same, but when i plugged the single 3.5mm combo jack into my hyperx quadcast they flat out would not work. however, the alphas do work for some reason. not sure why, seems like basically the same cable. either way, the cable is long enough for most folks rigs so no worries on that. overall if you want a gaming headset, or even just a headset for listening to music at your computer comfortably, this is an amazing headset. if you re fine with over ear headphones for listening on the go, there s no reason not to use these imo. if you re a streamer and want to save money and still get great performance...buy these!!some people might scoff at these and not consider them good since they aren t pro level gear, but honestly for monitoring and even music listening i would put these up against nearly any sub 600 headset. i don t abuse the hell out of my headphones, but they definitely get put to use for hours on end every day and i ve still had no issues. the cloud i s non usb are great too, but for a bit more the alphas are just plain amazing. the only thing you need to worry about these is if they discontinue them!', '2025-09-17 16:29:29.813833', NULL, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(121, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'totally worth it. the sound is fantastic, noise cancelling you get is so nice. super simple, just plug in and go, easier than having to charge. it works for everything, pc or controller etc... this is not a cheaply made product for how cheap the price is, if you need insane bang for your buck, this is the one. we are not the live of people to their money at electronics so we try to be careful but this feels like we splurged but time for the quality we got at such a low price. very happy with this. dunno if there are any apex players out there, but the second i plugged this headset in, i was popping 20 bombs and 4ks back to back, literal night and day the difference this thing has made.', '2025-09-17 16:29:30.390240', NULL, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(122, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'let me just start this off by saying i never leave reviews. i m not very easily impressed. i usually buy something, receive it, and carry on with my day. however, i ve had these for over two years now, and it only just recently dawned on me how much of an anomaly this headset has been compared to others i ve had in the past. in the hundreds, if not thousands of hours i ve used this headset for, not once has it ever consciously occurred to me that they re being worn while in use. you slap them on out of the box, adjust the earcups to your liking, and then forget they re there. these things are so damn comfortable that i regularly forget i m wearing them when i leave my apartment to go do other activities. i can t sing its praises enough in terms of comfort, since it feels like wearing nothing at all once properly adjusted.as for the sound quality, it s pretty damn good. i ve never really been much of an audio snob, but this is more than sufficient if you re just looking for something with quality sound. i ve used them for everything from games to podcasts, and there has never been an instance where i was underwhelmed in any capacity by the sound quality here. absolutely zero complaints from me in this department. the noise cancellation is pretty good, too. i mean, it s not gonna completely tune out anything and everything, but background noise is definitely reduced. my apartment s ac is only about ten feet from my desk, and it gets to be decently loud at times. though the noise from it is still noticeable when wearing them, it still becomes maybe 30 quieter even at that close a range. get sucked into a game, movie, podcast, or album wearing these, and you ll soon forget about any white noise going on in your immediate vicinity anyway. you can also buy hyperx s 7.1 surround sound usb adapter to beef up the sound a bit should you so choose, but i mainly use it for additional volume control and ease of use instead of the surround sound. maybe i m using it wrong, but it s just never worked for me.if you re sometimes rough with your peripherals like me, you probably are looking for something that can take a bit more punishment than most. rest assured you won t be disappointed here, because this thing s rock solid. just off the top of my head, my cloud alpha has survived: being slammed in the heavy wooden door leading to my apartment being slammed in a car door being accidentally rolled over at least two dozen times by sixty pound steel office chair being tossed onto hardwood flooring when i missed my intended target of the couch more times than i can count being dropped six feet onto solid concrete being stepped on at least two hundred different times being vomited on on more than one occasion, though that can probably be attributed to luck more than anything elseseriously, there are times when throw this guy around and have the headband pretzel in a concerning fashion, only to pick them up again, put them back on, and continue where i left off none the worse for wear. every time i d get a little alarmed at the aggressive way that i d just manhandled my headset, it d be a completely irrational fear. barring smashing these things with a hammer or actually trying to bend the headband 180 degrees in the opposite direction, there s no conceivable way to me you could break these in day to day use. i ve included a few pictures of the wear and tear they ve accumulated over the years, as well as the lengths to which they regularly bend just to give you an idea of the punishment they can take. believe me when i say the build quality is second to none.now, at this point you know the headset itself is durable, but you might still be wondering about the cable used to connect said headset to your preferred device. wonder no more. the included cable is 48 inches of what might as well be braided steel, and in my two years of usage, it s accumulated nary a scratch save for a small, nearly nonexistent kink below the volume control. it s detachable too, so you never have to worry about the annoyance and potential stress point that comes from having a cable permanently anchored to your headset. i ve coiled this thing up all sorts of ways, tossed it into my pockets and backpack in a ball, and it s none the worse for wear considering. even if you do somehow manage to break the cable or render it otherwise unusable, don t worry it can be replaced with any other 3.5mm audio cable with zero hit to sound quality. trust me. i ve checked.my only real gripe about this product is that my microphone has never worked even brand new out of the box. i ve since bought a replacement mic that also hasn t worked either, so my guess is that it s a manufacturing defect rather than something that broke during use over the years. this is really only something that you should think about if you don t already have a mic and/or will be using this mainly for games. even if yours also turns out to be broken, i m sure the folks in customer support would be more than willing to exchange your defective set for a functioning unit.but yeah. this has got to be the best headset i ve ever purchased in the ten odd years i ve been using them. the price is a bit steep compared your standard headset fare, but the price of admission is well worth it. i ve used these things so much that the pleather on the earcups is starting to peel off, and i ll continue to use them until i literally can t anymore, for whatever reason that may be. can t recommend them enough.', '2025-09-17 16:29:30.865809', NULL, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(123, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'the hyperx cloud alpha is a solid headset, especially for the price point. the sound quality is excellent crisp highs, solid mids, and the kind of bass you d expect from something in this tier. the mic quality is also surprisingly good for a non premium headset my friends on voice chat have never had any complaints.that said, i ll be honest i m a bit spoiled by astro headsets, and in direct comparison, the cloud alpha just doesn t hit the same in terms of comfort. i usually game in 3 hour sessions, and with these, i find myself constantly adjusting them on my head. they re not unbearable by any means, but they re definitely not as comfortable as i d like for extended use.build quality overall is very solid. the headset feels durable and well made nothing about it feels cheap. if you re looking for a budget friendly headset with great audio and a decent mic, this is a strong choice. but if comfort during long gaming sessions is a priority for you, you may want to spend a little more.4 out of 5 stars from me mostly for the sound, mic, and build quality.', '2025-09-17 16:29:31.278729', NULL, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(124, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'have had this headset for 6 months . and before that the cloud ii s for 3 years the headset is great quality and the fact that all cables are removable makes sure that it will last a long time. the sound quality is great, the inline remote is very helpful for quick adjustment and mic mutes and the build quality is great as ever.', '2025-09-17 16:29:31.629263', NULL, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(125, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'estos auriculares son para mu hermano que es el que juega a los vídeojuegos., tienen buena calidad de sonido.son muy cómodos y presentan buena resistencia los materiales.el micrófono suena de la leche, es de lo mejor. para juegos y películas suena con una calidad excelente.mi hermano se pasa horas jugando y no le molestan para nada, son bastante ligeros.', '2025-09-17 16:29:32.069978', NULL, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(126, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'the product arrive super fast looks like a quality item, as they are for my son i can t comment on actual quality of the product in use but i m sure my son will let me know.', '2025-09-17 16:29:32.320823', NULL, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(127, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'ho avuto un trascorso piuttosto burrascoso con le cuffie che uso prettamente per giocare a warzone ed apex. non sto a dirvi tutte le cuffie che ho comprato e restituito a causa della loro scarsa qualità ma arrivo subito al dunque. trovo queste hyperx cloud alpha s a 58 su warehouse. cuffie pari al nuovo, probabilmente hanno aperto la scatola, indossate, risigillate e mandate indietro. questo headset è stata davvero la svolta.l audio è eccezionale, pieno, corposo e piacevole. sui battle royale warzone e apex riesco a capire bene da dove provengono i passi. sono rimasto sorpreso perché apex di per se ha un audio pessimo tanto che ho dovuto restituire lo logitech g432 che comprai prima delle hyperx ma queste cuffie sono riuscite a fare miracoli persino in un gioco che ha l audio davvero pessimo.il microfono è eccezionale ed è regolabile in ogni direzione. i miei compagni dicono di sentirmi molto molto bene.le cuffie rimangono ben salde ma allo stesso tempo non stringono.il telecomandino sul cavo è molto comodo per regolare il volume, attivare/disattivare il sorround 7.1 e per attivare/disattivare il microfono.il software è piuttosto semplice ed intuitivo anche se, per il mio utilizzo, serve ben a poco.unica nota dolente: nonostante il 7.1 sia migliore di tutte le altre cuffie che abbia provato, rimane comunque pessimo. ne sconsiglio l utilizzo. senza il 7.1 le cuffie sono una bomba.vengono forniti anche un paio di padiglioni in materiale più leggero per l estate così da evitare la sudorazione delle orecchie. al momento non lì ho ancora usati perché per ora mi trovo bene con i suoi standard.promosse a pieni voti.', '2025-09-17 16:29:32.689179', NULL, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(128, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'short of plugging these into a hyperx quadcast mic, i doubt you ll find a much better setup for gaming....especially at this price point. the sound quality is amazing for headphones in any context and the earcups are very very comfy. the built in mic sounds very good for a headset mic, but i digress...i started off with the cloud i s first and absolutely loved them, but the volume pot started getting scratchy and i worried about damage to the attached cable becoming an issue. so i figured i d stick with hyperx and give these cloud alpha s a try, since the cable does detach. i love the cloud i s, so i ll just stick to comparing the two of those as they are both phenomenal headsets and would both be a good buy. build and comfort hyperx is just killing it on the comfort front imo. the earcups are basically like tempurpedic memory foam and are a joy to wear. where the alpha differs from the cloud i s is how they feel out of the box. the alphas still super comfy, but firmer than the cloud i s. after some wear in, they soften up, but i can imagine the alphas lasting longer because of this. still comfy, just not quite as squishy. some people may prefer a firmer feel, ymmv.both headphones feel very solid and have a good weight to them. could use some more padding in the headband, but i don t really feel much discomfort after wearing them. this is about the only comfort area i could see them needing improvement on. not sure if it really amounts to build quality, but the previously mentioned attached cable on the cloud i s has become an issue for me the volume pot is really scratchy , but the alphas have a removable cord and the volume pot feels much more sturdy as well. sound quality holy crap, i have literally returned 500 shure headphones in favor of these. and to all assuming i have unrefined, plebian ears...16 years as a guitarist/bassist, audio engineering work for 6 of those years, running pa boards at a few venues, and a gig as a backing bassist for a solo artist using in ears would put me a cut above the typical dude listening to spotify on his iphone. i know a good pair when i hear it.now the shures were not flat response for mixing or monitoring, they were listening headphones, but while there is a slight eq curve and some signature enhancements on the alphas, they are surprisingly flat in a good way...albeit with some extended bass and very smooth highs. the difference is the cloud i s seemed to have more bass due to an eq bump in the low end response along with the seal being tighter on your ears with their squishier earcups. the alphas are firmer and so the seal isn t quite as tight on my head, making for less perceived bass at first, but if you squish them on your ears you catch a bit more of the low end.i will also say the low end on the alphas is much cleaner than on the cloud i s, which may not be caught by some listeners. when you hear explosions, rumbling, or are listening to bassy music you won t hear these buzzing or bottoming out like the cloud i s can. i use an external sound blaster card with one of my pcs and my custom eq curve for music listening is handled beautifully by these alphas. this by no means is an insult to the cloud i s, they are easily contenders with most 100 250 listening headsets out there, but in comparison to the alphas, these are the differences you ll experience. noise isolation the alphas are, again, not as tight a seal as the cloud i s but that could change in time. fwiw, these cut out a noticeable amount of noise...with only really rumbly or booming sounds getting through. a neighbor firing up a giant truck or thunder outside will catch my attention, but high pitched sounds get drowned out when you are listening to music or playing a game. i m sure with wear they ll get even better, but for a passive headset they do a fine job. mic quality the mic is perfectly fine and right in line with most 100 gaming headset mics. don t expect something on par with a dedicated mic like the hyperx quadcast or a razer siren, this is a totally different league of mic, but does a respectable job. most people use these for discord or zoom calls, or want to cut down on background noise as opposed to using an external mic. connectors the core cable has the headphone/mic conductors built into one 3.5mm plug, the same as old iphone headsets and many other gaming headsets do. there is an extender cable that splits it out to a headphone and mic plug separately. one thing i found weird, is my cloud i s were the same, but when i plugged the single 3.5mm combo jack into my hyperx quadcast they flat out would not work. however, the alphas do work for some reason. not sure why, seems like basically the same cable. either way, the cable is long enough for most folks rigs so no worries on that. overall if you want a gaming headset, or even just a headset for listening to music at your computer comfortably, this is an amazing headset. if you re fine with over ear headphones for listening on the go, there s no reason not to use these imo. if you re a streamer and want to save money and still get great performance...buy these!!some people might scoff at these and not consider them good since they aren t pro level gear, but honestly for monitoring and even music listening i would put these up against nearly any sub 600 headset. i don t abuse the hell out of my headphones, but they definitely get put to use for hours on end every day and i ve still had no issues. the cloud i s non usb are great too, but for a bit more the alphas are just plain amazing. the only thing you need to worry about these is if they discontinue them!', '2025-09-17 16:31:56.095142', 2, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(129, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'totally worth it. the sound is fantastic, noise cancelling you get is so nice. super simple, just plug in and go, easier than having to charge. it works for everything, pc or controller etc... this is not a cheaply made product for how cheap the price is, if you need insane bang for your buck, this is the one. we are not the live of people to their money at electronics so we try to be careful but this feels like we splurged but time for the quality we got at such a low price. very happy with this. dunno if there are any apex players out there, but the second i plugged this headset in, i was popping 20 bombs and 4ks back to back, literal night and day the difference this thing has made.', '2025-09-17 16:31:56.505542', 2, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(130, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'let me just start this off by saying i never leave reviews. i m not very easily impressed. i usually buy something, receive it, and carry on with my day. however, i ve had these for over two years now, and it only just recently dawned on me how much of an anomaly this headset has been compared to others i ve had in the past. in the hundreds, if not thousands of hours i ve used this headset for, not once has it ever consciously occurred to me that they re being worn while in use. you slap them on out of the box, adjust the earcups to your liking, and then forget they re there. these things are so damn comfortable that i regularly forget i m wearing them when i leave my apartment to go do other activities. i can t sing its praises enough in terms of comfort, since it feels like wearing nothing at all once properly adjusted.as for the sound quality, it s pretty damn good. i ve never really been much of an audio snob, but this is more than sufficient if you re just looking for something with quality sound. i ve used them for everything from games to podcasts, and there has never been an instance where i was underwhelmed in any capacity by the sound quality here. absolutely zero complaints from me in this department. the noise cancellation is pretty good, too. i mean, it s not gonna completely tune out anything and everything, but background noise is definitely reduced. my apartment s ac is only about ten feet from my desk, and it gets to be decently loud at times. though the noise from it is still noticeable when wearing them, it still becomes maybe 30 quieter even at that close a range. get sucked into a game, movie, podcast, or album wearing these, and you ll soon forget about any white noise going on in your immediate vicinity anyway. you can also buy hyperx s 7.1 surround sound usb adapter to beef up the sound a bit should you so choose, but i mainly use it for additional volume control and ease of use instead of the surround sound. maybe i m using it wrong, but it s just never worked for me.if you re sometimes rough with your peripherals like me, you probably are looking for something that can take a bit more punishment than most. rest assured you won t be disappointed here, because this thing s rock solid. just off the top of my head, my cloud alpha has survived: being slammed in the heavy wooden door leading to my apartment being slammed in a car door being accidentally rolled over at least two dozen times by sixty pound steel office chair being tossed onto hardwood flooring when i missed my intended target of the couch more times than i can count being dropped six feet onto solid concrete being stepped on at least two hundred different times being vomited on on more than one occasion, though that can probably be attributed to luck more than anything elseseriously, there are times when throw this guy around and have the headband pretzel in a concerning fashion, only to pick them up again, put them back on, and continue where i left off none the worse for wear. every time i d get a little alarmed at the aggressive way that i d just manhandled my headset, it d be a completely irrational fear. barring smashing these things with a hammer or actually trying to bend the headband 180 degrees in the opposite direction, there s no conceivable way to me you could break these in day to day use. i ve included a few pictures of the wear and tear they ve accumulated over the years, as well as the lengths to which they regularly bend just to give you an idea of the punishment they can take. believe me when i say the build quality is second to none.now, at this point you know the headset itself is durable, but you might still be wondering about the cable used to connect said headset to your preferred device. wonder no more. the included cable is 48 inches of what might as well be braided steel, and in my two years of usage, it s accumulated nary a scratch save for a small, nearly nonexistent kink below the volume control. it s detachable too, so you never have to worry about the annoyance and potential stress point that comes from having a cable permanently anchored to your headset. i ve coiled this thing up all sorts of ways, tossed it into my pockets and backpack in a ball, and it s none the worse for wear considering. even if you do somehow manage to break the cable or render it otherwise unusable, don t worry it can be replaced with any other 3.5mm audio cable with zero hit to sound quality. trust me. i ve checked.my only real gripe about this product is that my microphone has never worked even brand new out of the box. i ve since bought a replacement mic that also hasn t worked either, so my guess is that it s a manufacturing defect rather than something that broke during use over the years. this is really only something that you should think about if you don t already have a mic and/or will be using this mainly for games. even if yours also turns out to be broken, i m sure the folks in customer support would be more than willing to exchange your defective set for a functioning unit.but yeah. this has got to be the best headset i ve ever purchased in the ten odd years i ve been using them. the price is a bit steep compared your standard headset fare, but the price of admission is well worth it. i ve used these things so much that the pleather on the earcups is starting to peel off, and i ll continue to use them until i literally can t anymore, for whatever reason that may be. can t recommend them enough.', '2025-09-17 16:31:57.044014', 2, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1');
INSERT INTO `review` (`id`, `product_name`, `review_text`, `created_at`, `user_id`, `platform`, `link`) VALUES
(131, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'the hyperx cloud alpha is a solid headset, especially for the price point. the sound quality is excellent crisp highs, solid mids, and the kind of bass you d expect from something in this tier. the mic quality is also surprisingly good for a non premium headset my friends on voice chat have never had any complaints.that said, i ll be honest i m a bit spoiled by astro headsets, and in direct comparison, the cloud alpha just doesn t hit the same in terms of comfort. i usually game in 3 hour sessions, and with these, i find myself constantly adjusting them on my head. they re not unbearable by any means, but they re definitely not as comfortable as i d like for extended use.build quality overall is very solid. the headset feels durable and well made nothing about it feels cheap. if you re looking for a budget friendly headset with great audio and a decent mic, this is a strong choice. but if comfort during long gaming sessions is a priority for you, you may want to spend a little more.4 out of 5 stars from me mostly for the sound, mic, and build quality.', '2025-09-17 16:31:57.569239', 2, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(132, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'have had this headset for 6 months . and before that the cloud ii s for 3 years the headset is great quality and the fact that all cables are removable makes sure that it will last a long time. the sound quality is great, the inline remote is very helpful for quick adjustment and mic mutes and the build quality is great as ever.', '2025-09-17 16:31:57.924707', 2, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(133, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'estos auriculares son para mu hermano que es el que juega a los vídeojuegos., tienen buena calidad de sonido.son muy cómodos y presentan buena resistencia los materiales.el micrófono suena de la leche, es de lo mejor. para juegos y películas suena con una calidad excelente.mi hermano se pasa horas jugando y no le molestan para nada, son bastante ligeros.', '2025-09-17 16:31:58.377903', 2, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(134, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'the product arrive super fast looks like a quality item, as they are for my son i can t comment on actual quality of the product in use but i m sure my son will let me know.', '2025-09-17 16:31:58.683359', 2, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(135, 'HyperX Cloud Alpha - Gaming Headset, Dual Chamber Drivers, Legendary Comfort, Aluminum Frame, Detachable Microphone, Works on PC, PS4, PS5, Xbox One/ Series X|S, Nintendo Switch and Mobile – Red', 'ho avuto un trascorso piuttosto burrascoso con le cuffie che uso prettamente per giocare a warzone ed apex. non sto a dirvi tutte le cuffie che ho comprato e restituito a causa della loro scarsa qualità ma arrivo subito al dunque. trovo queste hyperx cloud alpha s a 58 su warehouse. cuffie pari al nuovo, probabilmente hanno aperto la scatola, indossate, risigillate e mandate indietro. questo headset è stata davvero la svolta.l audio è eccezionale, pieno, corposo e piacevole. sui battle royale warzone e apex riesco a capire bene da dove provengono i passi. sono rimasto sorpreso perché apex di per se ha un audio pessimo tanto che ho dovuto restituire lo logitech g432 che comprai prima delle hyperx ma queste cuffie sono riuscite a fare miracoli persino in un gioco che ha l audio davvero pessimo.il microfono è eccezionale ed è regolabile in ogni direzione. i miei compagni dicono di sentirmi molto molto bene.le cuffie rimangono ben salde ma allo stesso tempo non stringono.il telecomandino sul cavo è molto comodo per regolare il volume, attivare/disattivare il sorround 7.1 e per attivare/disattivare il microfono.il software è piuttosto semplice ed intuitivo anche se, per il mio utilizzo, serve ben a poco.unica nota dolente: nonostante il 7.1 sia migliore di tutte le altre cuffie che abbia provato, rimane comunque pessimo. ne sconsiglio l utilizzo. senza il 7.1 le cuffie sono una bomba.vengono forniti anche un paio di padiglioni in materiale più leggero per l estate così da evitare la sudorazione delle orecchie. al momento non lì ho ancora usati perché per ora mi trovo bene con i suoi standard.promosse a pieni voti.', '2025-09-17 16:31:59.157609', 2, 'amazon', 'https://www.amazon.com/HyperX-Cloud-Alpha-Gaming-Headset/dp/B074NBSF9N/ref=pd_rhf_dp_s_ci_mcx_mr_hp_d_d_sccl_1_3/134-0137872-0986603?pd_rd_w=affuO&content-id=amzn1.sym.c5dee08d-b11d-4c8c-b272-714fd8f96f22%3Aamzn1.symc.1ce8a41e-053b-4bdc-9570-9f81c17d9d85&pf_rd_p=c5dee08d-b11d-4c8c-b272-714fd8f96f22&pf_rd_r=FRYT8KWAEP3WH8Q4FW4Y&pd_rd_wg=1WHW4&pd_rd_r=40f7ec3a-5995-4a78-9050-22fe2a9105b8&pd_rd_i=B074NBSF9N&th=1'),
(136, 'Air Jordan 4 Retro White Cement (2025) FV5029', 'a little longer than i d expected, being shipped within the us. other than that, no issues. easy experience, fantastic pair of shoes. very clean with no defects. thank you again!', '2025-09-17 16:37:25.603741', 2, 'ebay', 'https://www.ebay.com/itm/205430920143?_skw=Jordan+4+Retro+OG+2025+White+Cement&var=506225476838&epid=19071736213&itmmeta=01K5C8KN8RFBBK03C2HBXY2P2H&hash=item2fd4a313cf:g:--4AAeSweWJoHpWT&itmprp=enc%3AAQAKAAABAMHg7L1Zz0LA5DYYmRTS30m7NMMgF222xZcYEuSKfR6y1vXMoMEk6iHyuZrHSJ8m6kQDmAUkgBgiZFHL%2FTk%2BT%2BPreXEpSeIz4FoS6XcDbnDrAQGmlIhA2U8NhlcNDN%2FyulHWvwSqzPQ85ueHbPlwl1pXHRYTKstcuk80aHGrjldmNDXtkgljcuGQgNwoKFrLj%2FSLqqo9StySlim8zVxNjDauJliabouPruxhL76OT3d7o9TLSV%2BpqvFRXkKiz5fL98OKNlEpmLPjOYjEaGZrVD%2'),
(137, 'Air Jordan 4 Retro White Cement (2025) FV5029', 'quality of shoes is super seamless and clean. came in great condition as stated in description. definitely one of the best looking high value shoes i ve gotten in a while. 10/10 product. 10/10 seller', '2025-09-17 16:37:25.873599', 2, 'ebay', 'https://www.ebay.com/itm/205430920143?_skw=Jordan+4+Retro+OG+2025+White+Cement&var=506225476838&epid=19071736213&itmmeta=01K5C8KN8RFBBK03C2HBXY2P2H&hash=item2fd4a313cf:g:--4AAeSweWJoHpWT&itmprp=enc%3AAQAKAAABAMHg7L1Zz0LA5DYYmRTS30m7NMMgF222xZcYEuSKfR6y1vXMoMEk6iHyuZrHSJ8m6kQDmAUkgBgiZFHL%2FTk%2BT%2BPreXEpSeIz4FoS6XcDbnDrAQGmlIhA2U8NhlcNDN%2FyulHWvwSqzPQ85ueHbPlwl1pXHRYTKstcuk80aHGrjldmNDXtkgljcuGQgNwoKFrLj%2FSLqqo9StySlim8zVxNjDauJliabouPruxhL76OT3d7o9TLSV%2BpqvFRXkKiz5fL98OKNlEpmLPjOYjEaGZrVD%2'),
(138, 'Air Jordan 4 Retro White Cement (2025) FV5029', 'love the look, great texture, fit comfortably, great price for my buck,fresh and new', '2025-09-17 16:37:26.082007', 2, 'ebay', 'https://www.ebay.com/itm/205430920143?_skw=Jordan+4+Retro+OG+2025+White+Cement&var=506225476838&epid=19071736213&itmmeta=01K5C8KN8RFBBK03C2HBXY2P2H&hash=item2fd4a313cf:g:--4AAeSweWJoHpWT&itmprp=enc%3AAQAKAAABAMHg7L1Zz0LA5DYYmRTS30m7NMMgF222xZcYEuSKfR6y1vXMoMEk6iHyuZrHSJ8m6kQDmAUkgBgiZFHL%2FTk%2BT%2BPreXEpSeIz4FoS6XcDbnDrAQGmlIhA2U8NhlcNDN%2FyulHWvwSqzPQ85ueHbPlwl1pXHRYTKstcuk80aHGrjldmNDXtkgljcuGQgNwoKFrLj%2FSLqqo9StySlim8zVxNjDauJliabouPruxhL76OT3d7o9TLSV%2BpqvFRXkKiz5fL98OKNlEpmLPjOYjEaGZrVD%2'),
(139, 'Air Jordan 4 Retro White Cement (2025) FV5029', 'everything about these shows is perfect really not much more to say condition is new quality is top notch appearance is new and value it is what it is', '2025-09-17 16:37:26.316514', 2, 'ebay', 'https://www.ebay.com/itm/205430920143?_skw=Jordan+4+Retro+OG+2025+White+Cement&var=506225476838&epid=19071736213&itmmeta=01K5C8KN8RFBBK03C2HBXY2P2H&hash=item2fd4a313cf:g:--4AAeSweWJoHpWT&itmprp=enc%3AAQAKAAABAMHg7L1Zz0LA5DYYmRTS30m7NMMgF222xZcYEuSKfR6y1vXMoMEk6iHyuZrHSJ8m6kQDmAUkgBgiZFHL%2FTk%2BT%2BPreXEpSeIz4FoS6XcDbnDrAQGmlIhA2U8NhlcNDN%2FyulHWvwSqzPQ85ueHbPlwl1pXHRYTKstcuk80aHGrjldmNDXtkgljcuGQgNwoKFrLj%2FSLqqo9StySlim8zVxNjDauJliabouPruxhL76OT3d7o9TLSV%2BpqvFRXkKiz5fL98OKNlEpmLPjOYjEaGZrVD%2'),
(140, 'Air Jordan 4 Retro White Cement (2025) FV5029', 'second time ordering from this seller and once again came through the clutch and never seems to fail. price be like ouch though especially with taxes and shipping fees included, but all in all i highly recommend the seller and this is will be my go to source if ever i need. what you see on the site is what you gonna get, brand new, and whether a united states or a overseas pair this seller items come back authentic, he hasn t miss yet with me. thanks and order again from you soon', '2025-09-17 16:37:26.610261', 2, 'ebay', 'https://www.ebay.com/itm/205430920143?_skw=Jordan+4+Retro+OG+2025+White+Cement&var=506225476838&epid=19071736213&itmmeta=01K5C8KN8RFBBK03C2HBXY2P2H&hash=item2fd4a313cf:g:--4AAeSweWJoHpWT&itmprp=enc%3AAQAKAAABAMHg7L1Zz0LA5DYYmRTS30m7NMMgF222xZcYEuSKfR6y1vXMoMEk6iHyuZrHSJ8m6kQDmAUkgBgiZFHL%2FTk%2BT%2BPreXEpSeIz4FoS6XcDbnDrAQGmlIhA2U8NhlcNDN%2FyulHWvwSqzPQ85ueHbPlwl1pXHRYTKstcuk80aHGrjldmNDXtkgljcuGQgNwoKFrLj%2FSLqqo9StySlim8zVxNjDauJliabouPruxhL76OT3d7o9TLSV%2BpqvFRXkKiz5fL98OKNlEpmLPjOYjEaGZrVD%2'),
(141, 'Air Jordan 4 Retro White Cement (2025) FV5029', 'jordan 4 retro white cement 100 authentic, quality is excellent, good condition, reasonable price, and also very clean and it s brandnew. a', '2025-09-17 16:37:26.817617', 2, 'ebay', 'https://www.ebay.com/itm/205430920143?_skw=Jordan+4+Retro+OG+2025+White+Cement&var=506225476838&epid=19071736213&itmmeta=01K5C8KN8RFBBK03C2HBXY2P2H&hash=item2fd4a313cf:g:--4AAeSweWJoHpWT&itmprp=enc%3AAQAKAAABAMHg7L1Zz0LA5DYYmRTS30m7NMMgF222xZcYEuSKfR6y1vXMoMEk6iHyuZrHSJ8m6kQDmAUkgBgiZFHL%2FTk%2BT%2BPreXEpSeIz4FoS6XcDbnDrAQGmlIhA2U8NhlcNDN%2FyulHWvwSqzPQ85ueHbPlwl1pXHRYTKstcuk80aHGrjldmNDXtkgljcuGQgNwoKFrLj%2FSLqqo9StySlim8zVxNjDauJliabouPruxhL76OT3d7o9TLSV%2BpqvFRXkKiz5fL98OKNlEpmLPjOYjEaGZrVD%2'),
(142, 'Air Jordan 4 Retro White Cement (2025) FV5029', 'i had gotten scammed off of stockx less than a week before i had bought these. messaged the seller to make sure these would be authentic and he reassured me full authenticity. and when i got them they were ofc authentic. came in great condition. quality is there and for a great price. thank you so much', '2025-09-17 16:37:27.100370', 2, 'ebay', 'https://www.ebay.com/itm/205430920143?_skw=Jordan+4+Retro+OG+2025+White+Cement&var=506225476838&epid=19071736213&itmmeta=01K5C8KN8RFBBK03C2HBXY2P2H&hash=item2fd4a313cf:g:--4AAeSweWJoHpWT&itmprp=enc%3AAQAKAAABAMHg7L1Zz0LA5DYYmRTS30m7NMMgF222xZcYEuSKfR6y1vXMoMEk6iHyuZrHSJ8m6kQDmAUkgBgiZFHL%2FTk%2BT%2BPreXEpSeIz4FoS6XcDbnDrAQGmlIhA2U8NhlcNDN%2FyulHWvwSqzPQ85ueHbPlwl1pXHRYTKstcuk80aHGrjldmNDXtkgljcuGQgNwoKFrLj%2FSLqqo9StySlim8zVxNjDauJliabouPruxhL76OT3d7o9TLSV%2BpqvFRXkKiz5fL98OKNlEpmLPjOYjEaGZrVD%2'),
(143, 'Air Jordan 4 Retro White Cement (2025) FV5029', 'first time buying shoes from ebay was very satisfied with product. received product as described brand new in box. would definitely buy from seller again. fair price, no issues got them within the time frame of delivery. i m happy i did not miss out on these.', '2025-09-17 16:37:27.373534', 2, 'ebay', 'https://www.ebay.com/itm/205430920143?_skw=Jordan+4+Retro+OG+2025+White+Cement&var=506225476838&epid=19071736213&itmmeta=01K5C8KN8RFBBK03C2HBXY2P2H&hash=item2fd4a313cf:g:--4AAeSweWJoHpWT&itmprp=enc%3AAQAKAAABAMHg7L1Zz0LA5DYYmRTS30m7NMMgF222xZcYEuSKfR6y1vXMoMEk6iHyuZrHSJ8m6kQDmAUkgBgiZFHL%2FTk%2BT%2BPreXEpSeIz4FoS6XcDbnDrAQGmlIhA2U8NhlcNDN%2FyulHWvwSqzPQ85ueHbPlwl1pXHRYTKstcuk80aHGrjldmNDXtkgljcuGQgNwoKFrLj%2FSLqqo9StySlim8zVxNjDauJliabouPruxhL76OT3d7o9TLSV%2BpqvFRXkKiz5fL98OKNlEpmLPjOYjEaGZrVD%2'),
(144, 'Unknown Product', 'test', '2025-09-17 17:40:59.489732', 2, 'web', NULL),
(145, 'Del Monte Sarap Savers Filipino Style Party Pack', 'high quality ingredients used, no artificial colors or flavors, cheesy and flavorful sauce, authentic taste of the philippines,', '2025-09-17 17:41:55.866246', 2, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(146, 'Del Monte Sarap Savers Filipino Style Party Pack', 'the spirit of christmas embodies the warmth, generosity, and joy often associated with the holiday season. it s about coming together with family and friends, sharing love, and creating lasting memories. the spirit also emphasizes kindness, giving to those in need, and showing compassion to others. many find it in traditions like decorating a tree, exchanging gifts, singing carols, or simply spending quality time with loved ones. what does the spirit of christmas mean to you?', '2025-09-17 17:41:56.229304', 2, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(147, 'Del Monte Sarap Savers Filipino Style Party Pack', 'pepsi is a carbonated soft drink with a sweet, cola flavor, produced by pepsico. it was created in the 1890s by caleb bradham and has grown to become one of the world s most popular soda brands. pepsi is often seen as coca cola s main rival. it comes in several varieties like diet pepsi and pepsi max sugar free , and is sold globally in over 200 countries.', '2025-09-17 17:41:56.550711', 2, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(148, 'Del Monte Sarap Savers Filipino Style Party Pack', 'delicious filipino style spaghetti sauce, upgrade your spaghetti game, perfect for a filipino style party,', '2025-09-17 17:41:56.755827', 2, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(149, 'Del Monte Sarap Savers Filipino Style Party Pack', 'quality:good quality and condition', '2025-09-17 17:41:56.976532', 2, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(150, 'Del Monte Sarap Savers Filipino Style Party Pack', 'cheesy and flavorful sauce, preservative free sauce, try it today and taste the difference, perfect for a filipino style party, saves time and effort in cooking,', '2025-09-17 17:41:57.322838', 2, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(151, 'Del Monte Sarap Savers Filipino Style Party Pack', 'high quality ingredients used, no artificial colors or flavors, cheesy and flavorful sauce, authentic taste of the philippines,', '2025-09-17 17:42:33.231647', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(152, 'Del Monte Sarap Savers Filipino Style Party Pack', 'the spirit of christmas embodies the warmth, generosity, and joy often associated with the holiday season. it s about coming together with family and friends, sharing love, and creating lasting memories. the spirit also emphasizes kindness, giving to those in need, and showing compassion to others. many find it in traditions like decorating a tree, exchanging gifts, singing carols, or simply spending quality time with loved ones. what does the spirit of christmas mean to you?', '2025-09-17 17:42:33.564531', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(153, 'Del Monte Sarap Savers Filipino Style Party Pack', 'pepsi is a carbonated soft drink with a sweet, cola flavor, produced by pepsico. it was created in the 1890s by caleb bradham and has grown to become one of the world s most popular soda brands. pepsi is often seen as coca cola s main rival. it comes in several varieties like diet pepsi and pepsi max sugar free , and is sold globally in over 200 countries.', '2025-09-17 17:42:33.942363', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(154, 'Del Monte Sarap Savers Filipino Style Party Pack', 'delicious filipino style spaghetti sauce, upgrade your spaghetti game, perfect for a filipino style party,', '2025-09-17 17:42:34.166869', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(155, 'Del Monte Sarap Savers Filipino Style Party Pack', 'quality:good quality and condition', '2025-09-17 17:42:34.359872', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(156, 'Del Monte Sarap Savers Filipino Style Party Pack', 'cheesy and flavorful sauce, preservative free sauce, try it today and taste the difference, perfect for a filipino style party, saves time and effort in cooking,', '2025-09-17 17:42:34.636400', NULL, 'lazada', 'https://www.lazada.com.ph/products/pdp-i603890361-s1658322875.html?scm=1007.17760.398138.0&pvid=119d789d-0047-44ff-bffa-9fd61e7db616&search=flashsale&spm=a2o4l.homepage.FlashSale.d_603890361'),
(157, 'Eden Filled Cheese Original 430g', 'the perfect addition to any dish, love the distinct creaminess of eden cheese, item arrived in good condition. nice packaging and all complete thank you for this great buy!', '2025-09-17 17:51:49.144065', NULL, 'lazada', 'https://www.lazada.com.ph/products/eden-filled-cheese-original-430g-i393336417-s910566066.html?&search=pdp_same_topselling?spm=a2o4l.pdp_revamp.recommendation_1.4.2e761747m3QevW&mp=1&scm=1007.16389.286994.0&clickTrackInfo=37c51089-14ed-4904-89f2-40de9f8d0c18__393336417__25229__trigger2i__224806__0.041__0.041__0.0__0.0__0.0__0.041__3__null__null__null__null__null__null____172.25__0.0__4.956438487314505__2089__172.25__1379905,268998,1992563,1947538,1989670,1994766,1953132,1953056,149328,1990447,19'),
(158, 'Eden Filled Cheese Original 430g', 'price:cheaper price taste:basta eden masarap tlga texture:smooth like jogger anuraw hehehebasta eden masarap tlga , basta lazmart makakamura ,saka laging maaga ang process shipping to deliver ayos a must have for filipino recipes, love the distinct creaminess of eden cheese, love the distinct creaminess of eden cheese, so versatile and easy to use, the perfect addition to any dish, makes my dishes taste even better, makes my dishes taste even better,', '2025-09-17 17:51:49.474818', NULL, 'lazada', 'https://www.lazada.com.ph/products/eden-filled-cheese-original-430g-i393336417-s910566066.html?&search=pdp_same_topselling?spm=a2o4l.pdp_revamp.recommendation_1.4.2e761747m3QevW&mp=1&scm=1007.16389.286994.0&clickTrackInfo=37c51089-14ed-4904-89f2-40de9f8d0c18__393336417__25229__trigger2i__224806__0.041__0.041__0.0__0.0__0.0__0.041__3__null__null__null__null__null__null____172.25__0.0__4.956438487314505__2089__172.25__1379905,268998,1992563,1947538,1989670,1994766,1953132,1953056,149328,1990447,19'),
(159, 'Eden Filled Cheese Original 430g', 'thanks po lazada maayos po ang item pagkakabalot mabilis din dumating untill next transaction po hindi na aq nahihirapan namili dito nalang sa online sulit pa salamat .', '2025-09-17 17:51:49.717546', NULL, 'lazada', 'https://www.lazada.com.ph/products/eden-filled-cheese-original-430g-i393336417-s910566066.html?&search=pdp_same_topselling?spm=a2o4l.pdp_revamp.recommendation_1.4.2e761747m3QevW&mp=1&scm=1007.16389.286994.0&clickTrackInfo=37c51089-14ed-4904-89f2-40de9f8d0c18__393336417__25229__trigger2i__224806__0.041__0.041__0.0__0.0__0.0__0.041__3__null__null__null__null__null__null____172.25__0.0__4.956438487314505__2089__172.25__1379905,268998,1992563,1947538,1989670,1994766,1953132,1953056,149328,1990447,19'),
(160, 'Eden Filled Cheese Original 430g', 'creamy goodness in every bite, so versatile and easy to use, rich and flavorful cheese, a must have for filipino recipes, makes my dishes taste even better,', '2025-09-17 17:51:49.933650', NULL, 'lazada', 'https://www.lazada.com.ph/products/eden-filled-cheese-original-430g-i393336417-s910566066.html?&search=pdp_same_topselling?spm=a2o4l.pdp_revamp.recommendation_1.4.2e761747m3QevW&mp=1&scm=1007.16389.286994.0&clickTrackInfo=37c51089-14ed-4904-89f2-40de9f8d0c18__393336417__25229__trigger2i__224806__0.041__0.041__0.0__0.0__0.0__0.041__3__null__null__null__null__null__null____172.25__0.0__4.956438487314505__2089__172.25__1379905,268998,1992563,1947538,1989670,1994766,1953132,1953056,149328,1990447,19'),
(161, 'Eden Filled Cheese Original 430g', 'same item you could buy in the supermarket. the item has longer expiry date. new and fresh tock', '2025-09-17 17:51:50.156017', NULL, 'lazada', 'https://www.lazada.com.ph/products/eden-filled-cheese-original-430g-i393336417-s910566066.html?&search=pdp_same_topselling?spm=a2o4l.pdp_revamp.recommendation_1.4.2e761747m3QevW&mp=1&scm=1007.16389.286994.0&clickTrackInfo=37c51089-14ed-4904-89f2-40de9f8d0c18__393336417__25229__trigger2i__224806__0.041__0.041__0.0__0.0__0.0__0.041__3__null__null__null__null__null__null____172.25__0.0__4.956438487314505__2089__172.25__1379905,268998,1992563,1947538,1989670,1994766,1953132,1953056,149328,1990447,19');

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
(80, 'genuine', 0.9248298842460416, 'ensemble_svm_rf_distilbert', '2025-09-15 04:28:03.418957', 80),
(81, 'likely_genuine', 0.8900546415232251, 'ensemble_svm_rf_distilbert', '2025-09-17 15:09:58.653377', 81),
(82, 'likely_genuine', 0.8124895395766882, 'ensemble_svm_rf_distilbert', '2025-09-17 15:09:59.120523', 82),
(83, 'fake', 0.9956987935895799, 'ensemble_svm_rf_distilbert', '2025-09-17 15:09:59.348111', 83),
(84, 'fake', 0.9559499307978989, 'ensemble_svm_rf_distilbert', '2025-09-17 15:09:59.653347', 84),
(85, 'likely_genuine', 0.8039926357769398, 'ensemble_svm_rf_distilbert', '2025-09-17 15:09:59.971886', 85),
(86, 'likely_genuine', 0.8741274791034783, 'ensemble_svm_rf_distilbert', '2025-09-17 15:10:00.268201', 86),
(87, 'genuine', 0.9557302913276986, 'ensemble_svm_rf_distilbert', '2025-09-17 15:10:00.600449', 87),
(88, 'possibly_genuine', 0.7418781262659717, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:04.273201', 88),
(89, 'genuine', 0.9005204677423595, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:04.536258', 89),
(90, 'likely_genuine', 0.8705663106793121, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:04.815574', 90),
(91, 'genuine', 0.9240884007823078, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:05.150873', 91),
(92, 'genuine', 0.9475971152321309, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:05.610069', 92),
(93, 'likely_genuine', 0.8808368018345836, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:06.116105', 93),
(94, 'genuine', 0.9667348386647486, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:06.452930', 94),
(95, 'likely_genuine', 0.8109903706893017, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:06.682975', 95),
(96, 'likely_genuine', 0.7774670125085553, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:07.144043', 96),
(97, 'fake', 0.9621568301421467, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:07.350626', 97),
(98, 'genuine', 0.9362401599479382, 'ensemble_svm_rf_distilbert', '2025-09-17 15:12:07.680370', 98),
(99, 'genuine', 0.9132161599518042, 'ensemble_svm_rf_distilbert', '2025-09-17 16:11:34.020739', 99),
(100, 'likely_genuine', 0.8977597869157194, 'ensemble_svm_rf_distilbert', '2025-09-17 16:25:09.949810', 100),
(101, 'likely_genuine', 0.782802768377335, 'ensemble_svm_rf_distilbert', '2025-09-17 16:25:10.388323', 101),
(102, 'likely_genuine', 0.8964808943849996, 'ensemble_svm_rf_distilbert', '2025-09-17 16:25:10.594447', 102),
(103, 'possibly_genuine', 0.7325649567281455, 'ensemble_svm_rf_distilbert', '2025-09-17 16:25:11.098566', 103),
(104, 'genuine', 0.9694105420620974, 'ensemble_svm_rf_distilbert', '2025-09-17 16:25:11.604222', 104),
(105, 'likely_genuine', 0.8631296065674803, 'ensemble_svm_rf_distilbert', '2025-09-17 16:25:11.955365', 105),
(106, 'genuine', 0.9459621923819845, 'ensemble_svm_rf_distilbert', '2025-09-17 16:25:12.178080', 106),
(107, 'genuine', 0.9150292967666608, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:21.967762', 107),
(108, 'likely_genuine', 0.7552637586232315, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:22.181020', 108),
(109, 'possibly_fake', 0.7044600423537373, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:22.510996', 109),
(110, 'likely_genuine', 0.8583996249720378, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:22.901724', 110),
(111, 'genuine', 0.9381193298345243, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:23.170309', 111),
(112, 'likely_genuine', 0.7543603310393675, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:23.378551', 112),
(113, 'genuine', 0.9795584783250966, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:23.887573', 113),
(114, 'genuine', 0.9750596218501087, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:24.341562', 114),
(115, 'fake', 0.9557014813096909, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:24.538494', 115),
(116, 'likely_fake', 0.8955884248529851, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:24.758741', 116),
(117, 'likely_fake', 0.8358964535799874, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:24.964947', 117),
(118, 'likely_genuine', 0.7820058229565598, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:25.557409', 118),
(119, 'likely_fake', 0.880649407080913, 'ensemble_svm_rf_distilbert', '2025-09-17 16:26:25.795347', 119),
(120, 'genuine', 0.9082765582698668, 'ensemble_svm_rf_distilbert', '2025-09-17 16:29:29.824932', 120),
(121, 'genuine', 0.9270791535984962, 'ensemble_svm_rf_distilbert', '2025-09-17 16:29:30.396237', 121),
(122, 'likely_genuine', 0.8743999794806618, 'ensemble_svm_rf_distilbert', '2025-09-17 16:29:30.871806', 122),
(123, 'genuine', 0.9258991643811357, 'ensemble_svm_rf_distilbert', '2025-09-17 16:29:31.289821', 123),
(124, 'possibly_genuine', 0.6641471115150729, 'ensemble_svm_rf_distilbert', '2025-09-17 16:29:31.636214', 124),
(125, 'likely_genuine', 0.8198053707756011, 'ensemble_svm_rf_distilbert', '2025-09-17 16:29:32.074974', 125),
(126, 'genuine', 0.940998533255667, 'ensemble_svm_rf_distilbert', '2025-09-17 16:29:32.325922', 126),
(127, 'likely_genuine', 0.8120985620444789, 'ensemble_svm_rf_distilbert', '2025-09-17 16:29:32.695175', 127),
(128, 'genuine', 0.9082765582698668, 'ensemble_svm_rf_distilbert', '2025-09-17 16:31:56.102243', 128),
(129, 'genuine', 0.9270791535984962, 'ensemble_svm_rf_distilbert', '2025-09-17 16:31:56.511537', 129),
(130, 'likely_genuine', 0.8743999794806618, 'ensemble_svm_rf_distilbert', '2025-09-17 16:31:57.055115', 130),
(131, 'genuine', 0.9258991643811357, 'ensemble_svm_rf_distilbert', '2025-09-17 16:31:57.578233', 131),
(132, 'possibly_genuine', 0.6641471115150729, 'ensemble_svm_rf_distilbert', '2025-09-17 16:31:57.930809', 132),
(133, 'likely_genuine', 0.8198053707756011, 'ensemble_svm_rf_distilbert', '2025-09-17 16:31:58.382878', 133),
(134, 'genuine', 0.940998533255667, 'ensemble_svm_rf_distilbert', '2025-09-17 16:31:58.689355', 134),
(135, 'likely_genuine', 0.8120985620444789, 'ensemble_svm_rf_distilbert', '2025-09-17 16:31:59.163715', 135),
(136, 'genuine', 0.909417915464475, 'ensemble_svm_rf_distilbert', '2025-09-17 16:37:25.609737', 136),
(137, 'genuine', 0.9056544245188479, 'ensemble_svm_rf_distilbert', '2025-09-17 16:37:25.880594', 137),
(138, 'likely_genuine', 0.8109150496800135, 'ensemble_svm_rf_distilbert', '2025-09-17 16:37:26.094000', 138),
(139, 'likely_genuine', 0.8841982323441308, 'ensemble_svm_rf_distilbert', '2025-09-17 16:37:26.322509', 139),
(140, 'likely_genuine', 0.8123934636610513, 'ensemble_svm_rf_distilbert', '2025-09-17 16:37:26.616365', 140),
(141, 'likely_genuine', 0.8690001999919859, 'ensemble_svm_rf_distilbert', '2025-09-17 16:37:26.822726', 141),
(142, 'genuine', 0.9528650139664253, 'ensemble_svm_rf_distilbert', '2025-09-17 16:37:27.106367', 142),
(143, 'genuine', 0.9618063344371501, 'ensemble_svm_rf_distilbert', '2025-09-17 16:37:27.379659', 143),
(144, 'fake', 0.9725573790250721, 'ensemble_svm_rf_distilbert', '2025-09-17 17:40:59.506229', 144),
(145, 'genuine', 0.9195340928094123, 'ensemble_svm_rf_distilbert', '2025-09-17 17:41:55.879239', 145),
(146, 'genuine', 0.9711770389404362, 'ensemble_svm_rf_distilbert', '2025-09-17 17:41:56.242295', 146),
(147, 'uncertain', 0.5709003913644668, 'ensemble_svm_rf_distilbert', '2025-09-17 17:41:56.563715', 147),
(148, 'genuine', 0.9127244170599179, 'ensemble_svm_rf_distilbert', '2025-09-17 17:41:56.767323', 148),
(149, 'fake', 0.9245060861427055, 'ensemble_svm_rf_distilbert', '2025-09-17 17:41:56.988671', 149),
(150, 'likely_genuine', 0.8932709426370133, 'ensemble_svm_rf_distilbert', '2025-09-17 17:41:57.347327', 150),
(151, 'genuine', 0.9195340928094123, 'ensemble_svm_rf_distilbert', '2025-09-17 17:42:33.244638', 151),
(152, 'genuine', 0.9711770389404362, 'ensemble_svm_rf_distilbert', '2025-09-17 17:42:33.578027', 152),
(153, 'uncertain', 0.5709003913644668, 'ensemble_svm_rf_distilbert', '2025-09-17 17:42:33.952862', 153),
(154, 'genuine', 0.9127244170599179, 'ensemble_svm_rf_distilbert', '2025-09-17 17:42:34.178367', 154),
(155, 'fake', 0.9245060861427055, 'ensemble_svm_rf_distilbert', '2025-09-17 17:42:34.372371', 155),
(156, 'likely_genuine', 0.8932709426370133, 'ensemble_svm_rf_distilbert', '2025-09-17 17:42:34.650498', 156),
(157, 'genuine', 0.9332283396890745, 'ensemble_svm_rf_distilbert', '2025-09-17 17:51:49.159124', 157),
(158, 'possibly_genuine', 0.6743667520327058, 'ensemble_svm_rf_distilbert', '2025-09-17 17:51:49.486921', 158),
(159, 'likely_genuine', 0.7822880642764883, 'ensemble_svm_rf_distilbert', '2025-09-17 17:51:49.730538', 159),
(160, 'genuine', 0.9714067144890437, 'ensemble_svm_rf_distilbert', '2025-09-17 17:51:49.946642', 160),
(161, 'genuine', 0.9216958987568176, 'ensemble_svm_rf_distilbert', '2025-09-17 17:51:50.167010', 161);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviewai_activitylog_user_id_6c968914_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD PRIMARY KEY (`key`),
  ADD UNIQUE KEY `user_id` (`user_id`);

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
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT for table `review_analysis`
--
ALTER TABLE `review_analysis`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `reviewai_activitylog_user_id_6c968914_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD CONSTRAINT `authtoken_token_user_id_35299eff_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

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
