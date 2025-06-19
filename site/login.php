<?php
session_start();
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("SELECT * FROM Users WHERE username = ?");
    $stmt->execute([$_POST['username']]);
    $user = $stmt->fetch();

    if ($user && password_verify($_POST['password'], $user['password_hash'])) {
        $_SESSION['user'] = $user;
        echo "Connexion réussie.";
    } else {
        echo "Identifiants invalides.";
    }
}
include 'navbar.php';
?>

<form method="POST">
    <input name="username" placeholder="Nom d'utilisateur" required><br>
    <input name="password" type="password" placeholder="Mot de passe" required><br>
    <button type="submit">Se connecter</button>
</form>