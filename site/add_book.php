<?php
session_start();
require 'config.php';

if ($_SESSION['user']['role'] !== 'admin') {
    die("Accès refusé.");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("INSERT INTO Books (title, description, published_year) VALUES (?, ?, ?)");
    $stmt->execute([$_POST['title'], $_POST['description'], $_POST['year']]);
    echo "Livre ajouté.";
}
include 'navbar.php';
?>

<form method="POST">
    <input name="title" placeholder="Titre" required><br>
    <textarea name="description" placeholder="Description"></textarea><br>
    <input name="year" type="number" placeholder="Année de publication"><br>
    <button type="submit">Ajouter</button>
</form>