export function setupMemoryButtons(calculator) {
    document.querySelector('.btn-mc').addEventListener('click', () => {
        calculator.setMemoryValue(0);
    });

    document.querySelector('.btn-mr').addEventListener('click', () => {
        calculator.currentInput = calculator.getMemoryValue().toString();
        calculator.updateDisplay();
    });

    document.querySelector('.btn-ms').addEventListener('click', () => {
        const value = parseFloat(calculator.currentInput);
        if (!isNaN(value)) {
            calculator.setMemoryValue(value);
        }
    });

    document.querySelector('.btn-mplus').addEventListener('click', () => {
        const value = parseFloat(calculator.currentInput);
        if (!isNaN(value)) {
            calculator.addToMemory(value);
        }
    });
}