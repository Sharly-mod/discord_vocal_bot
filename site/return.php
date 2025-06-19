<?php
session_start();
require 'config.php';
if (!isset($_SESSION['user'])) header('Location: login.php');

$bookId = $_POST['book_id'];
$userId = $_SESSION['user']['id'];

$stmt = $pdo->prepare("UPDATE Borrows SET return_date = NOW() WHERE user_id = ? AND book_id = ? AND return_date IS NULL");
$stmt->execute([$userId, $bookId]);

$pdo->prepare("UPDATE Books SET status = 'disponible' WHERE id = ?")->execute([$bookId]);

header("Location: dashboard.php");
include 'navbar.php';