<?php
session_start();
require 'config.php';

if (!isset($_GET['book_id'])) die("ID de livre manquant.");

$bookId = (int)$_GET['book_id'];
$userId = $_SESSION['user']['id'];

// Vérifier disponibilité
$book = $pdo->query("SELECT * FROM Books WHERE id = $bookId")->fetch();
if ($book['status'] !== 'disponible') die("Livre non disponible.");
include 'navbar.php';
// Emprunt
$pdo->prepare("INSERT INTO Borrows (user_id, book_id) VALUES (?, ?)")->execute([$userId, $bookId]);
$pdo->prepare("UPDATE Books SET status = 'emprunté' WHERE id = ?")->execute([$bookId]);

echo "Livre emprunté.";