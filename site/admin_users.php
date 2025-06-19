<?php
session_start();
require 'config.php';
if ($_SESSION['user']['role'] !== 'admin') exit("Accès interdit");

$stmt = $pdo->query("SELECT id, first_name, last_name, email, role FROM Users");
$users = $stmt->fetchAll();
include 'navbar.php';
?>

<h2>Liste des utilisateurs</h2>
<table border="1">
    <tr><th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th></tr>
    <?php foreach ($users as $u): ?>
    <tr>
        <td><?= $u['id'] ?></td>
        <td><?= $u['first_name'] . ' ' . $u['last_name'] ?></td>
        <td><?= $u['email'] ?></td>
        <td><?= $u['role'] ?></td>
    </tr>
    <?php endforeach; ?>
</table>
<a href="dashboard.php">Retour</a>