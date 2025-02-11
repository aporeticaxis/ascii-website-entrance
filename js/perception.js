/**
 * Perception Entrance Template
 * A minimal implementation of a draggable field alignment entrance mechanism
 */

// Core elements
let container, left, right, enterButton, welcomeMessage, hiddenContent;

// State
let isAligned = false;

// Constants
const SCALE = 0.8;
const DRAG_SCALE = 0.85;
const ALIGNMENT_THRESHOLD = 120;
const BLUR_AMOUNT = "1px";

/* ---------------------------
   1. Initialize Positions
--------------------------- */
function initializePositions() {
  function getRandomPosition() {
    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
    const safeX = vw * 0.3;
    const safeY = vh * 0.3;
    return {
      x: Math.random() * safeX - safeX / 2,
      y: Math.random() * safeY - safeY / 2
    };
  }

  function calculateDistance(pos1, pos2) {
    return Math.hypot(pos1.x - pos2.x, pos1.y - pos2.y);
  }

  function generateValidPositions() {
    const minDistance = Math.min(window.innerWidth, window.innerHeight) * 0.3;
    const maxAttempts = 100;
    let attempts = 0;
    while (attempts < maxAttempts) {
      const pos1 = getRandomPosition();
      const pos2 = getRandomPosition();
      const distance = calculateDistance(pos1, pos2);
      if (distance >= minDistance) {
        return { pos1, pos2 };
      }
      attempts++;
    }
    // Fallback positions with proper offset
    return {
      pos1: { x: -window.innerWidth * 0.2, y: 0 },
      pos2: { x: window.innerWidth * 0.2, y: 0 }
    };
  }

  // Reset transforms first like original
  gsap.set([left, right], {
    clearProps: "all"
  });

  // Center the container
  gsap.set(container, {
    position: "fixed",
    width: "100vw",
    height: "100vh",
    top: 0,
    left: 0
  });

  const { pos1, pos2 } = generateValidPositions();

  // Set initial positions with transforms only
  gsap.set(left, {
    position: "absolute",
    left: "50%",
    top: "50%",
    xPercent: -50,
    yPercent: -50,
    x: pos1.x,
    y: pos1.y,
    scale: SCALE
  });
  
  gsap.set(right, {
    position: "absolute", 
    left: "50%",
    top: "50%",
    xPercent: -50,
    yPercent: -50,
    x: pos2.x,
    y: pos2.y,
    scale: SCALE
  });
}

/* ---------------------------
   2. Create Draggables
--------------------------- */
function createDraggables() {
  [left, right].forEach((el) => {
    Draggable.create(el, {
      type: "x,y",
      inertia: true,
      allowContextMenu: true,
      zIndexBoost: false,
      onDragStart: function() {
        gsap.to(this.target, { 
          scale: DRAG_SCALE, 
          duration: 0.2,
          overwrite: true
        });
      },
      onDrag: function() {
        if (isAligned) checkIfStillAligned.call(this);
      },
      onDragEnd: function() {
        gsap.to(this.target, { 
          scale: SCALE, 
          duration: 0.2,
          overwrite: true,
          onComplete: () => maybeSnapToMidpoint.call(this)
        });
      },
      onThrowComplete: function() {
        gsap.to(this.target, { 
          scale: SCALE, 
          duration: 0.2,
          overwrite: true,
          onComplete: () => maybeSnapToMidpoint.call(this)
        });
      }
    });
  });
}

/* ---------------------------
   3. Handle Alignment
--------------------------- */
function maybeSnapToMidpoint() {
  if (!left || !right) return;

  const leftRect = left.getBoundingClientRect();
  const rightRect = right.getBoundingClientRect();
  
  const leftCenter = {
    x: leftRect.left + leftRect.width / 2,
    y: leftRect.top + leftRect.height / 2
  };
  const rightCenter = {
    x: rightRect.left + rightRect.width / 2,
    y: rightRect.top + rightRect.height / 2
  };

  const dist = Math.hypot(leftCenter.x - rightCenter.x, leftCenter.y - rightCenter.y);

  if (dist < ALIGNMENT_THRESHOLD) {
    // Calculate the exact midpoint for both graphics and button
    const midX = (leftCenter.x + rightCenter.x) / 2;
    const midY = (leftCenter.y + rightCenter.y) / 2;

    // Calculate offsets relative to this exact midpoint
    const leftOffset = {
      x: midX - leftCenter.x,
      y: midY - leftCenter.y
    };
    const rightOffset = {
      x: midX - rightCenter.x,
      y: midY - rightCenter.y
    };

    // Position button at the exact same midpoint
    gsap.set(enterButton, { 
      left: midX,
      top: midY,
      transform: 'translate(-50%, -50%)',
      position: "fixed",
      zIndex: 10000,
      display: 'block',
      visibility: 'visible',
      opacity: 0,
      scale: 0
    });

    // Create timeline with proper completion handler
    const tl = gsap.timeline({
      onStart: () => {
        enterButton.style.display = 'block';
        enterButton.style.visibility = 'visible';
        enterButton.style.pointerEvents = 'none';
      },
      onComplete: () => {
        isAligned = true;
        left.style.pointerEvents = "none";
        right.style.pointerEvents = "none";
        enterButton.classList.add("active");
        
        // Ensure button is fully visible at the exact midpoint with proper scale
        gsap.to(enterButton, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)",
          onComplete: () => {
            enterButton.style.pointerEvents = 'auto';
          }
        });
        
        // Disable draggables after alignment
        Draggable.get(left).disable();
        Draggable.get(right).disable();
      }
    });

    // Animation chain
    tl.to([left, right], { 
      scale: SCALE,
      duration: 0.3,
      ease: "power2.inOut"
    })
    .to([left, right], {
      filter: `blur(${BLUR_AMOUNT})`,
      duration: 0.3
    }, "<")
    .to(left, {
      x: `+=${leftOffset.x}`,
      y: `+=${leftOffset.y}`,
      duration: 0.4,
      ease: "power3.out"
    }, "<")
    .to(right, {
      x: `+=${rightOffset.x}`,
      y: `+=${rightOffset.y}`,
      duration: 0.4,
      ease: "power3.out"
    }, "<");
  }
}

/* ---------------------------
   4. Check Alignment State
--------------------------- */
function checkIfStillAligned() {
  if (!isAligned) return;
  
  const leftRect = left.getBoundingClientRect();
  const rightRect = right.getBoundingClientRect();
  const dist = Math.hypot(
    (leftRect.left + leftRect.width/2) - (rightRect.left + rightRect.width/2),
    (leftRect.top + leftRect.height/2) - (rightRect.top + rightRect.height/2)
  );

  if (dist > ALIGNMENT_THRESHOLD) {
    isAligned = false;
    left.style.pointerEvents = "auto";
    right.style.pointerEvents = "auto";
    enterButton.classList.remove("active");
    
    gsap.to([left, right], {
      scale: SCALE,
      filter: "blur(0px)",
      duration: 0.3
    });
    
    // Re-enable draggables
    Draggable.get(left).enable();
    Draggable.get(right).enable();
  }
}

/* ---------------------------
   5. Handle Enter Button
--------------------------- */
function setupEnterButton() {
  enterButton.addEventListener('click', () => {
    // Set flag to prevent MainUI from resetting states
    window.animationInProgress = true;
    
    const tl = gsap.timeline({
      onComplete: () => {
        window.animationInProgress = false;
      }
    });

    // First fade out the perception game
    tl.to([container, enterButton], {
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        container.style.display = "none";
        enterButton.classList.remove("active");
      }
    })
    // Show welcome message
    .to(welcomeMessage, {
      opacity: 1,
      visibility: "visible",
      duration: 1.2,
      ease: "power2.inOut",
      onStart: () => {
        welcomeMessage.style.display = "block";
      }
    })
    // Pause
    .to({}, { duration: 1 })
    // Fade out welcome message
    .to(welcomeMessage, {
      opacity: 0,
      visibility: "hidden",
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        welcomeMessage.style.display = "none";
      }
    })
    // Set up and show hidden content
    .set(hiddenContent, {
      display: "block",
      visibility: "visible",
      opacity: 0,
      immediateRender: true
    })
    .to(hiddenContent, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut",
      onStart: () => {
        // Force visibility states
        hiddenContent.style.display = "block";
        hiddenContent.style.visibility = "visible";
        hiddenContent.classList.add("visible");
      },
      onComplete: () => {
        // Lock in visibility states
        hiddenContent.style.display = "block";
        hiddenContent.style.visibility = "visible";
        hiddenContent.style.opacity = "1";
        hiddenContent.style.pointerEvents = "auto";
      }
    });
  });
}

/* ---------------------------
   Subtle floating animation
--------------------------- */
function animate() {
  // Don't animate if elements are aligned or being dragged
  if (!isAligned && !Draggable.get(left).isDragging && !Draggable.get(right).isDragging) {
    const leftRect = left.getBoundingClientRect();
    const rightRect = right.getBoundingClientRect();
    const dist = Math.hypot(
      (leftRect.left + leftRect.width/2) - (rightRect.left + rightRect.width/2),
      (leftRect.top + leftRect.height/2) - (rightRect.top + rightRect.height/2)
    );
    
    // Only animate if they're not close to each other
    if (dist > ALIGNMENT_THRESHOLD * 1.5) {
      const time = Date.now() * 0.001;
      gsap.to(left, { 
        y: `+=${Math.sin(time)}`,
        duration: 0.1,
        overwrite: true
      });
      gsap.to(right, { 
        y: `+=${Math.cos(time)}`,
        duration: 0.1,
        overwrite: true
      });
    }
  }
  requestAnimationFrame(animate);
}

/* ---------------------------
   Initialize Everything
--------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Get elements
  container = document.querySelector('#perception-container');
  left = document.querySelector(".perception-left");
  right = document.querySelector(".perception-right");
  enterButton = document.querySelector(".enter-button");
  welcomeMessage = document.querySelector(".welcome-message");
  hiddenContent = document.querySelector(".hidden-content");

  // Initialize
  if (!container || !left || !right || !enterButton || !welcomeMessage || !hiddenContent) {
    console.error('Required elements not found');
    return;
  }

  initializePositions();
  createDraggables();
  setupEnterButton();
  
  // Start the subtle animation
  animate();
}); 