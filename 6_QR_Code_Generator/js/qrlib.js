/**
 * Advanced QR code generation library
 */

import { generateId, showNotification } from './utils.js';

// Main QR code generation function
async function generateQRCode(options) {
    const {
        content,
        size = 300,
        errorCorrection = 'M',
        fgColor = '#000000',
        bgColor = '#ffffff',
        gradient = 'none',
        gradientColor1 = '#ff0000',
        gradientColor2 = '#0000ff',
        dots = 'square',
        logo = 'none',
        margin = 4,
        logoFile = null
    } = options;

    if (!content) {
        showNotification('Please enter content for the QR code', 'error');
        return null;
    }

    try {
        // Create QR code with qrcode-generator library
        const qr = qrcode(0, errorCorrection);
        qr.addData(content);
        qr.make();

        // Create canvas
        const canvas = document.getElementById('qr-canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = size;
        canvas.height = size;
        
        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        
        // Calculate module size
        const moduleCount = qr.getModuleCount();
        const moduleSize = (size - margin * 2) / moduleCount;
        
        // Draw QR code modules
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    const x = margin + col * moduleSize;
                    const y = margin + row * moduleSize;
                    
                    // Apply different dot styles
                    drawModule(ctx, x, y, moduleSize, fgColor, gradient, gradientColor1, gradientColor2, dots, row, col, moduleCount);
                }
            }
        }
        
        // Add logo if specified
        if (logo !== 'none') {
            await addLogo(canvas, logo, logoFile, size);
        }
        
        // Hide placeholder and show canvas
        document.getElementById('qr-placeholder').classList.add('hidden');
        canvas.style.display = 'block';
        
        // Enable download buttons
        document.getElementById('save-btn').disabled = false;
        document.getElementById('download-png').disabled = false;
        document.getElementById('download-svg').disabled = false;
        document.getElementById('download-jpg').disabled = false;
        
        // Return the image data and settings for history
        return {
            id: generateId(),
            imageData: canvas.toDataURL('image/png'),
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
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('QR generation error:', error);
        showNotification('Error generating QR code', 'error');
        return null;
    }
}

// Draw individual QR code module with different styles
function drawModule(ctx, x, y, size, color, gradient, color1, color2, style, row, col, moduleCount) {
    ctx.save();
    
    // Apply gradient if specified
    if (gradient !== 'none') {
        let gradientObj;
        if (gradient === 'linear') {
            gradientObj = ctx.createLinearGradient(x, y, x + size, y + size);
        } else { // radial
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            gradientObj = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, size / 2
            );
        }
        gradientObj.addColorStop(0, color1);
        gradientObj.addColorStop(1, color2);
        ctx.fillStyle = gradientObj;
    } else {
        ctx.fillStyle = color;
    }
    
    // Apply different dot styles
    switch (style) {
        case 'rounded':
            const radius = size * 0.2;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + size - radius, y);
            ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
            ctx.lineTo(x + size, y + size - radius);
            ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
            ctx.lineTo(x + radius, y + size);
            ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'dot':
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'extra-rounded':
            // More rounded corners
            const bigRadius = size * 0.3;
            ctx.beginPath();
            ctx.moveTo(x + bigRadius, y);
            ctx.lineTo(x + size - bigRadius, y);
            ctx.quadraticCurveTo(x + size, y, x + size, y + bigRadius);
            ctx.lineTo(x + size, y + size - bigRadius);
            ctx.quadraticCurveTo(x + size, y + size, x + size - bigRadius, y + size);
            ctx.lineTo(x + bigRadius, y + size);
            ctx.quadraticCurveTo(x, y + size, x, y + size - bigRadius);
            ctx.lineTo(x, y + bigRadius);
            ctx.quadraticCurveTo(x, y, x + bigRadius, y);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'square':
        default:
            ctx.fillRect(x, y, size, size);
            break;
    }
    
    ctx.restore();
}

// Add logo to QR code
async function addLogo(canvas, logoType, logoFile, qrSize) {
    const ctx = canvas.getContext('2d');
    const logoSize = qrSize * 0.2; // Logo size is 20% of QR code size
    const centerX = canvas.width / 2 - logoSize / 2;
    const centerY = canvas.height / 2 - logoSize / 2;
    
    try {
        let logoImg;
        
        if (logoType === 'custom' && logoFile) {
            logoImg = await loadImageFromFile(logoFile);
        } else {
            // Load sample logos (in a real app, these would be actual paths to your logo files)
            const logoPath = `assets/logos/${logoType}.png`;
            logoImg = await loadImage(logoPath);
        }
        
        // Draw white background for logo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 2, centerY - 2, logoSize + 4, logoSize + 4);
        
        // Draw logo
        ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);
    } catch (error) {
        console.error('Error adding logo:', error);
        showNotification('Error adding logo', 'error');
    }
}

// Load image from URL
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

// Load image from file input
function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Download QR code in different formats
function downloadQRCode(format) {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `qr-code-${timestamp}`;
    
    switch (format) {
        case 'png':
            Canvas2Image.saveAsPNG(canvas, filename);
            break;
        case 'jpg':
            Canvas2Image.saveAsJPEG(canvas, filename);
            break;
        case 'svg':
            // For SVG, we'd need a different approach since canvas is raster
            // This is a simplified version - in a real app you might want a proper SVG generator
            const svgContent = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
                    <image href="${canvas.toDataURL('image/png')}" width="100%" height="100%"/>
                </svg>
            `;
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            break;
    }
}

export { generateQRCode, downloadQRCode };