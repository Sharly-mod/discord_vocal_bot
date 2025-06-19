// Fonctions pour les animations et effets visuels

// Fonction pour créer un effet de confettis
function createConfetti(canvas, type) {
  if (!canvas) return;
  
  // Créer un contexte de dessin
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Ajuster la taille du canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Paramètres des confettis en fonction du type
  let particleCount, colors, spread, origin;
  
  switch (type) {
    case 'levelUp':
      particleCount = 150;
      spread = 100;
      origin = { x: 0.5, y: 0.7 };
      colors = ['#FFD700', '#FFA500', '#FF4500'];
      break;
    case 'perfect':
      particleCount = 80;
      spread = 60;
      origin = { x: 0.5, y: 0.7 };
      colors = ['#00FFFF', '#FF00FF', '#FFFF00'];
      break;
    case 'highScore':
      particleCount = 200;
      spread = 160;
      origin = { x: 0.5, y: 0.7 };
      colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
      break;
    case 'gameOver':
      particleCount = 50;
      spread = 70;
      origin = { x: 0.5, y: 0.7 };
      colors = ['#FF6B6B', '#4ECDC4', '#FFD166'];
      break;
    default:
      particleCount = 100;
      spread = 70;
      origin = { x: 0.5, y: 0.7 };
      colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#FF9F1C'];
  }
  
  // Créer les particules
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: origin.x * canvas.width,
      y: origin.y * canvas.height,
      radius: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * spread / 10,
        y: (Math.random() - 0.5) * spread / 10 - 3
      },
      gravity: 0.1,
      opacity: 1
    });
  }
  
  // Animer les particules
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let particlesRemaining = false;
    
    particles.forEach(particle => {
      if (particle.opacity <= 0) return;
      
      particlesRemaining = true;
      
      // Appliquer la gravité
      particle.velocity.y += particle.gravity;
      
      // Mettre à jour la position
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      
      // Réduire l'opacité
      particle.opacity -= 0.01;
      
      // Dessiner la particule
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
    
    if (particlesRemaining) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  animate();
}

// Fonction pour afficher les effets de cuisson
function showCookingEffects(show = true) {
  const effects = document.querySelectorAll('.sizzle-effect');
  effects.forEach(effect => {
    effect.style.display = show ? 'block' : 'none';
  });
}

// Fonction pour animer un élément avec un effet de rebond
function bounceElement(element) {
  if (!element) return;
  
  // Sauvegarder les classes actuelles
  const originalClasses = element.className;
  
  // Ajouter la classe d'animation
  element.classList.add('bounce-animation');
  
  // Supprimer la classe après l'animation
  setTimeout(() => {
    element.className = originalClasses;
  }, 500);
}

// Fonction pour faire apparaître un élément avec une animation de fondu
function fadeInElement(element, duration = 300) {
  if (!element) return;
  
  element.style.opacity = '0';
  element.style.display = 'block';
  
  let start = null;
  
  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const opacity = Math.min(progress / duration, 1);
    
    element.style.opacity = opacity;
    
    if (progress < duration) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

// Fonction pour faire disparaître un élément avec une animation de fondu
function fadeOutElement(element, duration = 300) {
  if (!element) return Promise.resolve();
  
  return new Promise(resolve => {
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.max(1 - progress / duration, 0);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        resolve();
      }
    }
    
    requestAnimationFrame(animate);
  });
}

// Fonction pour animer un élément avec un effet de secousse
function shakeElement(element, intensity = 5, duration = 500) {
  if (!element) return;
  
  const originalPosition = element.style.transform || '';
  let start = null;
  
  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    
    if (progress < duration) {
      const x = (Math.random() - 0.5) * intensity;
      const y = (Math.random() - 0.5) * intensity;
      element.style.transform = `translate(${x}px, ${y}px) ${originalPosition}`;
      requestAnimationFrame(animate);
    } else {
      element.style.transform = originalPosition;
    }
  }
  
  requestAnimationFrame(animate);
}

// Fonction pour animer un élément avec un effet de pulsation
function pulseElement(element, scale = 1.1, duration = 300) {
  if (!element) return;
  
  const originalTransform = element.style.transform || '';
  let start = null;
  
  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    
    if (progress < duration / 2) {
      // Phase d'agrandissement
      const currentScale = 1 + (scale - 1) * (progress / (duration / 2));
      element.style.transform = `scale(${currentScale}) ${originalTransform}`;
      requestAnimationFrame(animate);
    } else if (progress < duration) {
      // Phase de rétrécissement
      const currentScale = scale - (scale - 1) * ((progress - duration / 2) / (duration / 2));
      element.style.transform = `scale(${currentScale}) ${originalTransform}`;
      requestAnimationFrame(animate);
    } else {
      element.style.transform = originalTransform;
    }
  }
  
  requestAnimationFrame(animate);
}