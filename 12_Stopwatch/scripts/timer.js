class PrecisionTimer {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.lastUpdateTime = 0;
        this.animationFrameId = null;
    }

    start(callback) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.lastUpdateTime = Date.now();
        
        const updateTimer = () => {
            const now = Date.now();
            const delta = now - this.lastUpdateTime;
            this.lastUpdateTime = now;
            
            this.elapsedTime += delta;
            
            if (callback) {
                callback(this.elapsedTime);
            }
            
            this.animationFrameId = requestAnimationFrame(updateTimer);
        };
        
        this.animationFrameId = requestAnimationFrame(updateTimer);
    }

    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
    }

    reset() {
        this.pause();
        this.elapsedTime = 0;
        this.startTime = 0;
    }

    getTime() {
        return this.elapsedTime;
    }

    formatTime(time) {
        const date = new Date(time);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
        
        return { hours, minutes, seconds, milliseconds };
    }
}

export default PrecisionTimer;