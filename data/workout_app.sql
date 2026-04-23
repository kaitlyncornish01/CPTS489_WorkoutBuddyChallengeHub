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
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (4,'admin@workoutbuddy.com','$2b$10$zoM9KKLX5o43dRlClAK0J.aqWrOan../ERthTgTNlCiQreNZDGfdu');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `challenge_participants`
--

DROP TABLE IF EXISTS `challenge_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challenge_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `challenge_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challenge_participants`
--

LOCK TABLES `challenge_participants` WRITE;
/*!40000 ALTER TABLE `challenge_participants` DISABLE KEYS */;
INSERT INTO `challenge_participants` VALUES (7,1,1),(9,1,2),(10,1,3);
/*!40000 ALTER TABLE `challenge_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `challenges`
--

DROP TABLE IF EXISTS `challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challenges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `difficulty` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challenges`
--

LOCK TABLES `challenges` WRITE;
/*!40000 ALTER TABLE `challenges` DISABLE KEYS */;
INSERT INTO `challenges` VALUES (1,'30 Day Step Challenge','Walk 10k steps daily','Easy','2026-04-01','2026-04-30'),(2,'Weekly Strength Training','Lift 3x per week','Medium','2026-04-10','2026-05-10'),(3,'HIIT Burn Program','High intensity workouts','Hard','2026-04-15','2026-05-15');
/*!40000 ALTER TABLE `challenges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (3,1,1,'YAYY!','2026-04-15 19:04:10'),(4,1,6,'Yay!','2026-04-16 00:34:54'),(5,1,7,'test','2026-04-18 00:04:56');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (10,1,7);
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,1,'Just finished a 3 mile run! ?','2026-04-15 18:37:52'),(2,1,'Leg day complete ?','2026-04-15 18:37:52'),(3,1,'Feeling strong this week!','2026-04-15 18:37:52'),(4,1,'Completed a 7 min HIIT workout ?','2026-04-15 19:39:09'),(5,1,'Completed a 3 min Running workout ?','2026-04-15 20:20:05'),(6,1,'Completed a 12 min Running workout ?','2026-04-16 00:34:22'),(7,1,'Completed a 3 min Running workout ?','2026-04-18 00:04:43');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainers`
--

DROP TABLE IF EXISTS `trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainers`
--

LOCK TABLES `trainers` WRITE;
/*!40000 ALTER TABLE `trainers` DISABLE KEYS */;
INSERT INTO `trainers` VALUES (1,'trainer@workoutbuddy.com','$2b$10$zoM9KKLX5o43dRlClAK0J.aqWrOan../ERthTgTNlCiQreNZDGfdu');
/*!40000 ALTER TABLE `trainers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Kaitlyn Cornish','kaitlyn1979@icloud.com','$2b$10$Igwjj35.rOZRk/ZjcBrzn.ZrzKdplHvgJuGCBUjRvKJTrj0qz9eWq','Welcome to my page!\n',NULL),(2,'Hudson Ahmann','hudsonahmann@wsu.edu','$2b$10$0LsZi4MTX/D5C2utuQRG7eJny7ZX89VW/vO3j7/y9xAQDq8.BXDuS',NULL,NULL),(3,'Gabe Ahmann','gabe.ahmann@wsu.edu','$2b$10$c7IUpbPWgjt1d4GuJsTWyO27tKPgmF0kqDNMzjzE46dnCuzNBMOxC',NULL,NULL),(4,'Kaitlyn Cornish','cornishk36@gmail.com','$2b$10$xx5.FOKmypNKwKqNNj2QWuIERXgtrwgQrt.R1q0.5iQpLoNYHrKWi',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workouts`
--

DROP TABLE IF EXISTS `workouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workouts`
--

LOCK TABLES `workouts` WRITE;
/*!40000 ALTER TABLE `workouts` DISABLE KEYS */;
INSERT INTO `workouts` VALUES (1,1,'HIIT',7,52,'2026-04-15','2026-04-15 19:39:09'),(2,1,'Running',3,4,'2026-04-15','2026-04-15 20:20:05'),(3,1,'Running',12,60,'2026-04-16','2026-04-16 00:34:22'),(4,1,'Running',3,24,'2026-04-18','2026-04-18 00:04:43');
/*!40000 ALTER TABLE `workouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Trainer-account migration: link trainers to users via role
--

ALTER TABLE `users`
  ADD COLUMN `role` enum('participant','trainer','admin') NOT NULL DEFAULT 'participant' AFTER `password`;

INSERT IGNORE INTO `users` (`name`, `email`, `password`, `role`, `bio`, `profile_pic`)
VALUES ('Placeholder Trainer', 'trainer@workoutbuddy.com', '$2b$10$zoM9KKLX5o43dRlClAK0J.aqWrOan../ERthTgTNlCiQreNZDGfdu', 'trainer', 'Trainer account placeholder', NULL);

ALTER TABLE `trainers`
  ADD COLUMN `user_id` int DEFAULT NULL,
  ADD COLUMN `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE `trainers` t
JOIN `users` u ON u.`email` = t.`email`
SET t.`user_id` = u.`id`
WHERE t.`user_id` IS NULL;

UPDATE `users` u
JOIN `trainers` t ON t.`user_id` = u.`id`
SET u.`role` = 'trainer';

ALTER TABLE `trainers`
  MODIFY COLUMN `user_id` int NOT NULL,
  ADD UNIQUE KEY `uq_trainers_user` (`user_id`),
  ADD CONSTRAINT `fk_trainers_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `trainers`
  DROP INDEX `email`,
  DROP COLUMN `email`,
  DROP COLUMN `password`;

--
-- Table structure for table `trainer_content_posts`
--

DROP TABLE IF EXISTS `trainer_content_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainer_content_posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `trainer_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tcp_trainer_status_updated` (`trainer_id`,`status`,`updated_at`),
  KEY `idx_tcp_public` (`status`,`published_at`),
  CONSTRAINT `fk_tcp_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_tcp_publish_time` CHECK (((`status` = 'draft' and `published_at` is null) or (`status` = 'published' and `published_at` is not null)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trainer_media_assets`
--

DROP TABLE IF EXISTS `trainer_media_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainer_media_assets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `trainer_id` int NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_ext` enum('jpg','png') NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `byte_size` int unsigned NOT NULL,
  `storage_key` varchar(255) NOT NULL,
  `sha256` char(64) NOT NULL,
  `server_scan_status` enum('pending','clean','flagged') NOT NULL DEFAULT 'pending',
  `scan_message` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tma_storage_key` (`storage_key`),
  KEY `idx_tma_trainer_created` (`trainer_id`,`created_at`),
  KEY `idx_tma_scan_status` (`server_scan_status`),
  CONSTRAINT `fk_tma_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_tma_size` CHECK ((`byte_size` <= 10485760))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trainer_content_items`
--

DROP TABLE IF EXISTS `trainer_content_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainer_content_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint unsigned NOT NULL,
  `item_type` enum('image','textbox') NOT NULL,
  `sort_order` smallint unsigned NOT NULL,
  `text_content` varchar(1000) DEFAULT NULL,
  `media_asset_id` bigint unsigned DEFAULT NULL,
  `client_validation_ok` tinyint(1) NOT NULL DEFAULT '0',
  `server_validation_ok` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tci_post_sort` (`post_id`,`sort_order`),
  KEY `idx_tci_post_order` (`post_id`,`sort_order`),
  KEY `idx_tci_media` (`media_asset_id`),
  CONSTRAINT `fk_tci_post` FOREIGN KEY (`post_id`) REFERENCES `trainer_content_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tci_media` FOREIGN KEY (`media_asset_id`) REFERENCES `trainer_media_assets` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Triggers for max 50 content items per post
--

DROP TRIGGER IF EXISTS `trg_tci_limit_items_before_insert`;
DROP TRIGGER IF EXISTS `trg_tci_limit_items_before_update`;

DELIMITER ;;
CREATE TRIGGER `trg_tci_limit_items_before_insert`
BEFORE INSERT ON `trainer_content_items`
FOR EACH ROW
BEGIN
  DECLARE item_count INT;

  IF NEW.`item_type` = 'textbox' THEN
    IF NEW.`text_content` IS NULL OR CHAR_LENGTH(NEW.`text_content`) > 1000 OR NEW.`media_asset_id` IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Textbox items require text_content <= 1000 characters and no media asset';
    END IF;
  ELSEIF NEW.`item_type` = 'image' THEN
    IF NEW.`media_asset_id` IS NULL OR NEW.`text_content` IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Image items require media_asset_id and no text_content';
    END IF;
  END IF;

  SELECT COUNT(*) INTO item_count
  FROM `trainer_content_items`
  WHERE `post_id` = NEW.`post_id`;

  IF item_count >= 50 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Maximum number of content items per post is 50';
  END IF;
END;;

CREATE TRIGGER `trg_tci_limit_items_before_update`
BEFORE UPDATE ON `trainer_content_items`
FOR EACH ROW
BEGIN
  DECLARE item_count INT;

  IF NEW.`item_type` = 'textbox' THEN
    IF NEW.`text_content` IS NULL OR CHAR_LENGTH(NEW.`text_content`) > 1000 OR NEW.`media_asset_id` IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Textbox items require text_content <= 1000 characters and no media asset';
    END IF;
  ELSEIF NEW.`item_type` = 'image' THEN
    IF NEW.`media_asset_id` IS NULL OR NEW.`text_content` IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Image items require media_asset_id and no text_content';
    END IF;
  END IF;

  IF NEW.`post_id` <> OLD.`post_id` THEN
    SELECT COUNT(*) INTO item_count
    FROM `trainer_content_items`
    WHERE `post_id` = NEW.`post_id`;

    IF item_count >= 50 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Maximum number of content items per post is 50';
    END IF;
  END IF;
END;;
DELIMITER ;

--
-- Table structure for table `friend_requests`
--

-- Guarded create for existing databases (non-destructive)
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `friend_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_user_id` int NOT NULL,
  `to_user_id` int NOT NULL,
  `status` enum('pending','denied') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pending_request` (`from_user_id`, `to_user_id`),
  FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `friends`
--

-- Guarded create for existing databases (non-destructive)
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `friends` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id_1` int NOT NULL,
  `user_id_2` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_friendship` (`user_id_1`, `user_id_2`),
  FOREIGN KEY (`user_id_1`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id_2`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `muted_users`
--

-- Guarded create for existing databases (non-destructive)
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `muted_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `muted_user_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mute` (`user_id`, `muted_user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`muted_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Trainer-account migration: link trainers to users via role
--

ALTER TABLE `users`
  ADD COLUMN `role` enum('participant','trainer','admin') NOT NULL DEFAULT 'participant' AFTER `password`;

INSERT IGNORE INTO `users` (`name`, `email`, `password`, `role`, `bio`, `profile_pic`)
VALUES ('Placeholder Trainer', 'trainer@workoutbuddy.com', '$2b$10$zoM9KKLX5o43dRlClAK0J.aqWrOan../ERthTgTNlCiQreNZDGfdu', 'trainer', 'Trainer account placeholder', NULL);

ALTER TABLE `trainers`
  ADD COLUMN `user_id` int DEFAULT NULL,
  ADD COLUMN `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE `trainers` t
JOIN `users` u ON u.`email` = t.`email`
SET t.`user_id` = u.`id`
WHERE t.`user_id` IS NULL;

UPDATE `users` u
JOIN `trainers` t ON t.`user_id` = u.`id`
SET u.`role` = 'trainer';

ALTER TABLE `trainers`
  MODIFY COLUMN `user_id` int NOT NULL,
  ADD UNIQUE KEY `uq_trainers_user` (`user_id`),
  ADD CONSTRAINT `fk_trainers_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `trainers`
  DROP INDEX `email`,
  DROP COLUMN `email`,
  DROP COLUMN `password`;

--
-- Table structure for table `trainer_content_posts`
--

DROP TABLE IF EXISTS `trainer_content_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainer_content_posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `trainer_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tcp_trainer_status_updated` (`trainer_id`,`status`,`updated_at`),
  KEY `idx_tcp_public` (`status`,`published_at`),
  CONSTRAINT `fk_tcp_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_tcp_publish_time` CHECK (((`status` = 'draft' and `published_at` is null) or (`status` = 'published' and `published_at` is not null)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trainer_media_assets`
--

DROP TABLE IF EXISTS `trainer_media_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainer_media_assets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `trainer_id` int NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_ext` enum('jpg','png') NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `byte_size` int unsigned NOT NULL,
  `storage_key` varchar(255) NOT NULL,
  `sha256` char(64) NOT NULL,
  `server_scan_status` enum('pending','clean','flagged') NOT NULL DEFAULT 'pending',
  `scan_message` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tma_storage_key` (`storage_key`),
  KEY `idx_tma_trainer_created` (`trainer_id`,`created_at`),
  KEY `idx_tma_scan_status` (`server_scan_status`),
  CONSTRAINT `fk_tma_trainer` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_tma_size` CHECK ((`byte_size` <= 10485760))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trainer_content_items`
--

DROP TABLE IF EXISTS `trainer_content_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainer_content_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint unsigned NOT NULL,
  `item_type` enum('image','textbox') NOT NULL,
  `sort_order` smallint unsigned NOT NULL,
  `text_content` varchar(1000) DEFAULT NULL,
  `media_asset_id` bigint unsigned DEFAULT NULL,
  `client_validation_ok` tinyint(1) NOT NULL DEFAULT '0',
  `server_validation_ok` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tci_post_sort` (`post_id`,`sort_order`),
  KEY `idx_tci_post_order` (`post_id`,`sort_order`),
  KEY `idx_tci_media` (`media_asset_id`),
  CONSTRAINT `fk_tci_post` FOREIGN KEY (`post_id`) REFERENCES `trainer_content_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tci_media` FOREIGN KEY (`media_asset_id`) REFERENCES `trainer_media_assets` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Triggers for max 50 content items per post
--

DROP TRIGGER IF EXISTS `trg_tci_limit_items_before_insert`;
DROP TRIGGER IF EXISTS `trg_tci_limit_items_before_update`;

DELIMITER ;;
CREATE TRIGGER `trg_tci_limit_items_before_insert`
BEFORE INSERT ON `trainer_content_items`
FOR EACH ROW
BEGIN
  IF NEW.`item_type` = 'textbox' THEN
    IF NEW.`text_content` IS NULL OR CHAR_LENGTH(NEW.`text_content`) > 1000 OR NEW.`media_asset_id` IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Textbox items require text_content <= 1000 characters and no media asset';
    END IF;
  ELSEIF NEW.`item_type` = 'image' THEN
    IF NEW.`media_asset_id` IS NULL OR NEW.`text_content` IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Image items require media_asset_id and no text_content';
    END IF;
  END IF;

  DECLARE item_count INT;
  SELECT COUNT(*) INTO item_count
  FROM `trainer_content_items`
  WHERE `post_id` = NEW.`post_id`;

  IF item_count >= 50 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Maximum number of content items per post is 50';
  END IF;
END;;

CREATE TRIGGER `trg_tci_limit_items_before_update`
BEFORE UPDATE ON `trainer_content_items`
FOR EACH ROW
BEGIN
  IF NEW.`item_type` = 'textbox' THEN
    IF NEW.`text_content` IS NULL OR CHAR_LENGTH(NEW.`text_content`) > 1000 OR NEW.`media_asset_id` IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Textbox items require text_content <= 1000 characters and no media asset';
    END IF;
  ELSEIF NEW.`item_type` = 'image' THEN
    IF NEW.`media_asset_id` IS NULL OR NEW.`text_content` IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Image items require media_asset_id and no text_content';
    END IF;
  END IF;

  DECLARE item_count INT;
  IF NEW.`post_id` <> OLD.`post_id` THEN
    SELECT COUNT(*) INTO item_count
    FROM `trainer_content_items`
    WHERE `post_id` = NEW.`post_id`;

    IF item_count >= 50 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Maximum number of content items per post is 50';
    END IF;
  END IF;
END;;
DELIMITER ;

--
-- Table structure for table `friend_requests`
--

-- Guarded create for existing databases (non-destructive)
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `friend_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_user_id` int NOT NULL,
  `to_user_id` int NOT NULL,
  `status` enum('pending','denied') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pending_request` (`from_user_id`, `to_user_id`),
  FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `friends`
--

-- Guarded create for existing databases (non-destructive)
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `friends` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id_1` int NOT NULL,
  `user_id_2` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_friendship` (`user_id_1`, `user_id_2`),
  FOREIGN KEY (`user_id_1`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id_2`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `muted_users`
--

-- Guarded create for existing databases (non-destructive)
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `muted_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `muted_user_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mute` (`user_id`, `muted_user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`muted_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

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

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21 15:39:28
