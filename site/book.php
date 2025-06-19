<?php
require 'config.php';
$stmt = $pdo->query("SELECT * FROM Books");
$books = $stmt->fetchAll();
include 'navbar.php';
?>

<h2>Liste des livres</h2>
<ul>
<?php foreach ($books as $book): ?>
    <li>
        <a href="book_details.php?id=<?= $book['id'] ?>">
            <?= $book['title'] ?> (<?= $book['status'] ?>)
        </a>
    </li>
<?php endforeach; ?>
</ul>