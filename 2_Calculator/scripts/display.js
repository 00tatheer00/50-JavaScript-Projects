export class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.resetScreen = false;
        this.memoryValue = 0;
        this.history = [];
        this.historyIndex = -1;
    }

    initialize() {
        this.updateDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('.btn-number').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.textContent);
            });
        });

        // Decimal button
        document.querySelector('.btn-dot').addEventListener('click', () => {
            this.appendDecimal();
        });

        // Operator buttons
        document.querySelectorAll('.btn-operator').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.textContent);
            });
        });

        // Equals button
        document.querySelector('.btn-equals').addEventListener('click', () => {
            this.compute();
        });

        // Clear buttons
        document.querySelector('.btn-clear-all').addEventListener('click', () => {
            this.clearAll();
        });

        document.querySelector('.btn-clear-entry').addEventListener('click', () => {
            this.clearEntry();
        });

        // Scientific buttons
        document.querySelector('.btn-sin').addEventListener('click', () => {
            this.scientificOperation('sin');
        });

        document.querySelector('.btn-cos').addEventListener('click', () => {
            this.scientificOperation('cos');
        });

        document.querySelector('.btn-tan').addEventListener('click', () => {
            this.scientificOperation('tan');
        });

        document.querySelector('.btn-ln').addEventListener('click', () => {
            this.scientificOperation('ln');
        });

        document.querySelector('.btn-log').addEventListener('click', () => {
            this.scientificOperation('log');
        });

        document.querySelector('.btn-fact').addEventListener('click', () => {
            this.scientificOperation('fact');
        });

        document.querySelector('.btn-sqrt').addEventListener('click', () => {
            this.scientificOperation('sqrt');
        });

        document.querySelector('.btn-power').addEventListener('click', () => {
            this.chooseOperation('^');
        });

        document.querySelector('.btn-mod').addEventListener('click', () => {
            this.chooseOperation('%');
        });

        document.querySelector('.btn-pi').addEventListener('click', () => {
            this.appendPi();
        });

        document.querySelector('.btn-e').addEventListener('click', () => {
            this.appendE();
        });

        document.querySelector('.btn-exp').addEventListener('click', () => {
            this.appendExp();
        });
    }

    appendNumber(number) {
        if (this.currentInput === '0' || this.resetScreen) {
            this.currentInput = number;
            this.resetScreen = false;
        } else {
            this.currentInput += number;
        }
        this.updateDisplay();
    }

    appendDecimal() {
        if (this.resetScreen) {
            this.currentInput = '0.';
            this.resetScreen = false;
            return;
        }
        if (this.currentInput.includes('.')) return;
        this.currentInput += '.';
        this.updateDisplay();
    }

    appendPi() {
        if (this.resetScreen || this.currentInput === '0') {
            this.currentInput = Math.PI.toString();
            this.resetScreen = false;
        } else {
            this.currentInput += Math.PI.toString();
        }
        this.updateDisplay();
    }

    appendE() {
        if (this.resetScreen || this.currentInput === '0') {
            this.currentInput = Math.E.toString();
            this.resetScreen = false;
        } else {
            this.currentInput += Math.E.toString();
        }
        this.updateDisplay();
    }

    appendExp() {
        if (this.resetScreen) {
            this.currentInput = 'e';
            this.resetScreen = false;
        } else {
            this.currentInput += 'e';
        }
        this.updateDisplay();
    }

    chooseOperation(operator) {
        if (this.currentInput === '') return;
        if (this.previousInput !== '') {
            this.compute();
        }
        this.operation = operator;
        this.previousInput = this.currentInput;
        this.resetScreen = true;
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '/':
                computation = prev / current;
                break;
            case '^':
                computation = Math.pow(prev, current);
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }
        
        this.addToHistory(`${this.previousInput} ${this.operation} ${this.currentInput} = ${computation}`);
        this.currentInput = computation.toString();
        this.operation = null;
        this.previousInput = '';
        this.resetScreen = true;
        this.updateDisplay();
    }

    scientificOperation(func) {
        let result;
        const current = parseFloat(this.currentInput);
        
        if (isNaN(current)) return;
        
        switch (func) {
            case 'sin':
                result = Math.sin(current);
                break;
            case 'cos':
                result = Math.cos(current);
                break;
            case 'tan':
                result = Math.tan(current);
                break;
            case 'ln':
                if (current <= 0) {
                    this.showError('Invalid input for ln');
                    return;
                }
                result = Math.log(current);
                break;
            case 'log':
                if (current <= 0) {
                    this.showError('Invalid input for log');
                    return;
                }
                result = Math.log10(current);
                break;
            case 'sqrt':
                if (current < 0) {
                    this.showError('Invalid input for sqrt');
                    return;
                }
                result = Math.sqrt(current);
                break;
            case 'fact':
                if (current < 0 || !Number.isInteger(current)) {
                    this.showError('Invalid input for factorial');
                    return;
                }
                result = this.factorial(current);
                break;
            default:
                return;
        }
        
        this.addToHistory(`${func}(${this.currentInput}) = ${result}`);
        this.currentInput = result.toString();
        this.resetScreen = true;
        this.updateDisplay();
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    clearAll() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.updateDisplay();
    }

    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }

    showError(message) {
        const display = document.querySelector('.main-display');
        display.textContent = message;
        display.classList.add('error');
        setTimeout(() => {
            display.classList.remove('error');
            this.updateDisplay();
        }, 2000);
    }

    updateDisplay() {
        const mainDisplay = document.querySelector('.main-display');
        const historyDisplay = document.querySelector('.history-display');
        const memoryIndicator = document.querySelector('.memory-indicator');
        
        mainDisplay.textContent = this.currentInput;
        
        if (this.operation != null) {
            historyDisplay.textContent = `${this.previousInput} ${this.operation}`;
        } else {
            historyDisplay.textContent = '';
        }
        
        if (this.memoryValue !== 0) {
            memoryIndicator.textContent = `M: ${this.memoryValue}`;
        } else {
            memoryIndicator.textContent = '';
        }
    }

    addToHistory(entry) {
        this.history.push(entry);
        this.historyIndex = this.history.length;
    }

    getHistoryEntry(index) {
        if (index >= 0 && index < this.history.length) {
            return this.history[index];
        }
        return null;
    }

    getMemoryValue() {
        return this.memoryValue;
    }

    setMemoryValue(value) {
        this.memoryValue = value;
        this.updateDisplay();
    }

    addToMemory(value) {
        this.memoryValue += value;
        this.updateDisplay();
    }
}