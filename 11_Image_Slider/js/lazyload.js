class LazyLoader {
    constructor() {
        this.observer = null;
        this.config = {
            rootMargin: '300px',
            threshold: 0.01
        };
        
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, this.config);
            
            this.observeImages();
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadAllImages();
        }
    }
    
    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            this.observer.observe(img);
        });
    }
    
    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;
        
        img.src = src;
        img.onload = () => {
            img.classList.remove('loading');
        };
        img.removeAttribute('data-src');
    }
    
    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            this.loadImage(img);
        });
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', () => {
    new LazyLoader();
});