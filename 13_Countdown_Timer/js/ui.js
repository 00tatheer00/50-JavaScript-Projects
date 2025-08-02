/**
 * User interface management
 */

import { timer } from './timer.js';
import { storageManager } from './storage.js';
import { soundManager } from './sounds.js';
import { showNotification } from './utils.js';

class UIManager {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.loadSettings();
        this.loadPresets();
    }
    
    // Initialize DOM elements
    initElements() {
        this.elements = {
            time: document.getElementById('time'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            hoursInput: document.getElementById('hours'),
            minutesInput: document.getElementById('minutes'),
            secondsInput: document.getElementById('seconds'),
            countdownSettings: document.getElementById('countdown-settings'),
            pomodoroSettings: document.getElementById('pomodoro-settings'),
            intervalSettings: document.getElementById('interval-settings'),
            workDuration: document.getElementById('work-duration'),
            shortBreak: document.getElementById('short-break'),
            longBreak: document.getElementById('long-break'),
            pomodoroRounds: document.getElementById('pomodoro-rounds'),
            workInterval: document.getElementById('work-interval'),
            restInterval: document.getElementById('rest-interval'),
            intervalRounds: document.getElementById('interval-rounds'),
            enableSound: document.getElementById('enable-sound'),
            tickSound: document.getElementById('tick-sound'),
            savePresetBtn: document.getElementById('savePresetBtn'),
            presetsContainer: document.getElementById('presets-container'),
            themeButtons: document.querySelectorAll('.btn-theme'),
            modeButtons: document.querySelectorAll('.btn-mode'),
            container: document.querySelector('.container')
        };
    }
    
    // Bind event listeners
    bindEvents() {
        // Timer control buttons
        this.elements.startBtn.addEventListener('click', () => this.startTimer());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.elements.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Mode switching
        this.elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
        });
        
        // Theme switching
        this.elements.themeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTheme(btn.dataset.theme));
        });
        
        // Sound toggles
        this.elements.enableSound.addEventListener('change', (e) => {
            soundManager.toggleSounds(e.target.checked);
            storageManager.updateSetting('soundEnabled', e.target.checked);
        });
        
        this.elements.tickSound.addEventListener('change', (e) => {
            soundManager.toggleTick(e.target.checked);
            storageManager.updateSetting('tickSoundEnabled', e.target.checked);
        });
        
        // Preset saving
        this.elements.savePresetBtn.addEventListener('click', () => this.savePreset());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    // Load settings from storage
    loadSettings() {
        const settings = storageManager.settings;
        
        // Apply theme
        this.switchTheme(settings.theme || 'dark', false);
        
        // Apply sound settings
        this.elements.enableSound.checked = settings.soundEnabled !== false;
        this.elements.tickSound.checked = settings.tickSoundEnabled || false;
        soundManager.toggleSounds(settings.soundEnabled !== false);
        soundManager.toggleTick(settings.tickSoundEnabled || false);
        
        // Apply last used mode
        if (settings.lastMode && settings.lastMode !== 'countdown') {
            this.switchMode(settings.lastMode, false);
        }
    }
    
    // Load presets from storage
    loadPresets() {
        const presets = storageManager.getPresets();
        this.elements.presetsContainer.innerHTML = '';
        
        if (presets.length === 0) {
            this.elements.presetsContainer.innerHTML = '<p>No presets saved yet</p>';
            return;
        }
        
        presets.forEach(preset => {
            const presetElement = document.createElement('div');
            presetElement.className = 'preset-item';
            presetElement.textContent = preset.name;
            presetElement.addEventListener('click', () => this.loadPreset(preset));
            this.elements.presetsContainer.appendChild(presetElement);
        });
    }
    
    // Start the timer
    startTimer() {
        if (timer.isRunning) return;
        
        // If timer is at 0, reinitialize with current settings
        if (timer.remainingTime <= 0) {
            this.setTimerFromCurrentMode();
        }
        
        timer.start();
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.container.classList.add('timer-active');
    }
    
    // Pause the timer
    pauseTimer() {
        timer.pause();
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.container.classList.remove('timer-active');
    }
    
    // Reset the timer
    resetTimer() {
        timer.reset();
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.container.classList.remove('timer-active');
    }
    
    // Switch between timer modes
    switchMode(mode, updateDisplay = true) {
        // Update UI
        this.elements.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Show/hide settings sections
        this.elements.countdownSettings.style.display = mode === 'countdown' ? 'block' : 'none';
        this.elements.pomodoroSettings.style.display = mode === 'pomodoro' ? 'block' : 'none';
        this.elements.intervalSettings.style.display = mode === 'intervals' ? 'block' : 'none';
        
        // Store the mode
        storageManager.updateSetting('lastMode', mode);
        
        // Reset timer if running
        if (timer.isRunning) {
            this.resetTimer();
        }
        
        // Initialize timer for the new mode
        if (updateDisplay) {
            this.setTimerFromCurrentMode();
        }
    }
    
    // Set timer based on current mode and inputs
    setTimerFromCurrentMode() {
        const activeMode = document.querySelector('.btn-mode.active').dataset.mode;
        
        switch (activeMode) {
            case 'pomodoro':
                const workDuration = parseInt(this.elements.workDuration.value) || 25;
                const shortBreak = parseInt(this.elements.shortBreak.value) || 5;
                const longBreak = parseInt(this.elements.longBreak.value) || 15;
                const rounds = parseInt(this.elements.pomodoroRounds.value) || 4;
                timer.setupPomodoro(workDuration, shortBreak, longBreak, rounds);
                break;
                
            case 'intervals':
                const workInterval = parseInt(this.elements.workInterval.value) || 30;
                const restInterval = parseInt(this.elements.restInterval.value) || 15;
                const intervalRounds = parseInt(this.elements.intervalRounds.value) || 8;
                timer.setupIntervals(workInterval, restInterval, intervalRounds);
                break;
                
            default: // countdown
                const hours = parseInt(this.elements.hoursInput.value) || 0;
                const minutes = parseInt(this.elements.minutesInput.value) || 25;
                const seconds = parseInt(this.elements.secondsInput.value) || 0;
                const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                timer.init(totalSeconds);
        }
    }
    
    // Switch between color themes
    switchTheme(theme, save = true) {
        this.elements.themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        this.elements.container.setAttribute('data-theme', theme);
        
        if (save) {
            storageManager.updateSetting('theme', theme);
        }
    }
    
    // Save current settings as a preset
    savePreset() {
        const activeMode = document.querySelector('.btn-mode.active').dataset.mode;
        const presetName = prompt('Enter a name for this preset:');
        
        if (!presetName) return;
        
        let settings;
        
        switch (activeMode) {
            case 'pomodoro':
                settings = {
                    mode: 'pomodoro',
                    workDuration: parseInt(this.elements.workDuration.value) || 25,
                    shortBreak: parseInt(this.elements.shortBreak.value) || 5,
                    longBreak: parseInt(this.elements.longBreak.value) || 15,
                    rounds: parseInt(this.elements.pomodoroRounds.value) || 4
                };
                break;
                
            case 'intervals':
                settings = {
                    mode: 'intervals',
                    workInterval: parseInt(this.elements.workInterval.value) || 30,
                    restInterval: parseInt(this.elements.restInterval.value) || 15,
                    rounds: parseInt(this.elements.intervalRounds.value) || 8
                };
                break;
                
            default:
                settings = {
                    mode: 'countdown',
                    hours: parseInt(this.elements.hoursInput.value) || 0,
                    minutes: parseInt(this.elements.minutesInput.value) || 25,
                    seconds: parseInt(this.elements.secondsInput.value) || 0
                };
        }
        
        storageManager.addPreset(presetName, settings);
        this.loadPresets();
        showNotification('Preset saved successfully!', 'success');
    }
    
    // Load a preset
    loadPreset(preset) {
        this.switchMode(preset.settings.mode, false);
        
        switch (preset.settings.mode) {
            case 'pomodoro':
                this.elements.workDuration.value = preset.settings.workDuration;
                this.elements.shortBreak.value = preset.settings.shortBreak;
                this.elements.longBreak.value = preset.settings.longBreak;
                this.elements.pomodoroRounds.value = preset.settings.rounds;
                break;
                
            case 'intervals':
                this.elements.workInterval.value = preset.settings.workInterval;
                this.elements.restInterval.value = preset.settings.restInterval;
                this.elements.intervalRounds.value = preset.settings.rounds;
                break;
                
            default:
                this.elements.hoursInput.value = preset.settings.hours;
                this.elements.minutesInput.value = preset.settings.minutes;
                this.elements.secondsInput.value = preset.settings.seconds;
        }
        
        this.setTimerFromCurrentMode();
        showNotification(`Preset "${preset.name}" loaded`, 'success');
    }
    
    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Don't trigger if focused on an input
        if (document.activeElement.tagName === 'INPUT') return;
        
        switch (e.key) {
            case ' ':
                e.preventDefault();
                if (timer.isRunning) {
                    this.pauseTimer();
                } else {
                    this.startTimer();
                }
                break;
                
            case 'r':
                e.preventDefault();
                this.resetTimer();
                break;
                
            case 'm':
                e.preventDefault();
                const newState = !soundManager.enabled;
                soundManager.toggleSounds(newState);
                this.elements.enableSound.checked = newState;
                storageManager.updateSetting('soundEnabled', newState);
                showNotification(newState ? 'Sound enabled' : 'Sound muted', 'info');
                break;
        }
    }
}

export const uiManager = new UIManager();