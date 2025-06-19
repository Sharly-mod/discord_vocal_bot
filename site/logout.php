<?php
session_start();
session_destroy();
header('Location: login.php');
include 'navbar.php';