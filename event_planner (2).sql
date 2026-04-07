-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 07, 2026 at 02:11 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `event_planner`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `event_id`, `user_id`, `text`, `created_at`) VALUES
(1, 2, 4, 'Perfect timing for me.', '2025-04-23 02:46:15'),
(2, 3, 3, 'Just registered, see you all there!', '2025-04-25 19:46:15'),
(3, 4, 5, 'Will there be food available?', '2025-04-28 01:46:15'),
(4, 5, 5, 'What time does it end?', '2025-04-25 19:46:15'),
(5, 2, 2, 'What time does it end?', '2025-04-27 05:46:15'),
(6, 4, 5, 'What time does it end?', '2025-04-23 04:46:15'),
(7, 2, 5, 'Perfect timing for me.', '2025-04-26 02:46:15'),
(8, 4, 3, 'Has anyone attended this before? What was it like?', '2025-04-28 01:46:15'),
(9, 2, 3, 'Can I bring my kids?', '2025-04-25 23:46:15'),
(10, 1, 5, 'Can I bring my kids?', '2025-04-28 12:46:15'),
(11, 3, 5, 'Has anyone attended this before? What was it like?', '2025-04-29 14:46:15'),
(12, 3, 4, 'Has anyone attended this before? What was it like?', '2025-04-27 21:46:15'),
(13, 4, 3, 'What time does it end?', '2025-04-24 17:46:15'),
(14, 4, 5, 'Is this suitable for beginners?', '2025-04-27 08:46:15'),
(15, 2, 3, 'Just registered, see you all there!', '2025-04-28 19:46:15'),
(16, 3, 4, 'Can I bring my kids?', '2025-04-28 03:46:15'),
(17, 4, 2, 'Has anyone attended this before? What was it like?', '2025-04-26 17:46:15'),
(18, 2, 3, 'Will there be food available?', '2025-04-26 15:46:15'),
(19, 2, 3, 'What time does it end?', '2025-04-25 06:46:15'),
(20, 4, 5, 'Is there parking available nearby?', '2025-04-27 17:46:15'),
(22, 6, 10, 'komentarz', '2025-06-04 08:20:25'),
(23, 1, 10, '@carol_williams no\n', '2025-06-04 08:26:17'),
(24, 7, 10, 'abc', '2025-06-04 09:10:28'),
(25, 16, 13, 'chuj ci w pizde kurwpo', '2026-04-07 10:56:22'),
(26, 16, 13, 'jebana stara rura', '2026-04-07 10:56:30');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `location` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL,
  `attendees_count` int(11) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `promotion_days` int(11) NOT NULL DEFAULT 0,
  `promotion_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `promoted_until` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `date`, `location`, `capacity`, `attendees_count`, `created_by`, `image`, `group_id`, `promotion_days`, `promotion_cost`, `promoted_until`) VALUES
(1, 'Tech Conference 2023', 'Join us for the biggest tech conference of the year featuring keynotes, workshops, and networking opportunities.', '2023-08-25', 'Convention Center, New York', 500, 0, 1, 'default-event.jpg', NULL, 0, 0.00, NULL),
(2, 'Community Cleanup Day', 'Help clean up our local parks and streets. Tools and refreshments provided.', '2023-09-15', 'Central Park, Main Entrance', 100, 0, 2, 'default-event.jpg', NULL, 0, 0.00, NULL),
(3, 'Summer Music Festival', 'Three-day music festival featuring local and international artists. Food, drinks, and camping available.', '2023-07-30', 'Riverside Park', 2000, 0, 3, 'default-event.jpg', NULL, 0, 0.00, NULL),
(4, 'Charity Fun Run', '5K fun run to raise money for local children\'s hospital. All fitness levels welcome.', '2023-10-10', 'City Sports Complex', 300, 0, 1, 'default-event.jpg', NULL, 0, 0.00, NULL),
(5, 'Food & Wine Tasting', 'Sample dishes and wines from top local restaurants and wineries.', '2023-09-05', 'Downtown Culinary Center', 150, 0, 2, 'default-event.jpg', NULL, 0, 0.00, NULL),
(6, 'Test Event', 'This is a test event', '2025-05-01', 'Test City', 100, 0, 8, NULL, NULL, 0, 0.00, NULL),
(7, 'abc', 'def', '2022-12-12', 'poznan', 10, 1, 10, '1748934084184-bronik.png', NULL, 0, 0.00, NULL),
(8, 'Test Event', 'This is a test event', '2025-05-01', 'Test City', 100, 0, 8, NULL, NULL, 0, 0.00, NULL),
(10, 'test grupa ', 'test grupa', '2026-12-12', 'oznan', 12, 0, 3, '1751199605584-bronik.png', 4, 0, 0.00, NULL),
(11, 'fafaffa', 'sffafasfa', '2026-03-12', 'kutno', 210, 0, 10, '1751199805574-pieski.png', 7, 0, 0.00, NULL),
(12, 'fdfsf', 'fsfsfsf', '2027-03-31', 'kfasfa', 38, 0, 5, '1751199919737-7.jpeg', 7, 0, 0.00, NULL),
(13, 'abcfff', 'abcdddff', '2026-04-30', 'kutno', 33, 0, 5, '1751200114253-woman-4876864_1920.jpg', 7, 0, 0.00, NULL),
(14, 'afsaf', 'fasfafssaf', '2027-03-23', 'afasf', 40, 0, 10, '1751200300977-ic_person.svg', 7, 0, 0.00, NULL),
(15, 'sraka pierdaka', 'avjfafsafsf', '2026-03-21', 'cytadela', 73, 1, 13, '1775557754138-netwirly_logo_aligned.svg', 8, 0, 0.00, NULL),
(16, 'ffsdfs', 'dfdsfdfsfdf', '2026-11-11', 'poznan', 67, 1, 13, '1775559156050-image.png', 8, 0, 0.00, NULL),
(17, 'sraka z maka', 'fdsfdsfs', '2026-06-06', 'fsafaf', 213, 0, 10, '1775559256436-IMG_9110.HEIC', 9, 0, 0.00, NULL),
(18, 'fsfsfd', 'fsdfsd', '2026-07-07', 'fsdfsdf', 22, 0, 13, '1775560788609-netwirly_logo_aligned.svg', NULL, 0, 0.00, NULL),
(19, 'gfdgdgdgf', 'sgsfggg', '4334-03-21', 'trterteter', 54, 0, 13, NULL, NULL, 30, 15.00, '2026-05-07 13:24:15'),
(20, 'gffgdgdfd', 'fgdg', '2332-03-31', 'fdsfsdfsf', 5, 0, 14, '1775561339175-bfa83ee7-e779-4fdf-86ee-7491d8326ce8.jpeg', NULL, 3, 7.00, '2026-04-10 13:28:59'),
(21, 'fdsfdsf', 'sdffsfdfsdf', '2026-05-05', 'Stare Winogrady, Poznan, Greater Poland Voivodeship, 60-001, Poland', 546, 0, 13, '1775562273276-oranges-4197596_1920.jpg', 8, 30, 15.00, '2026-05-07 13:44:33');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `event_id`) VALUES
(8, 1, 5),
(2, 2, 3),
(1, 2, 4),
(3, 3, 3),
(4, 3, 4),
(5, 4, 1),
(7, 5, 1),
(6, 5, 2),
(10, 10, 2),
(13, 10, 6),
(14, 13, 15),
(15, 13, 17);

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `privacy` enum('public','private','open') NOT NULL DEFAULT 'public',
  `creator_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `post_permission_mode` varchar(32) NOT NULL DEFAULT 'all_members'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `name`, `description`, `image`, `privacy`, `creator_id`, `created_at`, `post_permission_mode`) VALUES
(1, 'f', 'f', '1751150917065-pieski.png', 'private', 10, '2025-06-28 22:48:37', 'all_members'),
(2, 'a', 'a', '1751154395991-pomaranca.png', 'public', 10, '2025-06-28 23:46:35', 'selected_members'),
(3, 'abc', 'def', '1751154542454-pomaranca.png', 'private', 10, '2025-06-28 23:49:02', 'all_members'),
(4, 'grupa Carol', 'mieszkancy carol', '1751194465488-amstaff.png', 'open', 5, '2025-06-29 10:54:25', 'all_members'),
(5, 'test', 'test', '1751195171453-bronik.png', 'private', 10, '2025-06-29 11:06:11', 'all_members'),
(6, 'fafasffa', 'ffsfsf', '1751195315736-pieski.png', 'private', 3, '2025-06-29 11:08:35', 'all_members'),
(7, 'fffff', 'fffff', '1751195438063-pomaranca.png', 'private', 10, '2025-06-29 11:10:38', 'all_members'),
(8, 'winogrady', 'osiedle pod lipami', '1775557651458-gmail_images20260120_083207.png', 'private', 13, '2026-04-07 10:27:31', 'selected_members'),
(9, 'kaszka z ptaszka', 'abc', '1775559223249-pralka.jpeg', 'open', 10, '2026-04-07 10:53:43', 'selected_members');

-- --------------------------------------------------------

--
-- Table structure for table `group_memberships`
--

CREATE TABLE `group_memberships` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `status` enum('pending','joined','rejected') DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `seen` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_memberships`
--

INSERT INTO `group_memberships` (`id`, `user_id`, `group_id`, `status`, `joined_at`, `seen`) VALUES
(13, 5, 2, 'joined', '2025-06-29 10:53:53', 1),
(14, 5, 3, 'joined', '2025-06-29 11:07:32', 1),
(15, 5, 1, 'joined', '2025-06-29 10:54:52', 1),
(16, 5, 4, 'joined', '2025-06-29 10:54:25', 1),
(23, 3, 5, 'joined', '2025-06-29 11:07:34', 0),
(25, 3, 3, 'joined', '2025-06-29 11:07:29', 0),
(26, 3, 1, 'joined', '2025-06-29 11:07:23', 0),
(27, 3, 6, 'joined', '2025-06-29 11:08:35', 0),
(35, 3, 4, 'joined', '2025-06-29 12:19:37', 0),
(36, 5, 7, 'joined', '2025-06-29 12:22:50', 1),
(55, 13, 7, 'pending', NULL, 0),
(57, 13, 8, 'joined', '2026-04-07 10:52:57', 0),
(58, 10, 8, 'joined', '2026-04-07 11:26:11', 0),
(59, 10, 9, 'joined', '2026-04-07 10:53:43', 0),
(60, 13, 9, 'joined', '2026-04-07 10:54:49', 0),
(61, 14, 9, 'joined', '2026-04-07 11:28:27', 0);

-- --------------------------------------------------------

--
-- Table structure for table `group_post_permissions`
--

CREATE TABLE `group_post_permissions` (
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_post_permissions`
--

INSERT INTO `group_post_permissions` (`group_id`, `user_id`) VALUES
(2, 5),
(8, 10),
(8, 13),
(9, 10),
(9, 13);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `seen` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `seen`, `created_at`) VALUES
(1, 10, 'New event from user 5 in group 7', 1, '2025-06-29 14:28:34'),
(2, 5, 'New event from user 10 in group 7', 1, '2025-06-29 14:31:40'),
(3, 10, 'New event from user bozena123 in group winogrady', 0, '2026-04-07 12:52:36'),
(4, 10, 'New event from user bozena123 in group winogrady', 0, '2026-04-07 13:44:33');

-- --------------------------------------------------------

--
-- Table structure for table `payment_requests`
--

CREATE TABLE `payment_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `session_id` varchar(128) NOT NULL,
  `amount` int(11) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'PLN',
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `p24_order_id` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `rater_id` int(11) NOT NULL,
  `rated_id` int(11) NOT NULL,
  `rating` decimal(2,1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `rater_id`, `rated_id`, `rating`, `created_at`) VALUES
(1, 1, 10, 5.0, '2025-06-03 07:04:23'),
(3, 12, 10, 5.0, '2025-06-04 08:23:58'),
(5, 13, 10, 1.0, '2026-04-07 10:57:12');

-- --------------------------------------------------------

--
-- Table structure for table `registration`
--

CREATE TABLE `registration` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `registration`
--

INSERT INTO `registration` (`id`, `user_id`, `event_id`) VALUES
(1, 2, 1),
(2, 2, 2),
(3, 3, 3),
(4, 3, 1),
(5, 3, 4),
(6, 4, 3),
(7, 4, 1),
(8, 4, 4),
(9, 5, 1),
(10, 5, 5),
(23, 10, 7),
(30, 13, 15),
(32, 13, 16);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_admin` tinyint(1) DEFAULT 0,
  `is_banned` tinyint(1) DEFAULT 0,
  `ban_reason` text DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `story_video` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `image`, `description`, `created_at`, `is_admin`, `is_banned`, `ban_reason`, `balance`, `story_video`) VALUES
(1, 'Admin', 'admin@event-planner.com', '$2a$10$KsZ.sOhQc23rDcH1fm9QnOp2fCbGoU/Nzr5IdviKdaHFoGXhz.B8a', 'user', NULL, NULL, '2025-04-29 20:46:06', 1, 0, NULL, 0.00, NULL),
(2, 'admin', 'admin@example.com', '$2a$10$O4a2B4B6/ZHgQzNkUk9Biu/6s/fji89onN9ffuCpZOCuemkv.39SO', 'user', 'default-avatar.png', 'System administrator', '2025-04-29 20:46:14', 1, 0, NULL, 0.00, NULL),
(3, 'alice_johnson', 'alice@example.com', '$2a$10$nA6MOt83QzIpxf6NfRui6umxtldy92UZfWW3kNCSa7Q6mUNvzaYbG', 'user', 'default-avatar.png', 'Event enthusiast and community organizer', '2025-04-29 20:46:14', 0, 0, NULL, 0.00, NULL),
(4, 'bob_smith', 'bob@example.com', '$2a$10$whj/vnCNMBItFheYcSkRpuSQ..s4TjsDwj6CwXS2Q.RtWjthjHl2K', 'user', 'default-avatar.png', 'Love attending local meetups and conferences', '2025-04-29 20:46:14', 0, 0, NULL, 0.00, NULL),
(5, 'carol_williams', 'carol@example.com', '$2a$10$HKXjjlkSOpiXe5iSORLF7OxlSUZGDMvDmxJPqOPtvZa.Gj6mASjcy', 'user', 'default-avatar.png', 'Tech conference addict', '2025-04-29 20:46:14', 0, 0, NULL, 0.00, NULL),
(6, 'dave_brown', 'dave@example.com', '$2a$10$d1lIqzoEkGfGLAtlEZDU5uNQ6nVbtEHfO1SczfYuYjW2YW/cH9Oxy', 'user', 'default-avatar.png', 'Professional photographer looking for events to capture', '2025-04-29 20:46:14', 0, 1, 'bo', 0.00, NULL),
(7, 'evan_miller', 'evan@example.com', '$2a$10$uGcz9xgRtSU79QzjTfUsOuBh5pj9wyDEP3NB1hDnZhNs5lZ33kMP.', 'user', 'default-avatar.png', 'Music lover and concert goer', '2025-04-29 20:46:15', 0, 1, 'Spamming events with fake registrations', 0.00, NULL),
(8, 'ZSKuser', 'president@pessa.com', '$2a$10$a9tIQxiXEfVuTLSjzQCbIuuXy8FQp1KquMxSsNM1wXgkb1gp/2zT.', 'user', NULL, NULL, '2025-04-29 20:50:25', 0, 0, NULL, 0.00, NULL),
(9, 'NowyZSKuser', 'zsk1745959825117@uczen.zsk.poznan.pl', '$2a$10$QCbcbV4sUVq7x.doUeVmfu3pd3Zc6uYwO4BWNVMWQD1nBPOfSH22y', 'user', NULL, NULL, '2025-04-29 20:50:25', 0, 0, NULL, 0.00, NULL),
(10, 'a', 'a@a.a', '$2a$10$YDvRal5SNxcBxJMLz/HMwOvS.QmDnb8ovzbh9HimKtVYzLXRI.Qq2', 'user', '1748934031305-pieski.png', 'moasdasdasd', '2025-06-03 07:00:31', 1, 0, NULL, 0.00, '1775563887503-Screen Recording 2025-05-12 at 15.27.08 (online-video-cutter.com) (1).mp4'),
(11, 'NowyZSKuser', 'zsk1749023768357@uczen.zsk.poznan.pl', '$2a$10$bBcbEK1Xs2GjmzP31QnEWOqQmK.C6kx.9g1pKgHs5j/ZYR1tyFVxm', 'user', NULL, NULL, '2025-06-04 07:56:08', 0, 0, NULL, 0.00, NULL),
(12, 'test', 'test@test.pl', '$2a$10$zoY3aXuhq3R6v4fEOrIo2OAMBNEtMUDBzSCV4JMfON7g0VGsuWLsW', 'user', '1749025408087-amstaff.png', NULL, '2025-06-04 08:23:28', 0, 0, NULL, 0.00, NULL),
(13, 'bozena123', 'bozena@hiena.pl', '$2a$10$BqL.KpFBohJs3d2uDx5cRuGUyi4GhAf3X87OoQLfCcl7kOwN6m/2W', 'user', '1775557589207-netwirly_logo_aligned.svg', 'jebac tych co nie wierzyli', '2026-04-07 10:26:29', 0, 0, NULL, 520.00, '1775562827581-movie.mp4'),
(14, 'abcd', 'abcd@abcd.pl', '$2a$10$e2f0I4x.ZU51HUS3qUnyl.keWpsD3MVHvcRgBZOyiHiy41Xc6hGdG', 'user', '1775561290280-odkurzacz.jpeg', NULL, '2026-04-07 11:28:10', 0, 0, NULL, 43.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_stories`
--

CREATE TABLE `user_stories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `video_filename` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_stories`
--

INSERT INTO `user_stories` (`id`, `user_id`, `video_filename`, `created_at`) VALUES
(1, 10, '1775563876077-movie.mp4', '2026-04-07 12:11:16'),
(2, 10, '1775563887503-Screen Recording 2025-05-12 at 15.27.08 (online-video-cutter.com) (1).mp4', '2026-04-07 12:11:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_event_unique` (`user_id`,`event_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_id` (`creator_id`),
  ADD KEY `idx_group_name` (`name`);

--
-- Indexes for table `group_memberships`
--
ALTER TABLE `group_memberships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_membership` (`user_id`,`group_id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `group_post_permissions`
--
ALTER TABLE `group_post_permissions`
  ADD PRIMARY KEY (`group_id`,`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payment_requests`
--
ALTER TABLE `payment_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id` (`session_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rater_rated` (`rater_id`,`rated_id`),
  ADD KEY `rated_id` (`rated_id`);

--
-- Indexes for table `registration`
--
ALTER TABLE `registration`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_stories`
--
ALTER TABLE `user_stories`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `group_memberships`
--
ALTER TABLE `group_memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payment_requests`
--
ALTER TABLE `payment_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `registration`
--
ALTER TABLE `registration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `user_stories`
--
ALTER TABLE `user_stories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`);

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `group_memberships`
--
ALTER TABLE `group_memberships`
  ADD CONSTRAINT `group_memberships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `group_memberships_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`rater_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`rated_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `registration`
--
ALTER TABLE `registration`
  ADD CONSTRAINT `registration_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registration_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
