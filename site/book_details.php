<?php
session_start();
require 'config.php';
$bookId = $_GET['id'];

$stmt = $pdo->prepare("SELECT * FROM Books WHERE id = ?");
$stmt->execute([$bookId]);
$book = $stmt->fetch();

$stmt2 = $pdo->prepare("SELECT A.first_name, A.last_name FROM Authors A 
                        JOIN Book_Author BA ON A.id = BA.author_id WHERE BA.book_id = ?");
$stmt2->execute([$bookId]);
$authors = $stmt2->fetchAll();
include 'navbar.php';
?>

<h2><?= $book['title'] ?></h2>
<p><?= $book['description'] ?></p>
<p>Status : <?= $book['status'] ?></p>
<p>Auteurs : 
<?php foreach ($authors as $a) echo $a['first_name'] . ' ' . $a['last_name'] . ', '; ?>
</p>

<?php if ($book['status'] === 'disponible' && isset($_SESSION['user'])): ?>
    <form method="POST" action="borrow.php">
        <input type="hidden" name="book_id" value="<?= $bookId ?>">
        <button type="submit">Emprunter</button>
    </form>
<?php endif; ?>