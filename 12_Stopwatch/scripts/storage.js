class DataStorage {
    static saveLaps(laps) {
        localStorage.setItem('stopwatchLaps', JSON.stringify(laps));
    }

    static loadLaps() {
        const laps = localStorage.getItem('stopwatchLaps');
        return laps ? JSON.parse(laps) : [];
    }

    static saveElapsedTime(time) {
        localStorage.setItem('stopwatchElapsedTime', time.toString());
    }

    static loadElapsedTime() {
        const time = localStorage.getItem('stopwatchElapsedTime');
        return time ? parseInt(time) : 0;
    }

    static clearStorage() {
        localStorage.removeItem('stopwatchLaps');
        localStorage.removeItem('stopwatchElapsedTime');
    }
}

export default DataStorage;