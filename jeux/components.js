// Fonctions utilitaires pour créer et manipuler les composants du jeu

// Fonction pour créer un élément à partir d'un template
function createElementFromTemplate(templateId, setupFn = null) {
    const template = document.getElementById(templateId);
    if (!template) return null;

    const clone = document.importNode(template.content, true);
    const element = clone.firstElementChild;

    if (setupFn && typeof setupFn === 'function') {
        setupFn(element);
    }

    return element;
}

// Fonction pour créer l'écran de démarrage
function createStartScreen(highScore, onStart) {
    return createElementFromTemplate('start-screen-template', (element) => {
        // Mettre à jour le score élevé s'il existe
        if (highScore > 0) {
            const highScoreValue = element.querySelector('.high-score-value');
            if (highScoreValue) highScoreValue.textContent = highScore;
            element.querySelector('.high-score-container').style.display = 'block';
        } else {
            element.querySelector('.high-score-container').style.display = 'none';
        }

        // Ajouter l'événement de clic au bouton de démarrage
        const startButton = element.querySelector('.start-button');
        if (startButton) {
            startButton.addEventListener('click', onStart);
        }

        // Animation de la mascotte
        const mascot = element.querySelector('.cooking-mascot img');
        if (mascot) {
            mascot.classList.add('float-animation');
        }
    });
}

// Fonction pour créer l'écran de fin de jeu
function createGameOverScreen(score, highScore, level, onRestart) {
    return createElementFromTemplate('game-over-template', (element) => {
        // Mettre à jour le score et le niveau
        element.querySelector('.score-value').textContent = score;
        element.querySelector('.level-value').textContent = level;

        // Afficher le nouveau record si applicable
        const newHighScoreElement = element.querySelector('.new-high-score');
        if (score >= highScore) {
            newHighScoreElement.style.display = 'block';
        } else {
            newHighScoreElement.style.display = 'none';
        }

        // Ajouter l'événement de clic au bouton de redémarrage
        const restartButton = element.querySelector('.restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', onRestart);
        }
    });
}

// Fonction pour créer l'écran de pause
function createPauseScreen(score, onResume, onMute, onQuit, isMuted) {
    return createElementFromTemplate('pause-screen-template', (element) => {
        // Mettre à jour le score actuel
        element.querySelector('.current-score').textContent = score;

        // Ajouter les événements aux boutons
        const resumeButton = element.querySelector('.resume-button');
        if (resumeButton) {
            resumeButton.addEventListener('click', onResume);
        }

        const muteButton = element.querySelector('.mute-button');
        if (muteButton) {
            muteButton.textContent = isMuted ? 'Activer le son' : 'Couper le son';
            muteButton.addEventListener('click', onMute);
        }

        const quitButton = element.querySelector('.quit-button');
        if (quitButton) {
            quitButton.addEventListener('click', onQuit);
        }
    });
}

// Fonction pour créer l'interface utilisateur du jeu
function createGameUI(onMute, isMuted) {
    return createElementFromTemplate('game-ui-template', (element) => {
        // Configurer le bouton de sourdine
        const muteButton = element.querySelector('.mute-button');
        if (muteButton) {
            muteButton.querySelector('.volume-icon').textContent = isMuted ? '🔇' : '🔊';
            muteButton.addEventListener('click', onMute);
        }

        // Masquer le combo au début
        element.querySelector('.combo-text').style.display = 'none';

        // Masquer l'overlay du tutoriel au début
        element.querySelector('.tutorial-overlay').style.display = 'none';
    });
}

// Fonction pour créer un client
function createCustomer(order, timeLeft, totalTime) {
    return createElementFromTemplate('customer-template', (element) => {
                // Configurer les détails de la commande
                const foodEmoji = getFoodEmoji(order.foodType);
                element.querySelector('.food-emoji').textContent = foodEmoji;
                element.querySelector('.recipe').textContent = order.recipe;

                // Configurer la liste des ingrédients
                const ingredientsList = element.querySelector('.ingredients');
                order.ingredients.forEach((ingredient, index) => {
                            const li = document.createElement('li');
                            li.className = 'ingredient-item';

                            const ingredientData = foodItems.find(item => item.name === ingredient);
                            const emoji = ingredientData ? ingredientData.emoji : '';

                            li.innerHTML = `
        <span class="ingredient-number">${index + 1}</span>
        ${emoji ? `<span class="ingredient-emoji">${emoji}</span>` : ''}
        ${ingredient}
      `;
      
      ingredientsList.appendChild(li);
    });
    
    // Configurer la demande spéciale si elle existe
    const specialRequestElement = element.querySelector('.special-request');
    if (order.specialRequest) {
      specialRequestElement.style.display = 'block';
      specialRequestElement.querySelector('.request-text').textContent = order.specialRequest;
    } else {
      specialRequestElement.style.display = 'none';
    }
    
    // Configurer le minuteur
    const timePercentage = (timeLeft / totalTime) * 100;
    element.querySelector('.time-left').textContent = `${timeLeft}s restants`;
    const progressBar = element.querySelector('.progress');
    progressBar.style.width = `${timePercentage}%`;
    
    // Définir la couleur de la barre de progression en fonction du temps restant
    if (timePercentage > 60) {
      progressBar.style.backgroundColor = '#22c55e'; // vert
    } else if (timePercentage > 30) {
      progressBar.style.backgroundColor = '#f59e0b'; // jaune
    } else {
      progressBar.style.backgroundColor = '#ef4444'; // rouge
    }
    
    // Masquer le statut de la commande au début
    element.querySelector('.order-status').style.display = 'none';
    
    // Configurer l'image et le nom du client
    const characterImage = element.querySelector('.character-image');
    characterImage.src = order.customerImage;
    characterImage.alt = order.customerName;
    
    element.querySelector('.customer-name p').textContent = order.customerName;
  });
}

// Fonction pour mettre à jour l'état d'un client lorsque la commande est complétée
function updateCustomerOrderCompleted(customerElement, order) {
  // Masquer les détails de la commande et afficher le statut
  customerElement.querySelector('.order-details').style.display = 'none';
  customerElement.querySelector('.ingredients-list').style.display = 'none';
  customerElement.querySelector('.special-request').style.display = 'none';
  customerElement.querySelector('.timer-container').style.display = 'none';
  
  const speechBubble = customerElement.querySelector('.speech-bubble');
  const orderStatus = customerElement.querySelector('.order-status');
  
  // Mettre à jour la classe de la bulle de dialogue en fonction du résultat
  if (order.correct) {
    speechBubble.classList.add('correct');
    orderStatus.classList.add('correct');
  } else {
    speechBubble.classList.add('incorrect');
    orderStatus.classList.add('incorrect');
  }
  
  // Afficher le message approprié en fonction de la satisfaction
  const statusText = orderStatus.querySelector('.status-text');
  if (order.satisfaction >= 90) {
    statusText.textContent = "Parfait! Exactement ce que je voulais!";
  } else if (order.satisfaction >= 70) {
    statusText.textContent = "Merci! C'est bon!";
  } else if (order.satisfaction >= 40) {
    statusText.textContent = "Hmm, pas tout à fait ce que j'attendais...";
  } else {
    statusText.textContent = "Ce n'est pas du tout ce que j'ai commandé!";
  }
  
  orderStatus.style.display = 'block';
  
  // Afficher l'emoji de réaction
  const emojiReaction = customerElement.querySelector('.emoji-reaction');
  if (order.correct) {
    emojiReaction.textContent = order.satisfaction >= 90 ? "😍" : "😊";
  } else {
    emojiReaction.textContent = order.satisfaction >= 40 ? "😐" : "😠";
  }
  emojiReaction.style.display = 'block';
}

// Fonction pour créer la zone de préparation des aliments
function createFoodPrep(foodType, recipe, selectedIngredients, toggleIngredient, submitOrder, specialRequest) {
  return createElementFromTemplate('food-prep-template', (element) => {
    // Configurer les informations de la recette
    element.querySelector('.recipe-name').textContent = recipe;
    element.querySelector('.food-emoji').textContent = getFoodEmoji(foodType);
    
    // Configurer la demande spéciale si elle existe
    const specialRequestElement = element.querySelector('.special-request');
    if (specialRequest) {
      specialRequestElement.textContent = specialRequest;
      specialRequestElement.style.display = 'inline-block';
    } else {
      specialRequestElement.style.display = 'none';
    }
    
    // Configurer les onglets d'ingrédients
    const tabTriggers = element.querySelectorAll('.tab-trigger');
    const tabContents = element.querySelectorAll('.tab-content');
    
    tabTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        // Désactiver tous les onglets
        tabTriggers.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Activer l'onglet sélectionné
        trigger.classList.add('active');
        const tabName = trigger.getAttribute('data-tab');
        element.querySelector(`.tab-content.${tabName}`).classList.add('active');
      });
    });
    
    // Remplir les grilles d'ingrédients
    fillIngredientsGrid(element.querySelector('.base-ingredients'), 'base', foodType, selectedIngredients, toggleIngredient);
    fillIngredientsGrid(element.querySelector('.topping-ingredients'), 'topping', foodType, selectedIngredients, toggleIngredient);
    fillIngredientsGrid(element.querySelector('.sauce-ingredients'), 'sauce', foodType, selectedIngredients, toggleIngredient);
    
    // Mettre à jour la liste des ingrédients sélectionnés
    updateSelectedIngredientsList(element.querySelector('.selected-list'), selectedIngredients, toggleIngredient);
    
    // Configurer le bouton de soumission
    const serveButton = element.querySelector('.serve-button');
    serveButton.addEventListener('click', submitOrder);
  });
}

// Fonction pour remplir une grille d'ingrédients
function fillIngredientsGrid(gridElement, category, foodType, selectedIngredients, toggleIngredient) {
  // Vider la grille
  gridElement.innerHTML = '';
  
  // Filtrer les ingrédients par catégorie et type
  const ingredients = foodItems.filter(item => 
    item.category === category && (item.type === foodType || item.type === 'common')
  );
  
  // Créer un bouton pour chaque ingrédient
  ingredients.forEach(ingredient => {
    const button = createElementFromTemplate('ingredient-button-template', (btn) => {
      btn.querySelector('.ingredient-emoji').textContent = ingredient.emoji;
      btn.querySelector('.ingredient-name').textContent = ingredient.name;
      
      // Vérifier si l'ingrédient est sélectionné
      if (selectedIngredients.includes(ingredient.name)) {
        btn.classList.add('selected');
      }
      
      // Ajouter l'événement de clic
      btn.addEventListener('click', () => toggleIngredient(ingredient.name));
    });
    
    gridElement.appendChild(button);
  });
}

// Fonction pour mettre à jour la liste des ingrédients sélectionnés
function updateSelectedIngredientsList(listElement, selectedIngredients, toggleIngredient) {
  // Vider la liste
  listElement.innerHTML = '';
  
  // Afficher un message si aucun ingrédient n'est sélectionné
  if (selectedIngredients.length === 0) {
    const emptySelection = document.createElement('div');
    emptySelection.className = 'empty-selection';
    emptySelection.innerHTML = `
      <span class="alert-icon">⚠️</span>
      <p>Sélectionnez les ingrédients de la commande du client!</p>
    `;
    listElement.appendChild(emptySelection);
    return;
  }
  
  // Créer un élément pour chaque ingrédient sélectionné
  selectedIngredients.forEach(ingredientName => {
    const ingredientData = foodItems.find(item => item.name === ingredientName);
    const emoji = ingredientData ? ingredientData.emoji : '';
    
    const selectedIngredient = createElementFromTemplate('selected-ingredient-template', (element) => {
      element.querySelector('.ingredient-emoji').textContent = emoji;
      element.querySelector('.ingredient-name').textContent = ingredientName;
      
      // Ajouter l'événement de clic au bouton de suppression
      element.querySelector('.remove-ingredient').addEventListener('click', () => toggleIngredient(ingredientName));
    });
    
    listElement.appendChild(selectedIngredient);
  });
}

// Fonction pour obtenir l'emoji correspondant au type de nourriture
function getFoodEmoji(foodType) {
  switch (foodType) {
    case 'ramen':
      return '🍜';
    case 'pizza':
      return '🍕';
    case 'burger':
      return '🍔';
    case 'sushi':
      return '🍣';
    case 'curry':
      return '🍛';
    default:
      return '🍽️';
  }
}

// Fonction pour mettre à jour l'interface utilisateur du jeu
function updateGameUI(gameState) {
  const gameUI = document.querySelector('.game-ui');
  if (!gameUI) return;
  
  // Mettre à jour le niveau
  gameUI.querySelector('.level-value').textContent = gameState.level;
  
  // Mettre à jour le score
  gameUI.querySelector('.score-value').textContent = gameState.score;
  
  // Mettre à jour le temps
  const minutes = Math.floor(gameState.timeLeft / 60);
  const seconds = gameState.timeLeft % 60;
  gameUI.querySelector('.time-value').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Mettre à jour le combo
  const comboText = gameUI.querySelector('.combo-text');
  if (gameState.streak >= 2) {
    comboText.style.display = 'block';
    comboText.querySelector('.combo-value').textContent = gameState.streak;
    comboText.querySelector('.multiplier-value').textContent = gameState.comboMultiplier.toFixed(1);
  } else {
    comboText.style.display = 'none';
  }
  
  // Mettre à jour les cœurs
  const hearts = gameUI.querySelectorAll('.heart');
  hearts.forEach((heart, index) => {
    if (index < gameState.hearts) {
      heart.classList.add('filled');
      heart.textContent = '❤️';
    } else {
      heart.classList.remove('filled');
      heart.textContent = '♡';
    }
  });
}

// Fonction pour afficher un message de la mascotte
function showMascotMessage(message, mood) {
  const mascotContainer = document.querySelector('.mascot-container');
  if (!mascotContainer) return;
  
  const mascotImage = mascotContainer.querySelector('.cooking-mascot img');
  const messageElement = mascotContainer.querySelector('.mascot-message');
  
  // Définir l'animation en fonction de l'humeur
  mascotImage.className = '';
  if (mood === 'happy') {
    mascotImage.classList.add('float-animation');
  } else if (mood === 'excited') {
    mascotImage.classList.add('wiggle-animation');
  }
  
  // Afficher le message
  if (message) {
    messageElement.querySelector('p').textContent = message;
    messageElement.style.display = 'block';
    
    // Masquer le message après un délai
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  } else {
    messageElement.style.display = 'none';
  }
}

// Fonction pour afficher le tutoriel
function showTutorial(onComplete) {
  const tutorialOverlay = document.querySelector('.tutorial-overlay');
  if (!tutorialOverlay) return;
  
  tutorialOverlay.style.display = 'flex';
  
  let currentStep = 0;
  const totalSteps = 4;
  

  // Fonction pour afficher une étape du tutoriel
  function showTutorialStep(step) {
    // Masquer toutes les étapes
    const steps = tutorialOverlay.querySelectorAll('.tutorial-step');
    steps.forEach(s => s.classList.remove('active'));
    
    // Afficher l'étape actuelle
    tutorialOverlay.querySelector(`.step-${step}`).classList.add('active');
    
    // Mettre à jour les boutons
    prevButton.disabled = step === 0;
    
    if (step === totalSteps - 1) {
      nextButton.style.display = 'none';
      startButton.style.display = 'block';
    } else {
      nextButton.style.display = 'block';
      startButton.style.display = 'none';
    }
  }

    // Afficher la première étape

  
  // Configurer les boutons de navigation
  const prevButton = tutorialOverlay.querySelector('.tutorial-prev-button');
  const nextButton = tutorialOverlay.querySelector('.tutorial-next-button');
  const startButton = tutorialOverlay.querySelector('.tutorial-start-button');
  
  prevButton.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showTutorialStep(currentStep);
    }
  });
  
  nextButton.addEventListener('click', () => {
    if (currentStep < totalSteps - 1) {
      currentStep++;
      showTutorialStep(currentStep);
    }
  });
  
  startButton.addEventListener('click', () => {
    tutorialOverlay.style.display = 'none';
    if (onComplete) onComplete();
  });
  showTutorialStep(currentStep);
}