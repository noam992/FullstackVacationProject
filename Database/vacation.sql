-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 18, 2020 at 04:33 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vacation`
--
CREATE DATABASE IF NOT EXISTS `vacation` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `vacation`;

-- --------------------------------------------------------

--
-- Table structure for table `destination`
--

CREATE TABLE `destination` (
  `destinationId` int(11) NOT NULL,
  `destinationName` varchar(70) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `destination`
--

INSERT INTO `destination` (`destinationId`, `destinationName`) VALUES
(1, 'Tel Aviv'),
(2, 'London'),
(3, 'Paris'),
(4, 'Rome'),
(5, 'Italy'),
(6, 'France');

-- --------------------------------------------------------

--
-- Table structure for table `followvacations`
--

CREATE TABLE `followvacations` (
  `followVacationId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `vacationId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `firstName`, `lastName`, `username`, `password`, `isAdmin`) VALUES
(1, 'tal', 'konja', 'tal', '1234', 0),
(2, 'ora', 'konja', 'ora', '5678', 0),
(3, 'michel', 'konja', 'michel', '1234', 0),
(23, 'saar', 'konja', 'saar', '1234', 1);

-- --------------------------------------------------------

--
-- Table structure for table `vacations`
--

CREATE TABLE `vacations` (
  `vacationId` int(11) NOT NULL,
  `description` varchar(1500) NOT NULL,
  `destinationId` int(11) NOT NULL,
  `img` varchar(70) NOT NULL,
  `startTime` datetime NOT NULL,
  `endTime` datetime NOT NULL,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `vacations`
--

INSERT INTO `vacations` (`vacationId`, `description`, `destinationId`, `img`, `startTime`, `endTime`, `price`) VALUES
(49, 'London is the capital and largest city of England and the United Kingdom. The city stands on the River Thames in the south-east of England, at the head of its 50-mile (80 km) estuary leading to the North Sea, London has been a major settlement for two millennia.', 2, '7e8d8ed8-8c79-472c-b1e8-3427d5ba4726.jpg', '2020-08-17 00:00:00', '2020-08-23 00:00:00', 650),
(50, 'Tel Aviv was founded in 1909 as a Jewish garden suburb of the ancient Mediterranean port of Jaffa (now Yafo), with which it was joined in 1950. By the beginning of the 21st century, the modern city of Tel Aviv had developed into a major economic and cultural centre', 1, 'a50307da-d3b3-4216-9531-1e479f47f20e.jpg', '2020-08-17 00:00:00', '2020-08-23 00:00:00', 650),
(51, 'See our selection of special offers and good deals to make the most of your summer in Paris', 3, 'd57fab5f-c01e-48bf-ac45-b5166e89249b.jpg', '2020-08-24 00:00:00', '2020-08-27 00:00:00', 680),
(52, 'In “Roma,” the Mexican director Alfonso Cuarón uses a large canvas to tell the story of lives that some might think small. A personal epic set in Mexico', 4, '69408641-c65c-4d72-9dd0-ebe42c54a11f.jpg', '2020-08-22 00:00:00', '2020-08-25 00:00:00', 680);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `destination`
--
ALTER TABLE `destination`
  ADD PRIMARY KEY (`destinationId`);

--
-- Indexes for table `followvacations`
--
ALTER TABLE `followvacations`
  ADD PRIMARY KEY (`followVacationId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `vacationId` (`vacationId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `vacations`
--
ALTER TABLE `vacations`
  ADD PRIMARY KEY (`vacationId`),
  ADD KEY `destinationId` (`destinationId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `destination`
--
ALTER TABLE `destination`
  MODIFY `destinationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `followvacations`
--
ALTER TABLE `followvacations`
  MODIFY `followVacationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=143;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `vacations`
--
ALTER TABLE `vacations`
  MODIFY `vacationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `followvacations`
--
ALTER TABLE `followvacations`
  ADD CONSTRAINT `followvacations_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `followvacations_ibfk_2` FOREIGN KEY (`vacationId`) REFERENCES `vacations` (`vacationId`);

--
-- Constraints for table `vacations`
--
ALTER TABLE `vacations`
  ADD CONSTRAINT `vacations_ibfk_1` FOREIGN KEY (`destinationId`) REFERENCES `destination` (`destinationId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
