/**
 * Main application entry point
 */

import { timer } from './timer.js';
import { uiManager } from './ui.js';
import { storageManager } from './storage.js';
import { soundManager } from './sounds.js';

// Initialize the timer with default values
timer.init(25 * 60); // 25 minutes

// Register timer event callbacks
timer.onTick(() => {
    // Update UI or perform actions on each tick if needed
});

timer.onComplete(() => {
    uiManager.elements.startBtn.disabled = false;
    uiManager.elements.pauseBtn.disabled = true;
    uiManager.elements.container.classList.remove('timer-active');
    
    // For pomodoro or interval modes, handle round completion
    // This would be expanded in a more complete implementation
});

// Initialize the progress ring
document.addEventListener('DOMContentLoaded', () => {
    const circle = document.querySelector('.progress-ring__circle');
    if (circle) {
        const circumference = 2 * Math.PI * 140;
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;
    }
    
    // Set initial timer display
    timer.updateDisplay();
});

// Service worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}