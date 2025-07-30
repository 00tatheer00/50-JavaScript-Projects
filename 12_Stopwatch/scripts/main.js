import PrecisionTimer from './timer.js';
import LapManager from './laps.js';
import StopwatchUI from './ui.js';
import DataStorage from './storage.js';
import DataExporter from './export.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const timer = new PrecisionTimer();
    const lapManager = new LapManager();
    const ui = new StopwatchUI(timer, lapManager);
    
    // Load saved theme
    ui.loadTheme();
    
    // Check for saved state
    const savedElapsedTime = DataStorage.loadElapsedTime();
    const savedLaps = DataStorage.loadLaps();
    
    if (savedElapsedTime > 0) {
        timer.elapsedTime = savedElapsedTime;
        ui.updateDisplay(savedElapsedTime);
        
        if (savedLaps.length > 0) {
            lapManager.laps = savedLaps;
            lapManager.lastLapTime = savedLaps.reduce((max, lap) => Math.max(max, lap.splitTime), 0);
            ui.updateLapDisplay();
        }
    }
    
    // Export buttons
    document.querySelector('.export-json').addEventListener('click', () => {
        DataExporter.exportToJSON(lapManager.getLaps());
    });
    
    document.querySelector('.export-csv').addEventListener('click', () => {
        DataExporter.exportToCSV(lapManager.getLaps());
    });
    
    // Save state before unload
    window.addEventListener('beforeunload', () => {
        if (timer.isRunning) {
            DataStorage.saveElapsedTime(timer.getTime());
            DataStorage.saveLaps(lapManager.getLaps());
        } else {
            DataStorage.clearStorage();
        }
    });
});





