export function setupKeyboardSupport(calculator) {
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
            calculator.appendNumber(e.key);
        } else if (e.key === '.') {
            calculator.appendDecimal();
        } else if (e.key === 'Enter' || e.key === '=') {
            calculator.compute();
        } else if (e.key === 'Escape') {
            calculator.clearAll();
        } else if (e.key === 'Backspace') {
            calculator.clearEntry();
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '^' || e.key === '%') {
            let operator = e.key;
            if (operator === '*') operator = '×';
            calculator.chooseOperation(operator);
        } else if (e.key === 'p' && e.ctrlKey) {
            calculator.appendPi();
        } else if (e.key === 'e' && e.ctrlKey) {
            calculator.appendE();
        }
    });
}