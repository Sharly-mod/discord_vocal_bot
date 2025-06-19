<head> <style>
    nav a {
        margin-right: 10px;
        text-decoration: none;
        color: #333;
        font-weight: bold;
    }
    nav a:hover {
        text-decoration: underline;
        color: #007bff;
    }
</style>
</head>
<?php
session_start();
require 'config.php';
if ($_SESSION['user']['role'] !== 'admin') exit("Accès interdit");

// Top 5 livres les plus empruntés
$stmt = $pdo->query("
    SELECT B.title, COUNT(*) AS emprunts
    FROM Borrows BR
    JOIN Books B ON BR.book_id = B.id
    GROUP BY BR.book_id
    ORDER BY emprunts DESC
    LIMIT 5
");
$topBooks = $stmt->fetchAll();
include 'navbar.php';
?>

<h2>Top 5 des livres les plus empruntés</h2>
<ul>
<?php foreach ($topBooks as $book): ?>
    <li><?= $book['title'] ?> (<?= $book['emprunts'] ?> emprunts)</li>
<?php endforeach; ?>
</ul>
<a href="dashboard.php">Retour</a>