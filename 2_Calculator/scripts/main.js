import { Calculator } from './display.js';
import { setupKeyboardSupport } from './keyboard.js';
import { setupThemeSwitcher } from './theme.js';
import { setupMemoryButtons } from './memory.js';
import { setupHistoryButtons } from './history.js';

document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
    calculator.initialize();
    
    setupKeyboardSupport(calculator);
    setupThemeSwitcher();
    setupMemoryButtons(calculator);
    setupHistoryButtons(calculator);
});