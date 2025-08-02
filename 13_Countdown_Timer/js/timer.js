/**
 * Core timer functionality
 */

import { formatTime, calculateDashoffset, showNotification } from './utils.js';
import { soundManager } from './sounds.js';

class Timer {
    constructor() {
        this.initialTime = 0;
        this.remainingTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.mode = 'countdown'; // 'countdown', 'pomodoro', 'intervals'
        this.currentRound = 0;
        this.totalRounds = 0;
        this.onTickCallbacks = [];
        this.onCompleteCallbacks = [];
        this.onRoundCompleteCallbacks = [];
    }
    
    // Initialize the timer
    init(seconds) {
        this.initialTime = seconds;
        this.remainingTime = seconds;
        this.updateDisplay();
    }
    
    // Start the timer
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        soundManager.play('alert');
        
        this.timerInterval = setInterval(() => {
            this.tick();
        }, 1000);
        
        if (soundManager.tickEnabled) {
            soundManager.startTick();
        }
    }
    
    // Pause the timer
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.timerInterval);
        soundManager.stopTick();
        soundManager.play('alert');
    }
    
    // Reset the timer
    reset() {
        this.pause();
        this.remainingTime = this.initialTime;
        this.updateDisplay();
    }
    
    // Timer tick (called every second)
    tick() {
        if (this.remainingTime <= 0) {
            this.complete();
            return;
        }
        
        this.remainingTime--;
        this.updateDisplay();
        
        // Call all registered tick callbacks
        this.onTickCallbacks.forEach(callback => callback(this.remainingTime));
    }
    
    // Update the display
    updateDisplay() {
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = formatTime(this.remainingTime);
        }
        
        // Update progress ring
        const circle = document.querySelector('.progress-ring__circle');
        if (circle) {
            const offset = calculateDashoffset(this.remainingTime, this.initialTime);
            circle.style.strokeDashoffset = offset;
        }
    }
    
    // Timer completed
    complete() {
        this.pause();
        soundManager.play('alarm');
        
        // Call all registered complete callbacks
        this.onCompleteCallbacks.forEach(callback => callback());
        
        showNotification('Timer completed!', 'success');
    }
    
    // Set up pomodoro timer
    setupPomodoro(workDuration, shortBreak, longBreak, rounds) {
        this.mode = 'pomodoro';
        this.currentRound = 0;
        this.totalRounds = rounds;
        this.initialTime = workDuration * 60;
        this.remainingTime = this.initialTime;
        this.updateDisplay();
    }
    
    // Set up interval timer
    setupIntervals(workInterval, restInterval, rounds) {
        this.mode = 'intervals';
        this.currentRound = 0;
        this.totalRounds = rounds;
        this.initialTime = workInterval;
        this.remainingTime = this.initialTime;
        this.updateDisplay();
    }
    
    // Register a callback for timer ticks
    onTick(callback) {
        this.onTickCallbacks.push(callback);
    }
    
    // Register a callback for timer completion
    onComplete(callback) {
        this.onCompleteCallbacks.push(callback);
    }
    
    // Register a callback for round completion (for pomodoro/intervals)
    onRoundComplete(callback) {
        this.onRoundCompleteCallbacks.push(callback);
    }
    
    // Clean up
    destroy() {
        this.pause();
        this.onTickCallbacks = [];
        this.onCompleteCallbacks = [];
        this.onRoundCompleteCallbacks = [];
    }
}

export const timer = new Timer();