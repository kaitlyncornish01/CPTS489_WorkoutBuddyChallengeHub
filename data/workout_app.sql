-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: workout_app
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `admins` WRITE;
INSERT INTO `admins` VALUES (1,'admin@workoutbuddy.com','$2b$10$zoM9KKLX5o43dRlClAK0J.aqWrOan../ERthTgTNlCiQreNZDGfdu');
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `bio` text,
  `profile_pic` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES 
(1,'Kaitlyn Cornish','kaitlyn1979@icloud.com','$2b$10$Igwjj35.rOZRk/ZjcBrzn.ZrzKdplHvgJuGCBUjRvKJTrj0qz9eWq','Welcome to my page!\n',NULL),
(2,'Hudson Ahmann','hudsonahmann@wsu.edu','$2b$10$0LsZi4MTX/D5C2utuQRG7eJny7ZX89VW/vO3j7/y9xAQDq8.BXDuS',NULL,NULL),
(3,'Gabe Ahmann','gabe.ahmann@wsu.edu','$2b$10$c7IUpbPWgjt1d4GuJsTWyO27tKPgmF0kqDNMzjzE46dnCuzNBMOxC',NULL,NULL),
(4,'Kaitlyn Cornish','cornishk36@gmail.com','$2b$10$xx5.FOKmypNKwKqNNj2QWuIERXgtrwgQrt.R1q0.5iQpLoNYHrKWi',NULL,NULL);
UNLOCK TABLES;

--
-- Table structure for table `challenges`
--

DROP TABLE IF EXISTS `challenges`;
CREATE TABLE `challenges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `difficulty` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `challenges` WRITE;
INSERT INTO `challenges` VALUES 
(1,'30 Day Step Challenge','Walk 10k steps daily','Easy','2026-04-01','2026-04-30'),
(2,'Weekly Strength Training','Lift 3x per week','Medium','2026-04-10','2026-05-10'),
(3,'HIIT Burn Program','High intensity workouts','Hard','2026-04-15','2026-05-15');
UNLOCK TABLES;

--
-- Table structure for table `challenge_participants`
--

DROP TABLE IF EXISTS `challenge_participants`;
CREATE TABLE `challenge_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `challenge_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `challenge_participants` WRITE;
INSERT INTO `challenge_participants` VALUES (7,1,1),(9,1,2),(10,1,3);
UNLOCK TABLES;

--
-- Table structure for table `workouts`
--

DROP TABLE IF EXISTS `workouts`;
CREATE TABLE `workouts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `calories` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `workouts` WRITE;
INSERT INTO `workouts` VALUES 
(1,1,'HIIT',7,52,'2026-04-15','2026-04-15 19:39:09'),
(2,1,'Running',3,4,'2026-04-15','2026-04-15 20:20:05'),
(3,1,'Running',12,60,'2026-04-16','2026-04-16 00:34:22'),
(4,1,'Running',3,24,'2026-04-18','2026-04-18 00:04:43');
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `posts` WRITE;
INSERT INTO `posts` VALUES (1,1,'Just finished a 3 mile run! ?','2026-04-15 18:37:52'),(2,1,'Leg day complete ?','2026-04-15 18:37:52'),(3,1,'Feeling strong this week!','2026-04-15 18:37:52'),(4,1,'Completed a 7 min HIIT workout ?','2026-04-15 19:39:09'),(5,1,'Completed a 3 min Running workout ?','2026-04-15 20:20:05'),(6,1,'Completed a 12 min Running workout ?','2026-04-16 00:34:22'),(7,1,'Completed a 3 min Running workout ?','2026-04-18 00:04:43');
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `comments` WRITE;
INSERT INTO `comments` VALUES (3,1,1,'YAYY!','2026-04-15 19:04:10'),(4,1,6,'Yay!','2026-04-16 00:34:54'),(5,1,7,'test','2026-04-18 00:04:56');
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `likes` WRITE;
INSERT INTO `likes` VALUES (10,1,7);
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('Requested','Refunded','Denied') DEFAULT 'Requested',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `purchases` WRITE;
INSERT INTO `purchases` (user_id, amount, status) VALUES 
(1, 29.99, 'Requested'),
(2, 45.00, 'Requested'),
(3, 15.50, 'Requested');
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reported_user` varchar(100) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('Pending','Resolved') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `reports` WRITE;
INSERT INTO `reports` (reported_user, reason) VALUES 
('Kaitlyn Cornish','Spamming comments'),
('Hudson Ahmann','Inappropriate bio');
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `system_settings` WRITE;
INSERT INTO `system_settings` VALUES ('site_name','Workout Buddy');
UNLOCK TABLES;

--
-- Final Metadata Cleanup
--

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
