class LapManager {
    constructor() {
        this.laps = [];
        this.lastLapTime = 0;
    }

    addLap(currentTime) {
        const lapTime = currentTime - this.lastLapTime;
        this.lastLapTime = currentTime;
        
        const lap = {
            id: Date.now(),
            lapNumber: this.laps.length + 1,
            lapTime,
            splitTime: currentTime,
            timestamp: new Date().toISOString()
        };
        
        this.laps.push(lap);
        return lap;
    }

    getLaps() {
        return this.laps;
    }

    clearLaps() {
        this.laps = [];
        this.lastLapTime = 0;
    }

    getStatistics() {
        if (this.laps.length === 0) {
            return {
                fastest: null,
                slowest: null,
                average: null
            };
        }
        
        const lapTimes = this.laps.map(lap => lap.lapTime);
        const fastest = Math.min(...lapTimes);
        const slowest = Math.max(...lapTimes);
        const average = lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;
        
        return {
            fastest,
            slowest,
            average
        };
    }

    formatLapTime(time) {
        const date = new Date(time);
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
        
        return `${minutes}:${seconds}.${milliseconds}`;
    }
}

export default LapManager;