/**
 * Handles local storage for QR code history
 */

const HISTORY_KEY = 'proQR_history';
const MAX_HISTORY_ITEMS = 20;

// Save QR code to history
function saveToHistory(qrData) {
    let history = getHistory();
    
    // Check if this QR already exists in history
    const existingIndex = history.findIndex(item => item.content === qrData.content && 
                                                 item.fgColor === qrData.fgColor && 
                                                 item.bgColor === qrData.bgColor);
    
    if (existingIndex !== -1) {
        // Remove existing item to move it to the top
        history.splice(existingIndex, 1);
    }
    
    // Add new item to the beginning of the array
    history.unshift(qrData);
    
    // Limit history size
    if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// Get QR code history
function getHistory() {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
}

// Clear QR code history
function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
}

// Render history to the UI
function renderHistory() {
    const history = getHistory();
    const historyList = document.getElementById('history-list');
    
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No QR codes generated yet</p>';
        return;
    }
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <img src="${item.imageData}" alt="QR Code">
            <p>${item.content.length > 20 ? item.content.substring(0, 20) + '...' : item.content}</p>
        `;
        
        historyItem.addEventListener('click', () => {
            // Fill the form with the history item's data
            document.getElementById('qr-content').value = item.content;
            document.getElementById('qr-size').value = item.size;
            document.getElementById('qr-error-correction').value = item.errorCorrection;
            document.getElementById('qr-fg-color').value = item.fgColor;
            document.getElementById('qr-bg-color').value = item.bgColor;
            document.getElementById('qr-gradient').value = item.gradient || 'none';
            document.getElementById('qr-dots').value = item.dots || 'square';
            document.getElementById('qr-logo').value = item.logo || 'none';
            document.getElementById('qr-margin').value = item.margin || 4;
            
            // Update the displayed values
            document.getElementById('size-value').textContent = `${item.size}px`;
            document.getElementById('margin-value').textContent = item.margin || 4;
            
            // Trigger generation
            document.getElementById('generate-btn').click();
        });
        
        historyList.appendChild(historyItem);
    });
}

// Initialize history section
function initHistory() {
    const historySection = document.querySelector('.history-section');
    if (historySection) {
        historySection.classList.remove('hidden');
        renderHistory();
        
        document.getElementById('clear-history')?.addEventListener('click', () => {
            clearHistory();
            renderHistory();
            showNotification('History cleared', 'success');
        });
    }
}

export { saveToHistory, getHistory, clearHistory, renderHistory, initHistory };