<?php
session_start();
require 'config.php';

$userId = $_SESSION['user']['id'];
$emprunts = $pdo->prepare("
    SELECT B.title, R.borrow_date, R.return_date 
    FROM Borrows R 
    JOIN Books B ON R.book_id = B.id 
    WHERE R.user_id = ?
");
$emprunts->execute([$userId]);
include 'navbar.php';
?>

<h2>Mes emprunts</h2>
<ul>
<?php foreach ($emprunts as $e): ?>
    <li>
        <?= $e['title'] ?> (emprunté le <?= $e['borrow_date'] ?>)
        <form method="POST" action="return.php" style="display:inline">
            <input type="hidden" name="book_id" value="<?= $e['book_id'] ?>">
            <button type="submit">Retourner</button>
        </form>
    </li>
<?php endforeach; ?>
</ul>