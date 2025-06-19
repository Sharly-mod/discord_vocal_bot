// Configuration des animations
const ANIMATION_CONFIG = {
  confetti: {
    levelUp: { particleCount: 150, spread: 100, colors: ['#FFD700', '#FFA500', '#FF4500'] },
    perfect: { particleCount: 80, spread: 60, colors: ['#00FFFF', '#FF00FF', '#FFFF00'] },
    highScore: { particleCount: 200, spread: 160, colors: ['#FFD700', '#C0C0C0', '#CD7F32'] },
    gameOver: { particleCount: 50, spread: 70, colors: ['#FF6B6B', '#4ECDC4', '#FFD166'] },
    default: { particleCount: 100, spread: 70, colors: ['#FF6B6B', '#4ECDC4', '#FFD166', '#FF9F1C'] }
  },
  durations: {
    fade: 300,
    bounce: 500,
    shake: 500,
    pulse: 300
  }
};

// Effets de confettis
function createConfetti(canvas, type) {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  canvas.width = Math.min(window.innerWidth, 1200);
  canvas.height = Math.min(window.innerHeight, 800);
  
  const config = ANIMATION_CONFIG.confetti[type] || ANIMATION_CONFIG.confetti.default;
  const particles = [];
  
  for (let i = 0; i < config.particleCount; i++) {
    particles.push({
      x: 0.5 * canvas.width,
      y: 0.7 * canvas.height,
      radius: Math.random() * 4 + 1,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * config.spread / 10,
        y: (Math.random() - 0.5) * config.spread / 10 - 3
      },
      gravity: 0.1,
      opacity: 1
    });
  }
  
  const startTime = performance.now();
  const duration = 3000;
  
  function animate(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = elapsed / duration;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let particlesAlive = false;
    
    particles.forEach(particle => {
      if (particle.opacity <= 0) return;
      
      particlesAlive = true;
      particle.velocity.y += particle.gravity;
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.opacity = 1 - progress;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
    
    if (particlesAlive && elapsed < duration) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  requestAnimationFrame(animate);
}

// Effets de cuisson
function showCookingEffects(show = true) {
  const effects = document.querySelectorAll('.sizzle-effect');
  effects.forEach(effect => {
    effect.style.display = show ? 'block' : 'none';
  });
}

// Animation de rebond
function bounceElement(element) {
  if (!element) return;
  
  const originalClasses = element.className;
  element.classList.add('bounce-animation');
  
  setTimeout(() => {
    element.className = originalClasses;
  }, ANIMATION_CONFIG.durations.bounce);
}

// Fondu entrant
function fadeInElement(element, duration = ANIMATION_CONFIG.durations.fade) {
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

// Fondu sortant
function fadeOutElement(element, duration = ANIMATION_CONFIG.durations.fade) {
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

// Animation de secousse
function shakeElement(element, intensity = 5, duration = ANIMATION_CONFIG.durations.shake) {
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

// Animation de pulsation
function pulseElement(element, scale = 1.1, duration = ANIMATION_CONFIG.durations.pulse) {
  if (!element) return;
  
  const originalTransform = element.style.transform || '';
  let start = null;
  
  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    
    if (progress < duration / 2) {
      const currentScale = 1 + (scale - 1) * (progress / (duration / 2));
      element.style.transform = `scale(${currentScale}) ${originalTransform}`;
      requestAnimationFrame(animate);
    } else if (progress < duration) {
      const currentScale = scale - (scale - 1) * ((progress - duration / 2) / (duration / 2));
      element.style.transform = `scale(${currentScale}) ${originalTransform}`;
      requestAnimationFrame(animate);
    } else {
      element.style.transform = originalTransform;
    }
  }
  
  requestAnimationFrame(animate);
}