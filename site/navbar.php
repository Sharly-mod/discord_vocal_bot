<?php
session_start();
?>

<nav style="background:#eee; padding:10px; margin-bottom:20px;">
    <a href="dashboard.php">Accueil</a> |
    <a href="books.php">Livres</a> |
    
    <?php if (isset($_SESSION['user'])): ?>
        <a href="dashboard.php">Mon compte</a> |
        <?php if ($_SESSION['user']['role'] === 'admin'): ?>
            <a href="add_book.php">Ajouter un livre</a> |
            <a href="admin_users.php">Utilisateurs</a> |
            <a href="stats.php">Statistiques</a> |
        <?php endif; ?>
        <a href="logout.php">Déconnexion</a>
    <?php else: ?>
        <a href="login.php">Connexion</a> |
        <a href="register.php">Inscription</a>
    <?php endif; ?>
</nav>