<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, 'membre')");
    $stmt->execute([$username, $email, $password]);
    echo "Inscription réussie.";
}
include 'navbar.php';
?>

<form method="POST">
    <input name="username" placeholder="Nom d'utilisateur" required><br>
    <input name="email" type="email" placeholder="Email" required><br>
    <input name="password" type="password" placeholder="Mot de passe" required><br>
    <button type="submit">S'inscrire</button>
</form>