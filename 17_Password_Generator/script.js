document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const passwordField = document.getElementById('password');
    const copyBtn = document.getElementById('copy-btn');
    const lengthSlider = document.getElementById('length-slider');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const generateBtn = document.getElementById('generate-btn');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    const historyList = document.getElementById('history-list');
    const historyClear = document.getElementById('history-clear');
    const toast = document.getElementById('toast');

    // Character sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Update length value when slider changes
    lengthSlider.addEventListener('input', function () {
        lengthValue.textContent = lengthSlider.value;
        generatePassword();
    });

    // Generate password when any option changes
    [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', generatePassword);
    });

    // Generate password on button click
    generateBtn.addEventListener('click', generatePassword);

    // Copy password to clipboard
    copyBtn.addEventListener('click', function () {
        if (passwordField.value) {
            navigator.clipboard.writeText(passwordField.value).then(function () {
                showToast('Password copied to clipboard!');
            }).catch(function () {
                showToast('Failed to copy password');
            });
        }
    });

    // Clear history
    historyClear.addEventListener('click', function () {
        historyList.innerHTML = '';
        localStorage.removeItem('passwordHistory');
    });

    // Generate password function
    function generatePassword() {
        let charset = '';
        let password = '';

        // Build character set based on selected options
        if (uppercaseCheckbox.checked) charset += uppercaseChars;
        if (lowercaseCheckbox.checked) charset += lowercaseChars;
        if (numbersCheckbox.checked) charset += numberChars;
        if (symbolsCheckbox.checked) charset += symbolChars;

        // If no character type is selected, use all
        if (!charset) {
            charset = uppercaseChars + lowercaseChars + numberChars;
            uppercaseCheckbox.checked = true;
            lowercaseCheckbox.checked = true;
            numbersCheckbox.checked = true;
        }

        // Generate password
        const length = parseInt(lengthSlider.value);
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        // Display password
        passwordField.value = password;

        // Update strength indicator
        updateStrengthIndicator(password);

        // Add to history
        addToHistory(password);
    }

    // Update strength indicator
    function updateStrengthIndicator(password) {
        let strength = 0;

        // Length factor
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (password.length >= 16) strength += 1;

        // Character variety factor
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 2;

        // Update UI
        let strengthPercent = 0;
        let strengthLabel = '';

        if (strength <= 2) {
            strengthPercent = 33;
            strengthLabel = 'Weak';
            strengthFill.style.backgroundColor = '#e74c3c';
        } else if (strength <= 4) {
            strengthPercent = 66;
            strengthLabel = 'Medium';
            strengthFill.style.backgroundColor = '#f39c12';
        } else {
            strengthPercent = 100;
            strengthLabel = 'Strong';
            strengthFill.style.backgroundColor = '#2ecc71';
        }

        strengthFill.style.width = strengthPercent + '%';
        strengthText.textContent = strengthLabel;
    }

    // Add password to history
    function addToHistory(password) {
        // Create history item
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const historyPassword = document.createElement('div');
        historyPassword.className = 'history-password';
        historyPassword.textContent = password;

        const historyCopy = document.createElement('button');
        historyCopy.className = 'history-copy';
        historyCopy.innerHTML = '<i class="fas fa-copy"></i>';
        historyCopy.title = 'Copy password';

        historyCopy.addEventListener('click', function () {
            navigator.clipboard.writeText(password).then(function () {
                showToast('Password copied to clipboard!');
            }).catch(function () {
                showToast('Failed to copy password');
            });
        });

        historyItem.appendChild(historyPassword);
        historyItem.appendChild(historyCopy);

        // Add to top of history list
        if (historyList.firstChild) {
            historyList.insertBefore(historyItem, historyList.firstChild);
        } else {
            historyList.appendChild(historyItem);
        }

        // Limit history to 10 items
        if (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }

        // Save to localStorage
        saveHistory();
    }

    // Save history to localStorage
    function saveHistory() {
        const passwords = [];
        const historyItems = historyList.querySelectorAll('.history-password');

        historyItems.forEach(item => {
            passwords.push(item.textContent);
        });

        localStorage.setItem('passwordHistory', JSON.stringify(passwords));
    }

    // Load history from localStorage
    function loadHistory() {
        const savedHistory = localStorage.getItem('passwordHistory');

        if (savedHistory) {
            const passwords = JSON.parse(savedHistory);

            passwords.forEach(password => {
                // Create history item
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';

                const historyPassword = document.createElement('div');
                historyPassword.className = 'history-password';
                historyPassword.textContent = password;

                const historyCopy = document.createElement('button');
                historyCopy.className = 'history-copy';
                historyCopy.innerHTML = '<i class="fas fa-copy"></i>';
                historyCopy.title = 'Copy password';

                historyCopy.addEventListener('click', function () {
                    navigator.clipboard.writeText(password).then(function () {
                        showToast('Password copied to clipboard!');
                    }).catch(function () {
                        showToast('Failed to copy password');
                    });
                });

                historyItem.appendChild(historyPassword);
                historyItem.appendChild(historyCopy);

                historyList.appendChild(historyItem);
            });
        }
    }

    // Show toast notification
    function showToast(message) {
        toast.textContent = message;
        toast.style.opacity = '1';

        setTimeout(function () {
            toast.style.opacity = '0';
        }, 2000);
    }

    // Initialize
    generatePassword();
    loadHistory();
});