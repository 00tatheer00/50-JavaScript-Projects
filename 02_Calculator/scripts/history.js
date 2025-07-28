export function setupHistoryButtons(calculator) {
    document.querySelector('.btn-history-prev').addEventListener('click', () => {
        if (calculator.history.length === 0) return;
        
        if (calculator.historyIndex > 0) {
            calculator.historyIndex--;
            const historyEntry = calculator.history[calculator.historyIndex];
            const result = historyEntry.split(' = ')[1];
            calculator.currentInput = result;
            calculator.updateDisplay();
        }
    });

    document.querySelector('.btn-history-next').addEventListener('click', () => {
        if (calculator.history.length === 0) return;
        
        if (calculator.historyIndex < calculator.history.length - 1) {
            calculator.historyIndex++;
            const historyEntry = calculator.history[calculator.historyIndex];
            const result = historyEntry.split(' = ')[1];
            calculator.currentInput = result;
            calculator.updateDisplay();
        } else if (calculator.historyIndex === calculator.history.length - 1) {
            calculator.historyIndex++;
            calculator.currentInput = '0';
            calculator.updateDisplay();
        }
    });
}