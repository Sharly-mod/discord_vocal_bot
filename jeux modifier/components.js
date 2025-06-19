// Fonctions utilitaires pour créer et manipuler les composants du jeu

// 1. Fonction pour créer un élément à partir d'un template
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

// 2. Gestion des erreurs d'images
function handleMissingImage(imgElement, fallbackSrc = 'images/placeholder-food.png') {
    imgElement.onerror = () => {
        imgElement.src = fallbackSrc;
        imgElement.alt = 'Image non disponible';
    };
}

// 3. Fonction pour créer l'écran de démarrage
function createStartScreen(highScore, onStart) {
    return createElementFromTemplate('start-screen-template', (element) => {
        // Mettre à jour le meilleur score
        if (highScore > 0) {
            const highScoreValue = element.querySelector('.high-score-value');
            if (highScoreValue) highScoreValue.textContent = highScore;
            element.querySelector('.high-score-container').style.display = 'block';
        } else {
            element.querySelector('.high-score-container').style.display = 'none';
        }

        // Gestion de la mascotte
        const mascotImg = element.querySelector('.cooking-mascot img');
        if (mascotImg) {
            mascotImg.alt = 'Mascotte de cuisine';
            handleMissingImage(mascotImg);
            mascotImg.classList.add('float-animation');
        }

        // Bouton de démarrage
        const startButton = element.querySelector('.start-button');
        if (startButton) {
            startButton.addEventListener('click', onStart);
        }
    });
}

// 4. Fonction pour créer l'écran de fin de jeu
function createGameOverScreen(score, highScore, level, onRestart) {
    return createElementFromTemplate('game-over-template', (element) => {
        element.querySelector('.score-value').textContent = score;
        element.querySelector('.level-value').textContent = level;

        // Afficher nouveau record si applicable
        const newHighScoreElement = element.querySelector('.new-high-score');
        newHighScoreElement.style.display = score >= highScore ? 'block' : 'none';

        // Gestion mascotte
        const mascotImg = element.querySelector('.game-over-mascot img');
        if (mascotImg) {
            mascotImg.alt = 'Mascotte de cuisine';
            handleMissingImage(mascotImg);
        }

        // Bouton recommencer
        const restartButton = element.querySelector('.restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', onRestart);
        }
    });
}

// 5. Fonction pour créer l'écran de pause
function createPauseScreen(score, onResume, onMute, onQuit, isMuted) {
    return createElementFromTemplate('pause-screen-template', (element) => {
        element.querySelector('.current-score').textContent = score;

        // Boutons
        const resumeButton = element.querySelector('.resume-button');
        if (resumeButton) resumeButton.addEventListener('click', onResume);

        const muteButton = element.querySelector('.mute-button');
        if (muteButton) {
            muteButton.textContent = isMuted ? 'Activer le son' : 'Couper le son';
            muteButton.addEventListener('click', onMute);
        }

        const quitButton = element.querySelector('.quit-button');
        if (quitButton) quitButton.addEventListener('click', onQuit);
    });
}

// 6. Fonction pour créer l'interface de jeu
function createGameUI(onMute, isMuted) {
    return createElementFromTemplate('game-ui-template', (element) => {
        // Bouton mute
        const muteButton = element.querySelector('.mute-button');
        if (muteButton) {
            muteButton.querySelector('.volume-icon').textContent = isMuted ? '🔇' : '🔊';
            muteButton.addEventListener('click', onMute);
        }

        // Initialisation des éléments
        element.querySelector('.combo-text').style.display = 'none';
        element.querySelector('.tutorial-overlay').style.display = 'none';

        // Gestion mascotte
        const mascotImg = element.querySelector('.mascot-container img');
        if (mascotImg) {
            mascotImg.alt = 'Mascotte de cuisine';
            handleMissingImage(mascotImg);
        }
    });
}

// 7. Fonction pour créer un client
function createCustomer(order, timeLeft, totalTime) {
    return createElementFromTemplate('customer-template', (element) => {
                // Détails de la commande
                const foodEmoji = getFoodEmoji(order.foodType);
                element.querySelector('.food-emoji').textContent = foodEmoji;
                element.querySelector('.recipe').textContent = order.recipe;

                // Liste des ingrédients
                const ingredientsList = element.querySelector('.ingredients');
                order.ingredients.forEach((ingredient, index) => {
                            const li = document.createElement('li');
                            li.className = 'ingredient-item';
                            const ingredientData = foodItems.find(item => item.name === ingredient);
                            const emoji = ingredientData ? .emoji || '';
                            li.innerHTML = `
        <span class="ingredient-number">${index + 1}</span>
        ${emoji ? `<span class="ingredient-emoji">${emoji}</span>` : ''}
        ${ingredient}
      `;
      ingredientsList.appendChild(li);
});
      
      // Demande spéciale
      const specialRequestElement = element.querySelector('.special-request');
      if (order.specialRequest) {
        specialRequestElement.style.display = 'block';
        specialRequestElement.querySelector('.request-text').textContent = order.specialRequest;
      } else {
        specialRequestElement.style.display = 'none';
      }
      
      // Minuteur
      const timePercentage = (timeLeft / totalTime) * 100;
      element.querySelector('.time-left').textContent = `${timeLeft}s restants`;
      const progressBar = element.querySelector('.progress');
      progressBar.style.width = `${timePercentage}%`;
      progressBar.style.backgroundColor = 
        timePercentage > 60 ? '#22c55e' : 
        timePercentage > 30 ? '#f59e0b' : '#ef4444';
      
      // Masquer le statut initial
      element.querySelector('.order-status').style.display = 'none';
      
      // Image du client
      const characterImage = element.querySelector('.character-image');
      characterImage.src = order.customerImage;
      characterImage.alt = `Client: ${order.customerName}`;
      handleMissingImage(characterImage);
      
      element.querySelector('.customer-name p').textContent = order.customerName;
    });
  }
  
  // 8. Mettre à jour l'état du client après commande
  function updateCustomerOrderCompleted(customerElement, order) {
    customerElement.querySelector('.order-details').style.display = 'none';
    customerElement.querySelector('.ingredients-list').style.display = 'none';
    customerElement.querySelector('.special-request').style.display = 'none';
    customerElement.querySelector('.timer-container').style.display = 'none';
    
    const speechBubble = customerElement.querySelector('.speech-bubble');
    const orderStatus = customerElement.querySelector('.order-status');
    
    if (order.correct) {
      speechBubble.classList.add('correct');
      orderStatus.classList.add('correct');
    } else {
      speechBubble.classList.add('incorrect');
      orderStatus.classList.add('incorrect');
    }
    
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
    
    const emojiReaction = customerElement.querySelector('.emoji-reaction');
    emojiReaction.textContent = order.correct ? 
      (order.satisfaction >= 90 ? "😍" : "😊") : 
      (order.satisfaction >= 40 ? "😐" : "😠");
    emojiReaction.style.display = 'block';
  }
  
  // 9. Fonction pour créer la zone de préparation
  function createFoodPrep(foodType, recipe, selectedIngredients, toggleIngredient, submitOrder, specialRequest) {
    return createElementFromTemplate('food-prep-template', (element) => {
      element.querySelector('.recipe-name').textContent = recipe;
      element.querySelector('.food-emoji').textContent = getFoodEmoji(foodType);
      
      const specialRequestElement = element.querySelector('.special-request');
      if (specialRequest) {
        specialRequestElement.textContent = specialRequest;
        specialRequestElement.style.display = 'inline-block';
      } else {
        specialRequestElement.style.display = 'none';
      }
      
      // Onglets d'ingrédients
      const tabTriggers = element.querySelectorAll('.tab-trigger');
      const tabContents = element.querySelectorAll('.tab-content');
      
      tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          tabTriggers.forEach(t => t.classList.remove('active'));
          tabContents.forEach(c => c.classList.remove('active'));
          
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
      
      // Bouton de soumission
      const serveButton = element.querySelector('.serve-button');
      serveButton.addEventListener('click', submitOrder);
    });
  }
  
  // 10. Remplir une grille d'ingrédients
  function fillIngredientsGrid(gridElement, category, foodType, selectedIngredients, toggleIngredient) {
    gridElement.innerHTML = '';
    
    const ingredients = foodItems.filter(item => 
      item.category === category && (item.type === foodType || item.type === 'common')
    );
    
    ingredients.forEach(ingredient => {
      const button = createElementFromTemplate('ingredient-button-template', (btn) => {
        btn.querySelector('.ingredient-emoji').textContent = ingredient.emoji;
        btn.querySelector('.ingredient-name').textContent = ingredient.name;
        
        if (selectedIngredients.includes(ingredient.name)) {
          btn.classList.add('selected');
        }
        
        btn.addEventListener('click', () => toggleIngredient(ingredient.name));
      });
      
      gridElement.appendChild(button);
    });
  }
  
  // 11. Mettre à jour la liste des ingrédients sélectionnés
  function updateSelectedIngredientsList(listElement, selectedIngredients, toggleIngredient) {
    listElement.innerHTML = '';
    
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
    
    selectedIngredients.forEach(ingredientName => {
      const ingredientData = foodItems.find(item => item.name === ingredientName);
      const emoji = ingredientData ? ingredientData.emoji : '';
      
      const selectedIngredient = createElementFromTemplate('selected-ingredient-template', (element) => {
        element.querySelector('.ingredient-emoji').textContent = emoji;
        element.querySelector('.ingredient-name').textContent = ingredientName;
        element.querySelector('.remove-ingredient').addEventListener('click', () => toggleIngredient(ingredientName));
      });
      
      listElement.appendChild(selectedIngredient);
    });
  }
  
  // 12. Obtenir l'emoji correspondant au type de nourriture
  function getFoodEmoji(foodType) {
    switch (foodType) {
      case 'ramen': return '🍜';
      case 'pizza': return '🍕';
      case 'burger': return '🍔';
      case 'sushi': return '🍣';
      case 'curry': return '🍛';
      default: return '🍽️';
    }
  }
  
  // 13. Mettre à jour l'interface utilisateur
  function updateGameUI(gameState) {
    const gameUI = document.querySelector('.game-ui');
    if (!gameUI) return;
    
    gameUI.querySelector('.level-value').textContent = gameState.level;
    gameUI.querySelector('.score-value').textContent = gameState.score;
    
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    gameUI.querySelector('.time-value').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const comboText = gameUI.querySelector('.combo-text');
    if (gameState.streak >= 2) {
      comboText.style.display = 'block';
      comboText.querySelector('.combo-value').textContent = gameState.streak;
      comboText.querySelector('.multiplier-value').textContent = gameState.comboMultiplier.toFixed(1);
    } else {
      comboText.style.display = 'none';
    }
    
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
  
  // 14. Afficher un message de la mascotte
  function showMascotMessage(message, mood) {
    const mascotContainer = document.querySelector('.mascot-container');
    if (!mascotContainer) return;
    
    const mascotImage = mascotContainer.querySelector('.cooking-mascot img');
    const messageElement = mascotContainer.querySelector('.mascot-message');
    
    mascotImage.className = '';
    if (mood === 'happy') {
      mascotImage.classList.add('float-animation');
    } else if (mood === 'excited') {
      mascotImage.classList.add('wiggle-animation');
    }
    
    if (message) {
      messageElement.querySelector('p').textContent = message;
      messageElement.style.display = 'block';
      
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 5000);
    } else {
      messageElement.style.display = 'none';
    }
  }
  
  // 15. Afficher le tutoriel
  function showTutorial(onComplete) {
    const tutorialOverlay = document.querySelector('.tutorial-overlay');
    if (!tutorialOverlay) return;
    
    tutorialOverlay.style.display = 'flex';
    let currentStep = 0;
    const totalSteps = 4;
    
    // Initialize all steps
    const steps = tutorialOverlay.querySelectorAll('.tutorial-step');
    steps.forEach(step => step.classList.remove('active'));
    steps[0].classList.add('active');
    
    const prevButton = tutorialOverlay.querySelector('.tutorial-prev-button');
    const nextButton = tutorialOverlay.querySelector('.tutorial-next-button');
    const startButton = tutorialOverlay.querySelector('.tutorial-start-button');
    
    // Update button states initially
    updateButtons();
    
    // Add click handlers
    prevButton.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showTutorialStep(currentStep);
            updateButtons();
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            showTutorialStep(currentStep);
            updateButtons();
        }
    });
    
    startButton.addEventListener('click', () => {
        tutorialOverlay.style.display = 'none';
        if (onComplete) onComplete();
    });
    
    function showTutorialStep(step) {
        steps.forEach(s => s.classList.remove('active'));
        steps[step].classList.add('active');
    }
    
    function updateButtons() {
        prevButton.disabled = currentStep === 0;
        
        if (currentStep === totalSteps - 1) {
            nextButton.style.display = 'none';
            startButton.style.display = 'block';
        } else {
            nextButton.style.display = 'block';
            startButton.style.display = 'none';
        }
    }
}