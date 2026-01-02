/* ============================================
   GOGOBUS - Main Application JavaScript
   Handles navigation, splash screen, and gestures
   ============================================ */

// ===================
// APP STATE
// ===================
const App = {
    currentScreen: 'splash-screen',
    screens: ['splash-screen', 'onboarding-1', 'onboarding-2', 'onboarding-3', 'get-started', 'login'],
    onboardingScreens: ['onboarding-1', 'onboarding-2', 'onboarding-3'],
    touchStartX: 0,
    touchEndX: 0,
    minSwipeDistance: 50,
    isTransitioning: false
};

// ===================
// SCREEN NAVIGATION
// ===================
function goToScreen(screenId) {
    if (App.isTransitioning || screenId === App.currentScreen) return;
    
    const currentEl = document.getElementById(App.currentScreen);
    const nextEl = document.getElementById(screenId);
    
    if (!currentEl || !nextEl) {
        console.error('Screen not found:', screenId);
        return;
    }
    
    App.isTransitioning = true;
    
    // Determine direction
    const currentIndex = App.screens.indexOf(App.currentScreen);
    const nextIndex = App.screens.indexOf(screenId);
    const isForward = nextIndex > currentIndex;
    
    // Add exit class to current screen
    currentEl.classList.add('exit');
    currentEl.classList.remove('active');
    
    // Set initial position for next screen
    if (isForward) {
        nextEl.style.transform = 'translateX(100%)';
    } else {
        nextEl.style.transform = 'translateX(-30%)';
        nextEl.style.opacity = '0';
    }
    
    // Trigger reflow
    nextEl.offsetHeight;
    
    // Activate next screen
    nextEl.classList.add('active');
    nextEl.style.transform = '';
    nextEl.style.opacity = '';
    
    // Cleanup after transition
    setTimeout(() => {
        currentEl.classList.remove('exit');
        currentEl.style.transform = '';
        App.currentScreen = screenId;
        App.isTransitioning = false;
        
        // Save progress to localStorage
        saveProgress(screenId);
    }, 300);
}

// ===================
// SWIPE GESTURES
// ===================
function initSwipeGestures() {
    const app = document.getElementById('app');
    
    app.addEventListener('touchstart', (e) => {
        App.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    app.addEventListener('touchend', (e) => {
        App.touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const diff = App.touchStartX - App.touchEndX;
    
    // Only handle swipes on onboarding screens
    if (!App.onboardingScreens.includes(App.currentScreen)) return;
    
    const currentIndex = App.onboardingScreens.indexOf(App.currentScreen);
    
    if (Math.abs(diff) < App.minSwipeDistance) return;
    
    if (diff > 0) {
        // Swipe left - go to next
        if (currentIndex < App.onboardingScreens.length - 1) {
            goToScreen(App.onboardingScreens[currentIndex + 1]);
        } else {
            // Last onboarding screen - go to get started
            goToScreen('get-started');
        }
    } else {
        // Swipe right - go to previous
        if (currentIndex > 0) {
            goToScreen(App.onboardingScreens[currentIndex - 1]);
        }
    }
}

// ===================
// SPLASH SCREEN
// ===================
function initSplashScreen() {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('gogobus_onboarding_complete');
    const lastScreen = localStorage.getItem('gogobus_last_screen');
    
    // Auto-transition from splash after 2.5 seconds
    setTimeout(() => {
        if (hasSeenOnboarding === 'true') {
            // Skip to get-started if already completed onboarding
            goToScreen('get-started');
        } else if (lastScreen && App.screens.includes(lastScreen)) {
            // Resume from last screen
            goToScreen(lastScreen);
        } else {
            // Start onboarding
            goToScreen('onboarding-1');
        }
    }, 2500);
}

// ===================
// PROGRESS PERSISTENCE
// ===================
function saveProgress(screenId) {
    localStorage.setItem('gogobus_last_screen', screenId);
    
    if (screenId === 'get-started' || screenId === 'login') {
        localStorage.setItem('gogobus_onboarding_complete', 'true');
    }
}

function clearProgress() {
    localStorage.removeItem('gogobus_last_screen');
    localStorage.removeItem('gogobus_onboarding_complete');
}

// ===================
// KEYBOARD NAVIGATION (for desktop testing)
// ===================
function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        if (!App.onboardingScreens.includes(App.currentScreen)) return;
        
        const currentIndex = App.onboardingScreens.indexOf(App.currentScreen);
        
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            if (currentIndex < App.onboardingScreens.length - 1) {
                goToScreen(App.onboardingScreens[currentIndex + 1]);
            } else {
                goToScreen('get-started');
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentIndex > 0) {
                goToScreen(App.onboardingScreens[currentIndex - 1]);
            }
        }
    });
}

// ===================
// INDICATOR CLICKS
// ===================
function initIndicatorClicks() {
    document.querySelectorAll('.onboarding-indicators').forEach(container => {
        const indicators = container.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.style.cursor = 'pointer';
            indicator.addEventListener('click', () => {
                goToScreen(App.onboardingScreens[index]);
            });
        });
    });
}

// ===================
// UPDATE INDICATORS
// ===================
function updateIndicators() {
    const currentIndex = App.onboardingScreens.indexOf(App.currentScreen);
    
    document.querySelectorAll('.onboarding-screen').forEach(screen => {
        const indicators = screen.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    });
}

// Override goToScreen to update indicators
const originalGoToScreen = goToScreen;
goToScreen = function(screenId) {
    originalGoToScreen(screenId);
    
    // Update indicators after transition
    setTimeout(() => {
        updateIndicators();
    }, 50);
};

// ===================
// INITIALIZATION
// ===================
function init() {
    // Initialize all features
    initSplashScreen();
    initSwipeGestures();
    initKeyboardNav();
    initIndicatorClicks();
    
    // Log for debugging
    console.log('🚌 GOGOBUS App Initialized');
    console.log('📱 Swipe left/right or use arrow keys to navigate');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===================
// UTILITY FUNCTIONS
// ===================

// Expose functions globally for onclick handlers
window.goToScreen = goToScreen;
window.clearProgress = clearProgress;

// Service Worker registration (for PWA - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you add a service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}
