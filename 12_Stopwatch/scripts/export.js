class DataExporter {
    static exportToJSON(laps) {
        const data = {
            timestamp: new Date().toISOString(),
            laps: laps,
            statistics: this.calculateStatistics(laps)
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `stopwatch-laps-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    static exportToCSV(laps) {
        let csv = 'Lap Number,Lap Time,Split Time,Timestamp\n';
        
        laps.forEach(lap => {
            csv += `${lap.lapNumber},"${this.formatTimeForCSV(lap.lapTime)}","${this.formatTimeForCSV(lap.splitTime)}",${lap.timestamp}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `stopwatch-laps-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    static formatTimeForCSV(time) {
        const date = new Date(time);
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
        return `${minutes}:${seconds}.${milliseconds}`;
    }

    static calculateStatistics(laps) {
        if (laps.length === 0) {
            return {
                fastest: null,
                slowest: null,
                average: null,
                total: null
            };
        }
        
        const lapTimes = laps.map(lap => lap.lapTime);
        const fastest = Math.min(...lapTimes);
        const slowest = Math.max(...lapTimes);
        const average = lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;
        const total = lapTimes.reduce((sum, time) => sum + time, 0);
        
        return {
            fastest,
            slowest,
            average,
            total
        };
    }
}

export default DataExporter;