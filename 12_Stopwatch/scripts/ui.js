class StopwatchUI {
    constructor(timer, lapManager) {
        this.timer = timer;
        this.lapManager = lapManager;
        
        // DOM Elements
        this.timeDisplay = document.querySelector('.time-display');
        this.hoursElement = document.querySelector('.hours');
        this.minutesElement = document.querySelector('.minutes');
        this.secondsElement = document.querySelector('.seconds');
        this.millisecondsElement = document.querySelector('.milliseconds');
        
        this.startBtn = document.querySelector('.start-btn');
        this.pauseBtn = document.querySelector('.pause-btn');
        this.lapBtn = document.querySelector('.lap-btn');
        this.resetBtn = document.querySelector('.reset-btn');
        
        this.lapsList = document.querySelector('.laps-list');
        this.lapCount = document.querySelector('.lap-count');
        this.fastestLap = document.querySelector('.fastest-lap');
        this.slowestLap = document.querySelector('.slowest-lap');
        this.averageLap = document.querySelector('.average-lap');
        
        this.container = document.querySelector('.container');
        this.themeBtns = document.querySelectorAll('.theme-btn');
        
        // Event listeners
        this.initEventListeners();
        this.initKeyboardShortcuts();
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startStopwatch());
        this.pauseBtn.addEventListener('click', () => this.pauseStopwatch());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        this.resetBtn.addEventListener('click', () => this.resetStopwatch());
        
        this.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.container.setAttribute('data-theme', theme);
                localStorage.setItem('stopwatchTheme', theme);
            });
        });
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.timer.isRunning) {
                    this.pauseStopwatch();
                } else {
                    this.startStopwatch();
                }
            }
            
            if (e.code === 'KeyL' && this.timer.isRunning) {
                this.recordLap();
            }
            
            if (e.code === 'KeyR' && !this.timer.isRunning) {
                this.resetStopwatch();
            }
        });
    }

    startStopwatch() {
        this.timer.start((time) => this.updateDisplay(time));
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.lapBtn.disabled = false;
        this.timeDisplay.classList.add('running');
        this.timeDisplay.classList.remove('paused');
        this.startBtn.classList.add('active');
    }

    pauseStopwatch() {
        this.timer.pause();
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.timeDisplay.classList.remove('running');
        this.timeDisplay.classList.add('paused');
        this.startBtn.classList.remove('active');
    }

    resetStopwatch() {
        this.timer.reset();
        this.lapManager.clearLaps();
        
        this.updateDisplay(0);
        this.updateLapDisplay();
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.lapBtn.disabled = true;
        this.timeDisplay.classList.remove('running', 'paused');
        this.startBtn.classList.remove('active');
    }

    recordLap() {
        const currentTime = this.timer.getTime();
        const lap = this.lapManager.addLap(currentTime);
        this.updateLapDisplay();
        
        // Play sound effect
        this.playSound('lap');
    }

    updateDisplay(time) {
        const { hours, minutes, seconds, milliseconds } = this.timer.formatTime(time);
        
        this.hoursElement.textContent = hours;
        this.minutesElement.textContent = minutes;
        this.secondsElement.textContent = seconds;
        this.millisecondsElement.textContent = milliseconds;
    }

    updateLapDisplay() {
        const laps = this.lapManager.getLaps();
        const stats = this.lapManager.getStatistics();
        
        this.lapsList.innerHTML = '';
        this.lapCount.textContent = `(${laps.length})`;
        
        laps.forEach((lap, index) => {
            const lapElement = document.createElement('div');
            lapElement.className = 'lap-item';
            
            if (stats.fastest === lap.lapTime) {
                lapElement.classList.add('fastest');
            } else if (stats.slowest === lap.lapTime) {
                lapElement.classList.add('slowest');
            }
            
            lapElement.innerHTML = `
                <span>${lap.lapNumber}</span>
                <span>${this.lapManager.formatLapTime(lap.lapTime)}</span>
                <span>${this.lapManager.formatLapTime(lap.splitTime)}</span>
                <button class="btn delete-lap" data-id="${lap.id}"><i class="fas fa-trash"></i></button>
            `;
            
            this.lapsList.appendChild(lapElement);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-lap').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                this.deleteLap(id);
            });
        });
        
        // Update statistics
        this.fastestLap.textContent = stats.fastest ? this.lapManager.formatLapTime(stats.fastest) : '--:--.---';
        this.slowestLap.textContent = stats.slowest ? this.lapManager.formatLapTime(stats.slowest) : '--:--.---';
        this.averageLap.textContent = stats.average ? this.lapManager.formatLapTime(stats.average) : '--:--.---';
    }

    deleteLap(id) {
        const lapIndex = this.lapManager.laps.findIndex(lap => lap.id === id);
        if (lapIndex !== -1) {
            this.lapManager.laps.splice(lapIndex, 1);
            
            // If we deleted the last lap, reset lastLapTime
            if (this.lapManager.laps.length === 0) {
                this.lapManager.lastLapTime = 0;
            } else if (lapIndex === 0) {
                // If we deleted the first lap, update lastLapTime to 0
                this.lapManager.lastLapTime = 0;
            }
            
            this.updateLapDisplay();
        }
    }

    playSound(type) {
        // In a real implementation, you would play an audio file
        console.log(`Playing ${type} sound`);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('stopwatchTheme') || 'dark';
        this.container.setAttribute('data-theme', savedTheme);
    }
}

export default StopwatchUI;