/**
 * Main application logic for the QR code generator
 */

import { generateQRCode, downloadQRCode } from './qrlib.js';
import { saveToHistory, initHistory, renderHistory } from './storage.js';
import { showNotification, debounce } from './utils.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    initUI();
    
    // Initialize history section
    initHistory();
    
    // Set up theme toggle
    setupThemeToggle();
});

function initUI() {
    // Get DOM elements
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const downloadPngBtn = document.getElementById('download-png');
    const downloadSvgBtn = document.getElementById('download-svg');
    const downloadJpgBtn = document.getElementById('download-jpg');
    const qrContent = document.getElementById('qr-content');
    const qrSize = document.getElementById('qr-size');
    const sizeValue = document.getElementById('size-value');
    const qrMargin = document.getElementById('qr-margin');
    const marginValue = document.getElementById('margin-value');
    const qrGradient = document.getElementById('qr-gradient');
    const gradientColors = document.getElementById('gradient-colors');
    const qrLogo = document.getElementById('qr-logo');
    const logoUpload = document.getElementById('logo-upload');
    
    // Update size value display
    qrSize.addEventListener('input', () => {
        sizeValue.textContent = `${qrSize.value}px`;
    });
    
    // Update margin value display
    qrMargin.addEventListener('input', () => {
        marginValue.textContent = qrMargin.value;
    });
    
    // Show/hide gradient color pickers
    qrGradient.addEventListener('change', () => {
        if (qrGradient.value !== 'none') {
            gradientColors.classList.remove('hidden');
        } else {
            gradientColors.classList.add('hidden');
        }
    });
    
    // Handle logo selection
    qrLogo.addEventListener('change', () => {
        if (qrLogo.value === 'custom') {
            logoUpload.click();
        }
    });
    
    // Handle logo file upload
    logoUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            // You could add validation for file type/size here
            showNotification('Custom logo selected', 'success');
        }
    });
    
    // Generate QR code when button is clicked
    generateBtn.addEventListener('click', async () => {
        const content = qrContent.value.trim();
        const size = parseInt(qrSize.value);
        const errorCorrection = document.getElementById('qr-error-correction').value;
        const fgColor = document.getElementById('qr-fg-color').value;
        const bgColor = document.getElementById('qr-bg-color').value;
        const gradient = qrGradient.value;
        const gradientColor1 = document.getElementById('qr-gradient-color1').value;
        const gradientColor2 = document.getElementById('qr-gradient-color2').value;
        const dots = document.getElementById('qr-dots').value;
        const logo = qrLogo.value;
        const margin = parseInt(qrMargin.value);
        const logoFile = logo === 'custom' && logoUpload.files.length > 0 ? logoUpload.files[0] : null;
        
        const qrData = await generateQRCode({
            content,
            size,
            errorCorrection,
            fgColor,
            bgColor,
            gradient,
            gradientColor1,
            gradientColor2,
            dots,
            logo,
            margin,
            logoFile
        });
        
        if (qrData) {
            // Save to history
            saveToHistory(qrData);
            renderHistory();
            
            showNotification('QR code generated successfully!', 'success');
        }
    });
    
    // Save QR code to history (this is already handled in generateQRCode)
    saveBtn.addEventListener('click', () => {
        showNotification('QR code saved to history', 'info');
    });
    
    // Download buttons
    downloadPngBtn.addEventListener('click', () => downloadQRCode('png'));
    downloadSvgBtn.addEventListener('click', () => downloadQRCode('svg'));
    downloadJpgBtn.addEventListener('click', () => downloadQRCode('jpg'));
    
    // Debounce content input for auto-preview (optional)
    qrContent.addEventListener('input', debounce(() => {
        if (qrContent.value.trim().length > 0) {
            generateBtn.click();
        }
    }, 1000));
    
    // Add example content button (optional)
    const exampleBtn = document.createElement('button');
    exampleBtn.textContent = 'Load Example';
    exampleBtn.className = 'btn-secondary';
    exampleBtn.style.marginTop = '10px';
    exampleBtn.addEventListener('click', () => {
        qrContent.value = 'https://github.com';
        document.getElementById('qr-fg-color').value = '#4a6bff';
        document.getElementById('qr-gradient').value = 'linear';
        document.getElementById('qr-dots').value = 'rounded';
        generateBtn.click();
    });
    qrContent.parentNode.appendChild(exampleBtn);
}

function setupThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.title = 'Toggle Dark Mode';
    document.body.appendChild(themeToggle);
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('proQR_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('proQR_theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('proQR_theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}