// Logique principale du jeu

// État du jeu
const gameState = {
  state: "start", // "start", "playing", "paused", "gameOver"
  score: 0,
  level: 1,
  orders: [],
  currentOrder: null,
  selectedIngredients: [],
  timeLeft: 0,
  muted: false,
  streak: 0,
  highScore: 0,
  hearts: 3,
  comboMultiplier: 1,
  customerQueue: [],
  tutorialComplete: false
};

// Références aux éléments du DOM
const domElements = {
  gameContainer: document.getElementById('game'),
  confettiCanvas: null,
  soundEffect: null,
  backgroundMusic: null
};

// Minuteries
let timerInterval = null;
let gameTimerInterval = null;

// Initialisation du jeu
function initGame() {
  // Charger le meilleur score depuis le stockage local
  const savedHighScore = localStorage.getItem('cookingRushHighScore');
  if (savedHighScore) {
    gameState.highScore = parseInt(savedHighScore);
  }
  
  // Vérifier si le tutoriel a été complété
  gameState.tutorialComplete = localStorage.getItem('cookingRushTutorialComplete') === 'true';
  
  // Afficher l'écran de démarrage
  showStartScreen();
}

// Afficher l'écran de démarrage
function showStartScreen() {
  // Nettoyer le conteneur de jeu
  domElements.gameContainer.innerHTML = '';
  
  // Créer et ajouter l'écran de démarrage
  const startScreen = createStartScreen(gameState.highScore, startGame);
  domElements.gameContainer.appendChild(startScreen);
}

// Démarrer le jeu
function startGame() {
  // Réinitialiser l'état du jeu
  gameState.state = "playing";
  gameState.score = 0;
  gameState.level = 1;
  gameState.streak = 0;
  gameState.hearts = 3;
  gameState.comboMultiplier = 1;
  gameState.orders = [];
  gameState.currentOrder = null;
  gameState.selectedIngredients = [];
  gameState.timeLeft = 0;
  gameState.customerQueue = [];
  
  // Nettoyer le conteneur de jeu
  domElements.gameContainer.innerHTML = '';
  
  // Créer et ajouter l'interface utilisateur du jeu
  const gameUI = createGameUI(toggleMute, gameState.muted);
  domElements.gameContainer.appendChild(gameUI);
  
  // Initialiser les références aux éléments audio
  domElements.confettiCanvas = document.getElementById('confetti-canvas');
  domElements.soundEffect = document.getElementById('sound-effect');
  domElements.backgroundMusic = document.getElementById('background-music');
  
  // Afficher un message de bienvenue
  showMascotMessage("Cuisinons de délicieux plats! Surveillez les commandes des clients!", "excited");
  
  // Générer la file d'attente initiale des clients
  generateCustomerQueue();
  
  // Générer la première commande
  generateNewOrder();
  
  // Jouer le son de démarrage
  playSound("start");
  
  // Jouer la musique de fond
  playBackgroundMusic();
  
  // Afficher le tutoriel pour les nouveaux joueurs
  if (!gameState.tutorialComplete) {
    showTutorial(() => {
      gameState.tutorialComplete = true;
      localStorage.setItem('cookingRushTutorialComplete', 'true');
    });
  }
}

// Générer une file d'attente de clients
function generateCustomerQueue() {
  const newQueue = [];
  const queueSize = Math.min(2 + Math.floor(gameState.level / 2), 4);
  
  for (let i = 0; i < queueSize; i++) {
    newQueue.push(createRandomOrder());
  }
  
  gameState.customerQueue = newQueue;
  
  // Mettre à jour les indicateurs de file d'attente
  updateQueueIndicators();
}

// Mettre à jour les indicateurs de file d'attente
function updateQueueIndicators() {
  const queueIndicatorsContainer = document.querySelector('.customer-queue-indicators');
  if (!queueIndicatorsContainer) return;
  
  // Vider le conteneur
  queueIndicatorsContainer.innerHTML = '';
  
  // Créer un indicateur pour chaque client dans la file d'attente
  gameState.customerQueue.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.className = 'queue-indicator';
    indicator.textContent = index + 1;
    queueIndicatorsContainer.appendChild(indicator);
  });
}

// Créer une commande aléatoire
function createRandomOrder() {
  const foodTypes = ["ramen", "pizza", "burger", "sushi", "curry"];
  const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
  
  // Obtenir une recette aléatoire pour ce type de nourriture
  const availableRecipes = recipes.filter(r => r.type === foodType);
  const selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
  
  // Calculer la limite de temps en fonction du niveau (devient plus court à mesure que le niveau augmente)
  const timeLimit = Math.max(40 - gameState.level * 2, 20);
  
  // Sélectionner une image de personnage aléatoire
  const customerImage = characterImages[Math.floor(Math.random() * characterImages.length)];
  
  // Nom de client aléatoire
  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
  
  // Demandes spéciales (la chance augmente avec le niveau)
  let specialRequest = undefined;
  if (Math.random() < 0.2 + gameState.level * 0.05) {
    specialRequest = specialRequests[Math.floor(Math.random() * specialRequests.length)];
  }
  
  return {
    id: Date.now() + Math.random(),
    customerName,
    customerImage,
    foodType,
    recipe: selectedRecipe.name,
    ingredients: [...selectedRecipe.ingredients],
    timeLimit,
    completed: false,
    correct: null,
    satisfaction: 100,
    specialRequest
  };
}

// Générer une nouvelle commande de client
function generateNewOrder() {
  // S'il y a des commandes dans la file d'attente, utiliser la première
  if (gameState.customerQueue.length > 0) {
    const [nextOrder, ...remainingQueue] = gameState.customerQueue;
    gameState.currentOrder = nextOrder;
    gameState.orders.push(nextOrder);
    gameState.customerQueue = remainingQueue;
    
    // Si la file d'attente est faible, générer plus de clients
    if (remainingQueue.length < 2) {
      gameState.customerQueue.push(createRandomOrder());
    }
    
    gameState.selectedIngredients = [];
    gameState.timeLeft = nextOrder.timeLimit;
    
    // Mettre à jour les indicateurs de file d'attente
    updateQueueIndicators();
    
    // Démarrer le minuteur pour cette commande
    startTimer(nextOrder.timeLimit);
    
    // Réaction de la mascotte
    if (nextOrder.specialRequest) {
      showMascotMessage(`Attention! Ce client a une demande spéciale: ${nextOrder.specialRequest}`, "thinking");
    } else if (Math.random() > 0.7) {
      const messages = [
        `Un ${nextOrder.recipe}! Un de mes préférés!`,
        "N'oubliez pas de travailler rapidement mais soigneusement!",
        `${nextOrder.customerName} a l'air affamé!`,
        "Vous vous débrouillez bien! Continuez comme ça!"
      ];
      showMascotMessage(messages[Math.floor(Math.random() * messages.length)], "happy");
    }
    
    // Jouer le son de nouveau client
    playSound("newCustomer");
    
    // Mettre à jour l'interface utilisateur
    updateGameUI(gameState);
    renderCurrentOrder();
    return;
  }
  
  // Solution de secours: créer une nouvelle commande directement
  const newOrder = createRandomOrder();
  gameState.orders.push(newOrder);
  gameState.currentOrder = newOrder;
  gameState.selectedIngredients = [];
  gameState.timeLeft = newOrder.timeLimit;
  
  // Démarrer le minuteur pour cette commande
  startTimer(newOrder.timeLimit);
  
  // Jouer le son de nouveau client
  playSound("newCustomer");
  
  // Mettre à jour l'interface utilisateur
  updateGameUI(gameState);
  renderCurrentOrder();
}

// Démarrer le minuteur de compte à rebours
function startTimer(seconds) {
  // Effacer le minuteur existant
  if (timerInterval) clearInterval(timerInterval);
  
  gameState.timeLeft = seconds;
  
  timerInterval = setInterval(() => {
    gameState.timeLeft--;
    
    // Mettre à jour l'interface utilisateur
    updateGameUI(gameState);
    updateOrderTimer();
    
    // Jouer un son d'avertissement lorsque le temps est presque écoulé
    if (gameState.timeLeft === 5) {
      playSound("timeWarning");
      showMascotMessage("Dépêchez-vous! Le temps est presque écoulé!", "worried");
    }
    
    // Temps écoulé pour cette commande
    if (gameState.timeLeft <= 0) {
      clearInterval(timerInterval);
      handleOrderComplete(false);
    }
  }, 1000);
}

// Mettre à jour le minuteur de la commande
function updateOrderTimer() {
  if (!gameState.currentOrder) return;
  
  const customerElement = document.querySelector('.current-customer .customer');
  if (!customerElement) return;
  
  const timePercentage = (gameState.timeLeft / gameState.currentOrder.timeLimit) * 100;
  const progressBar = customerElement.querySelector('.progress');
  const timeLeftText = customerElement.querySelector('.time-left');
  
  if (progressBar && timeLeftText) {
    progressBar.style.width = `${timePercentage}%`;
    timeLeftText.textContent = `${gameState.timeLeft}s restants`;
    
    // Mettre à jour la couleur de la barre de progression
    if (timePercentage > 60) {
      progressBar.style.backgroundColor = '#22c55e'; // vert
    } else if (timePercentage > 30) {
      progressBar.style.backgroundColor = '#f59e0b'; // jaune
    } else {
      progressBar.style.backgroundColor = '#ef4444'; // rouge
    }
  }
}

// Gérer la sélection des ingrédients
function toggleIngredient(ingredient) {
  const index = gameState.selectedIngredients.indexOf(ingredient);
  
  if (index === -1) {
    // Ajouter l'ingrédient
    gameState.selectedIngredients.push(ingredient);
    playSound("select");
    showCookingEffects(true);
    
    // Masquer les effets de cuisson après un court délai
    setTimeout(() => {
      showCookingEffects(false);
    }, 500);
  } else {
    // Supprimer l'ingrédient
    gameState.selectedIngredients.splice(index, 1);
  }
  
  // Mettre à jour l'interface utilisateur
  renderFoodPrep();
}

// Soumettre la commande préparée
function submitOrder() {
  if (!gameState.currentOrder) return;
  
  // Vérifier si tous les ingrédients requis sont inclus
  const requiredIngredients = new Set(gameState.currentOrder.ingredients);
  const selectedIngredientsSet = new Set(gameState.selectedIngredients);
  
  let allCorrect = true;
  let satisfaction = 100;
  
  // Vérifier si tous les ingrédients requis sont sélectionnés
  for (const ingredient of requiredIngredients) {
    if (!selectedIngredientsSet.has(ingredient)) {
      allCorrect = false;
      satisfaction -= 25;
    }
  }
  
  // Vérifier si aucun ingrédient supplémentaire n'est sélectionné
  if (gameState.selectedIngredients.length !== gameState.currentOrder.ingredients.length) {
    allCorrect = false;
    satisfaction -= 15 * Math.abs(gameState.selectedIngredients.length - gameState.currentOrder.ingredients.length);
  }
  
  // Vérifier les demandes spéciales (simplifié)
  if (gameState.currentOrder.specialRequest) {
    // Dans un vrai jeu, nous vérifierions chaque demande spéciale
    satisfaction -= 10;
  }
  
  // S'assurer que la satisfaction est entre 0-100
  satisfaction = Math.max(0, Math.min(100, satisfaction));
  
  handleOrderComplete(allCorrect, satisfaction);
}

// Terminer la commande actuelle
function handleOrderComplete(correct, satisfaction = correct ? 100 : 0) {
  if (!gameState.currentOrder) return;
  
  // Mettre à jour le statut de la commande
  gameState.currentOrder.completed = true;
  gameState.currentOrder.correct = correct;
  gameState.currentOrder.satisfaction = satisfaction;
  
  // Mettre à jour l'interface utilisateur de la commande
  const customerElement = document.querySelector('.current-customer .customer');
  if (customerElement) {
    updateCustomerOrderCompleted(customerElement, gameState.currentOrder);
  }
  
  // Mettre à jour le score et les statistiques
  if (correct) {
    // Calculer le bonus en fonction du temps restant et de la satisfaction
    const timeBonus = Math.floor(gameState.timeLeft * 5);
    const levelBonus = gameState.level * 10;
    const satisfactionMultiplier = satisfaction / 100;
    const comboBonus = gameState.streak >= 2 ? gameState.comboMultiplier * 50 : 0;
    const orderPoints = Math.floor((100 + timeBonus + levelBonus + comboBonus) * satisfactionMultiplier);
    
    gameState.score += orderPoints;
    gameState.streak++;
    
    // Mettre à jour le multiplicateur de combo
    if (gameState.streak >= 2) {
      gameState.comboMultiplier = Math.min(gameState.comboMultiplier + 0.5, 3);
      showMascotMessage(`${gameState.streak}x Combo! Continuez comme ça!`, "excited");
    }
    
    // Monter de niveau toutes les 3 commandes réussies
    if (gameState.streak > 0 && (gameState.streak + 1) % 3 === 0) {
      gameState.level++;
      playSound("levelUp");
      createConfetti(domElements.confettiCanvas, "levelUp");
      showMascotMessage(`Niveau supérieur! Vous êtes maintenant niveau ${gameState.level}!`, "excited");
    } else {
      if (satisfaction >= 90) {
        playSound("perfect");
        createConfetti(domElements.confettiCanvas, "perfect");
        showMascotMessage("Plat parfait! Travail incroyable!", "excited");
      } else {
        playSound("success");
        showMascotMessage("Bon travail! Le client est satisfait.", "happy");
      }
    }
  } else {
    gameState.streak = 0;
    gameState.comboMultiplier = 1;
    gameState.hearts--;
    
    showMascotMessage("Oh non! Ce n'était pas tout à fait correct...", "worried");
    
    // Fin du jeu s'il ne reste plus de cœurs
    if (gameState.hearts <= 0) {
      setTimeout(() => endGame(), 1500);
    }
    
    playSound("failure");
  }
  
  // Mettre à jour l'interface utilisateur
  updateGameUI(gameState);
  
  // Effacer le minuteur
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Afficher le résultat brièvement avant le prochain client
  setTimeout(() => {
    // Supprimer la commande terminée de la liste
    const currentCustomer = document.querySelector('.current-customer');
    if (currentCustomer) {
      fadeOutElement(currentCustomer).then(() => {
        currentCustomer.innerHTML = '';
        
        // Générer la commande suivante après un court délai
        setTimeout(() => {
          generateNewOrder();
        }, 500);
      });
    }
  }, 1500);
}

// Terminer le jeu
function endGame() {
  gameState.state = "gameOver";
  
  // Effacer les minuteurs
  if (timerInterval) clearInterval(timerInterval);
  if (gameTimerInterval) clearInterval(gameTimerInterval);
  
  // Arrêter la musique de fond
  stopBackgroundMusic();
  
  // Vérifier le meilleur score
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem('cookingRushHighScore', gameState.score.toString());
    
    // Déclencher des confettis pour le nouveau meilleur score
    createConfetti(domElements.confettiCanvas, "highScore");
    showMascotMessage("Wow! Un nouveau record! Vous êtes un chef incroyable!", "excited");
  } else {
    showMascotMessage("Bon effort! Voulez-vous réessayer?", "thinking");
    createConfetti(domElements.confettiCanvas, "gameOver");
  }
  
  playSound("gameOver");
  
  // Afficher l'écran de fin de jeu
  const gameOverScreen = createGameOverScreen(gameState.score, gameState.highScore, gameState.level, startGame);
  
  // Remplacer le contenu du jeu par l'écran de fin de jeu
  fadeOutElement(document.querySelector('.game-ui')).then(() => {
    domElements.gameContainer.innerHTML = '';
    domElements.gameContainer.appendChild(gameOverScreen);
  });
}

// Mettre en pause le jeu
function togglePause() {
  if (gameState.state === "playing") {
    gameState.state = "paused";
    
    // Arrêter le minuteur
    if (timerInterval) clearInterval(timerInterval);
    
    // Mettre en pause la musique de fond
    if (domElements.backgroundMusic) domElements.backgroundMusic.pause();
    
    // Afficher l'écran de pause
    const pauseScreen = createPauseScreen(
      gameState.score,
      () => togglePause(), // Reprendre
      () => toggleMute(), // Couper/activer le son
      () => showStartScreen(), // Quitter
      gameState.muted
    );
    
    domElements.gameContainer.appendChild(pauseScreen);
  } else if (gameState.state === "paused") {
    gameState.state = "playing";
    
    // Redémarrer le minuteur
    if (gameState.currentOrder) startTimer(gameState.timeLeft);
    
    // Reprendre la musique de fond
    if (!gameState.muted && domElements.backgroundMusic) {
      domElements.backgroundMusic.play().catch(e => console.log("Échec de la reprise de la musique:", e));
    }
    
    // Supprimer l'écran de pause
    const pauseScreen = document.querySelector('.pause-screen');
    if (pauseScreen) {
      pauseScreen.remove();
    }
  }
}

// Couper/activer le son
function toggleMute() {
  gameState.muted = !gameState.muted;
  
  // Mettre à jour l'icône du bouton de sourdine
  const muteButton = document.querySelector('.mute-button');
  if (muteButton) {
    const volumeIcon = muteButton.querySelector('.volume-icon');
    if (volumeIcon) {
      volumeIcon.textContent = gameState.muted ? '🔇' : '🔊';
    }
  }
  
  // Mettre à jour l'état de la musique de fond
  if (gameState.muted) {
    stopBackgroundMusic();
  } else if (gameState.state === "playing") {
    playBackgroundMusic();
  }
}

// Jouer des effets sonores
function playSound(type) {
  if (gameState.muted || !domElements.soundEffect) return;
  
  // Définir la source du son en fonction du type
  switch (type) {
    case "start":
      domElements.soundEffect.src = "sounds/game-start.mp3";
      break;
    case "success":
      domElements.soundEffect.src = "sounds/success.mp3";
      break;
    case "perfect":
      domElements.soundEffect.src = "sounds/perfect.mp3";
      break;
    case "failure":
      domElements.soundEffect.src = "sounds/failure.mp3";
      break;
    case "select":
      domElements.soundEffect.src = "sounds/select.mp3";
      break;
    case "newCustomer":
      domElements.soundEffect.src = "sounds/customer.mp3";
      break;
    case "timeWarning":
      domElements.soundEffect.src = "sounds/time-warning.mp3";
      break;
    case "levelUp":
      domElements.soundEffect.src = "sounds/level-up.mp3";
      break;
    case "gameOver":
      domElements.soundEffect.src = "sounds/game-over.mp3";
      break;
    default:
      return;
  }
  
  domElements.soundEffect.play().catch(e => console.log("Échec de la lecture audio:", e));
}

// Jouer la musique de fond
function playBackgroundMusic() {
  if (gameState.muted || !domElements.backgroundMusic) return;
  
  domElements.backgroundMusic.src = "sounds/cooking-bgm.mp3";
  domElements.backgroundMusic.loop = true;
  domElements.backgroundMusic.volume = 0.4;
  domElements.backgroundMusic.play().catch(e => console.log("Échec de la lecture de la musique de fond:", e));
}

// Arrêter la musique de fond
function stopBackgroundMusic() {
  if (!domElements.backgroundMusic) return;
  
  domElements.backgroundMusic.pause();
  domElements.backgroundMusic.currentTime = 0;
}

// Rendre la commande actuelle
function renderCurrentOrder() {
  if (!gameState.currentOrder) return;
  
  const currentCustomerContainer = document.querySelector('.current-customer');
  if (!currentCustomerContainer) return;
  
  // Vider le conteneur
  currentCustomerContainer.innerHTML = '';
  
  // Créer et ajouter le client
  const customerElement = createCustomer(
    gameState.currentOrder,
    gameState.timeLeft,
    gameState.currentOrder.timeLimit
  );
  
  currentCustomerContainer.appendChild(customerElement);
  
  // Rendre la zone de préparation des aliments
  renderFoodPrep();
}

// Rendre la zone de préparation des aliments
function renderFoodPrep() {
  if (!gameState.currentOrder) return;
  
  const foodPrepArea = document.querySelector('.food-prep-area');
  if (!foodPrepArea) return;
  
  // Vider la zone
  foodPrepArea.innerHTML = '';
  
  // Créer et ajouter la zone de préparation des aliments
  const foodPrepElement = createFoodPrep(
    gameState.currentOrder.foodType,
    gameState.currentOrder.recipe,
    gameState.selectedIngredients,
    toggleIngredient,
    submitOrder,
    gameState.currentOrder.specialRequest
  );
  
  foodPrepArea.appendChild(foodPrepElement);
}

// Gérer les événements clavier
function handleKeyPress(event) {
  // Mettre en pause/reprendre le jeu avec la touche Espace ou Échap
  if ((event.key === ' ' || event.key === 'Escape') && 
      (gameState.state === "playing" || gameState.state === "paused")) {
    togglePause();
  }
}

// Ajouter les écouteurs d'événements
document.addEventListener('keydown', handleKeyPress);
window.addEventListener('resize', () => {
  // Ajuster la taille du canvas de confettis si nécessaire
  if (domElements.confettiCanvas) {
    domElements.confettiCanvas.width = window.innerWidth;
    domElements.confettiCanvas.height = window.innerHeight;
  }
});

// Initialiser le jeu au chargement de la page
window.addEventListener('load', initGame);