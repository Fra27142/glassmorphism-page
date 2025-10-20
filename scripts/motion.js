/* ======== MOTION ORCHESTRATION - LIQUID GLASS 2025 ======== */

// Stato globale per sincronizzazione
const MotionState = {
  isBreathing: false,
  breathingNodes: new Set(),
  observers: new Map(),
  rafId: null
};

// Inizializzazione del sistema di movimento
function initMotion() {
  setupBreathingCycle();
  setupScrollAnimations();
  setupHoverEffects();
  setupProgressBars();
  
  console.log('🌊 Liquid Glass Motion System initialized');
}

// ======== CICLO RESPIRO GLOBALE ========
function setupBreathingCycle() {
  const glassNodes = document.querySelectorAll('.glass');
  
  // Registra tutti i nodi glass
  glassNodes.forEach(node => {
    MotionState.breathingNodes.add(node);
  });
  
  // Ciclo "respiro" lento e ipnotico
  function breathingCycle() {
    MotionState.isBreathing = !MotionState.isBreathing;
    
    MotionState.breathingNodes.forEach(node => {
      // Aggiungi un leggero delay casuale per naturalezza
      const delay = Math.random() * 200;
      
      setTimeout(() => {
        if (MotionState.isBreathing) {
          node.classList.add('is-breathing');
        } else {
          node.classList.remove('is-breathing');
        }
      }, delay);
    });
  }
  
  // Avvia il ciclo
  breathingCycle();
  setInterval(breathingCycle, 6500); // 6.5 secondi per ciclo completo
}

// ======== ANIMAZIONI SCROLL ========
function setupScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;
  
  const observerOptions = {
    threshold: [0, 0.25, 0.5, 0.75, 1],
    rootMargin: '-10% 0px -10% 0px'
  };
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const element = entry.target;
      const ratio = entry.intersectionRatio;
      
      // Effetto parallasse sui pannelli glass
      if (element.classList.contains('glass')) {
        const translateY = (1 - ratio) * 20;
        const opacity = Math.max(0.3, ratio);
        
        element.style.setProperty('--scroll-translate', `${translateY}px`);
        element.style.setProperty('--scroll-opacity', opacity);
        
        // Applica transform se il CSS lo supporta
        if (ratio > 0.1) {
          element.style.transform = `translateY(var(--scroll-translate, 0px))`;
          element.style.opacity = `var(--scroll-opacity, 1)`;
        }
      }
    });
  }, observerOptions);
  
  // Osserva tutti gli elementi glass
  document.querySelectorAll('.glass').forEach(el => {
    scrollObserver.observe(el);
  });
  
  MotionState.observers.set('scroll', scrollObserver);
}

// ======== EFFETTI HOVER FLUIDI ========
function setupHoverEffects() {
  document.addEventListener('mousemove', throttle((e) => {
    // Effetto sottile di "attrazione magnetica" sui pannelli glass
    const glassElements = document.querySelectorAll('.glass:hover');
    
    glassElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      
      // Micro-rotazione basata sulla posizione del mouse
      const rotateX = deltaY * 2;
      const rotateY = deltaX * 2;
      
      el.style.setProperty('--mouse-x', deltaX);
      el.style.setProperty('--mouse-y', deltaY);
      el.style.transform = `
        translateY(-2px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
      `;
    });
  }, 16)); // ~60fps
  
  // Reset al mouse leave
  document.addEventListener('mouseleave', () => {
    document.querySelectorAll('.glass').forEach(el => {
      el.style.transform = '';
    });
  });
}

// ======== BARRE DI PROGRESSO ANIMATE ========
function setupProgressBars() {
  const progressBars = document.querySelectorAll('.glass-progress-fill');
  
  // Observer per animare quando entrano in viewport
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetWidth = bar.dataset.width || bar.style.width || '0%';
        
        // Reset e anima
        bar.style.width = '0%';
        bar.style.transition = 'none';
        
        requestAnimationFrame(() => {
          bar.style.transition = 'width 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
          bar.style.width = targetWidth;
        });
        
        progressObserver.unobserve(bar);
      }
    });
  }, {
    threshold: 0.5
  });
  
  progressBars.forEach(bar => {
    // Salva il valore originale
    if (!bar.dataset.width) {
      bar.dataset.width = bar.style.width || '0%';
    }
    progressObserver.observe(bar);
  });
  
  MotionState.observers.set('progress', progressObserver);
}

// ======== UTILITY FUNCTIONS ========

// Throttle per performance
function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// Debounce per eventi resize
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Easing personalizzato per animazioni fluide
function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
}

// ======== GESTIONE RESIZE E CLEANUP ========
function handleResize() {
  // Re-calcola posizioni per animazioni scroll
  if (MotionState.observers.has('scroll')) {
    // Trigger re-observation
    document.querySelectorAll('.glass').forEach(el => {
      el.style.transform = '';
      el.style.opacity = '';
    });
  }
}

// Cleanup per performance
function cleanup() {
  MotionState.observers.forEach(observer => {
    observer.disconnect();
  });
  MotionState.observers.clear();
  MotionState.breathingNodes.clear();
  
  if (MotionState.rafId) {
    cancelAnimationFrame(MotionState.rafId);
  }
}

// ======== AUTO-INIT ========

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion);
} else {
  initMotion();
}

// Gestisci resize
window.addEventListener('resize', debounce(handleResize, 250));

// Cleanup su page unload
window.addEventListener('beforeunload', cleanup);

// Pausa animazioni quando la tab non è visibile (performance)
document.addEventListener('visibilitychange', () => {
  const isHidden = document.hidden;
  
  document.querySelectorAll('.glass').forEach(el => {
    if (isHidden) {
      el.style.animationPlayState = 'paused';
    } else {
      el.style.animationPlayState = 'running';
    }
  });
});

// ======== API PUBBLICA ========
window.LiquidGlass = {
  // Aggiungi nuovi elementi al sistema
  addGlassElement: (element) => {
    if (element.classList.contains('glass')) {
      MotionState.breathingNodes.add(element);
      
      if (MotionState.observers.has('scroll')) {
        MotionState.observers.get('scroll').observe(element);
      }
    }
  },
  
  // Rimuovi elementi dal sistema
  removeGlassElement: (element) => {
    MotionState.breathingNodes.delete(element);
    
    MotionState.observers.forEach(observer => {
      observer.unobserve(element);
    });
  },
  
  // Forza un ciclo di respiro
  triggerBreath: () => {
    MotionState.breathingNodes.forEach(node => {
      node.classList.toggle('is-breathing');
    });
  },
  
  // Ottieni stato corrente
  getState: () => ({ ...MotionState })
};