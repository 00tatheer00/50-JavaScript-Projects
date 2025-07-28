document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const pomodoroDuration = document.getElementById('pomodoro-duration');
    const shortBreakDuration = document.getElementById('short-break-duration');
    const longBreakDuration = document.getElementById('long-break-duration');
    const autoStart = document.getElementById('auto-start');
    const soundAlert = document.getElementById('sound-alert');
    const saveSettings = document.getElementById('save-settings');
    const newTaskInput = document.getElementById('new-task');
    const addTaskBtn = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const pomodorosCompleted = document.getElementById('pomodoros-completed');
    
    // Audio variables
    let audioContext;
    let currentOscillator;
    
    // Timer variables
    let timer;
    let timeLeft = 0;
    let currentMode = 'pomodoro';
    let isRunning = false;
    let pomodoroCount = 0;
    
    // Initialize audio context on first user interaction
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized');
        }
    }
    
    // Play sound function
    function playSound(type) {
        if (!audioContext) initAudio();
        
        // Stop any currently playing sound
        if (currentOscillator) {
            currentOscillator.stop();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure sound based on type
        switch(type) {
            case 'start':
                oscillator.type = 'sine';
                oscillator.frequency.value = 784; // G5 note
                gainNode.gain.value = 0.3;
                break;
            case 'pause':
                oscillator.type = 'sine';
                oscillator.frequency.value = 523.25; // C5 note
                gainNode.gain.value = 0.2;
                break;
            case 'reset':
                oscillator.type = 'sine';
                oscillator.frequency.value = 659.25; // E5 note
                gainNode.gain.value = 0.2;
                break;
            case 'complete':
                oscillator.type = 'square';
                oscillator.frequency.value = 440; // A4 note
                gainNode.gain.value = 0.5;
                break;
            case 'modeChange':
                oscillator.type = 'triangle';
                oscillator.frequency.value = 587.33; // D5 note
                gainNode.gain.value = 0.2;
                break;
            case 'tick':
                oscillator.type = 'sine';
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.05;
                break;
        }
        
        // Fade out to avoid clicks
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        currentOscillator = oscillator;
    }
    
    // Load settings from localStorage
    loadSettings();
    loadTasks();
    updatePomodoroCount();
    
    // Initialize timer
    resetTimer();
    
    // Event Listeners
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            initAudio();
            playSound('modeChange');
            switchMode(btn.dataset.mode);
        });
    });
    
    startBtn.addEventListener('click', function() {
        initAudio();
        playSound('start');
        startTimer();
    });
    
    pauseBtn.addEventListener('click', function() {
        initAudio();
        playSound('pause');
        pauseTimer();
    });
    
    resetBtn.addEventListener('click', function() {
        initAudio();
        playSound('reset');
        resetTimer();
    });
    
    themeToggle.addEventListener('change', toggleTheme);
    saveSettings.addEventListener('click', saveSettingsToLocalStorage);
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Initialize audio on any click (for Safari compatibility)
    document.addEventListener('click', initAudio, { once: true });
    
    // Timer functions
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            timer = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                // Optional: Uncomment to play tick sound each second
                // if (timeLeft > 0 && timeLeft < 60) {
                //     playSound('tick');
                // }
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    playSound('complete');
                    timerComplete();
                }
            }, 1000);
        }
    }
    
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    function resetTimer() {
        pauseTimer();
        
        switch(currentMode) {
            case 'pomodoro':
                timeLeft = parseInt(localStorage.getItem('pomodoroDuration') || 25) * 60;
                break;
            case 'short-break':
                timeLeft = parseInt(localStorage.getItem('shortBreakDuration') || 5) * 60;
                break;
            case 'long-break':
                timeLeft = parseInt(localStorage.getItem('longBreakDuration') || 15) * 60;
                break;
        }
        
        updateDisplay();
    }
    
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        
        // Update browser tab title
        if (isRunning) {
            document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${getModeName(currentMode)}`;
        } else {
            document.title = 'Pomodoro Timer';
        }
    }
    
    function getModeName(mode) {
        switch(mode) {
            case 'pomodoro': return 'Work Time';
            case 'short-break': return 'Short Break';
            case 'long-break': return 'Long Break';
            default: return 'Pomodoro Timer';
        }
    }
    
    function timerComplete() {
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        // Update pomodoro count if completing a pomodoro
        if (currentMode === 'pomodoro') {
            pomodoroCount++;
            localStorage.setItem('pomodorosCompleted', pomodoroCount);
            updatePomodoroCount();
            completeNextTask();
        }
        
        // Auto-start next timer if enabled
        const autoStartEnabled = localStorage.getItem('autoStart') === 'true';
        if (autoStartEnabled) {
            let nextMode;
            if (currentMode === 'pomodoro') {
                nextMode = (pomodoroCount % 4 === 0) ? 'long-break' : 'short-break';
            } else {
                nextMode = 'pomodoro';
            }
            
            setTimeout(() => {
                playSound('modeChange');
                switchMode(nextMode);
                startTimer();
            }, 1000);
        }
        
        document.title = 'Pomodoro Timer';
    }
    
    function switchMode(mode) {
        currentMode = mode;
        
        // Update active button
        modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // Update timer color
        const timerDisplay = document.querySelector('.timer-display');
        timerDisplay.style.color = mode === 'pomodoro' ? 'var(--primary-color)' : 'var(--accent-color)';
        
        resetTimer();
    }
    
    // Theme functions
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', themeToggle.checked);
    }
    
    // Settings functions
    function loadSettings() {
        // Theme
        const darkMode = localStorage.getItem('darkMode') === 'true';
        themeToggle.checked = darkMode;
        if (darkMode) document.body.classList.add('dark-mode');
        
        // Timer durations
        pomodoroDuration.value = localStorage.getItem('pomodoroDuration') || 25;
        shortBreakDuration.value = localStorage.getItem('shortBreakDuration') || 5;
        longBreakDuration.value = localStorage.getItem('longBreakDuration') || 15;
        
        // Other settings
        autoStart.checked = localStorage.getItem('autoStart') !== 'false';
        soundAlert.value = localStorage.getItem('soundAlert') || 'bell';
    }
    
    function saveSettingsToLocalStorage() {
        localStorage.setItem('pomodoroDuration', pomodoroDuration.value);
        localStorage.setItem('shortBreakDuration', shortBreakDuration.value);
        localStorage.setItem('longBreakDuration', longBreakDuration.value);
        localStorage.setItem('autoStart', autoStart.checked);
        localStorage.setItem('soundAlert', soundAlert.value);
        
        alert('Settings saved successfully!');
        resetTimer();
    }
    
    // Task functions
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            addTaskToDOM(task.text, task.completed);
        });
    }
    
    function addTask() {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            addTaskToDOM(taskText, false);
            saveTasksToLocalStorage();
            newTaskInput.value = '';
        }
    }
    
    function addTaskToDOM(text, completed) {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${completed ? 'completed' : ''}`;
        
        taskItem.innerHTML = `
            <span class="task-text">${text}</span>
            <div class="task-actions">
                <button class="complete-btn"><i class="fas fa-check"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
        
        // Add event listeners
        const completeBtn = taskItem.querySelector('.complete-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');
        
        completeBtn.addEventListener('click', function() {
            taskItem.classList.toggle('completed');
            saveTasksToLocalStorage();
        });
        
        deleteBtn.addEventListener('click', function() {
            taskItem.remove();
            saveTasksToLocalStorage();
        });
    }
    
    function completeNextTask() {
        const firstIncompleteTask = document.querySelector('.task-item:not(.completed)');
        if (firstIncompleteTask) {
            firstIncompleteTask.classList.add('completed');
            saveTasksToLocalStorage();
        }
    }
    
    function saveTasksToLocalStorage() {
        const tasks = [];
        document.querySelectorAll('.task-item').forEach(taskItem => {
            tasks.push({
                text: taskItem.querySelector('.task-text').textContent,
                completed: taskItem.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function updatePomodoroCount() {
        const count = localStorage.getItem('pomodorosCompleted') || 0;
        pomodorosCompleted.textContent = count;
        pomodoroCount = parseInt(count);
    }
});