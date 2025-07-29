class AdvancedSlider {
    constructor() {
        this.slider = document.querySelector('.slider');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.paginationContainer = document.querySelector('.slider-pagination');
        this.progressBar = document.querySelector('.progress-bar');
        this.touchIndicator = document.createElement('div');
        
        this.slides = [];
        this.paginationDots = [];
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoPlayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.progressInterval = null;
        
        this.config = {
            autoPlay: true,
            autoPlayDelay: 5000,
            transitionDuration: 1000,
            parallaxIntensity: 0.2,
            lazyLoad: true,
            lazyLoadOffset: 300,
            showTitles: true,
            showDescriptions: true
        };
        
        this.init();
    }
    
    init() {
        // Create sample slides (you'll replace these with your actual images)
        this.createSampleSlides();
        
        // Initialize controls
        this.setupControls();
        
        // Initialize touch events
        this.setupTouchEvents();
        
        // Initialize keyboard navigation
        this.setupKeyboardNavigation();
        
        // Initialize auto-play if enabled
        if (this.config.autoPlay) {
            this.startAutoPlay();
        }
        
        // Initialize parallax effect
        this.setupParallax();
        
        // Show first slide
        this.goToSlide(0);
        
        // Create touch indicator for mobile
        this.createTouchIndicator();
    }
    
    createSampleSlides() {
        // This is just for demonstration - you'll replace with your actual images
        const sampleImages = [
            { 
                src: 'images/sth-ma.jpg', 
                title: 'Stunning Landscape', 
                description: 'Beautiful natural scenery with mountains and lakes' 
            },
            { 
                src: 'images/mic.jpg', 
                title: 'Urban Architecture', 
                description: 'Modern city skyline at dusk with amazing lights' 
            },
            { 
                src: 'images/taking-award-from-sir-afan.jpg', 
                title: 'Wildlife Photography', 
                description: 'Majestic wild animals in their natural habitat' 
            },
            { 
                src: 'images/mushkpoti-top.jpg', 
                title: 'Macro World', 
                description: 'Incredible details of small objects and insects' 
            },
            { 
                src: 'images/test-group-photo.jpg', 
                title: 'Macro World', 
                description: 'Incredible details of small objects and insects' 
            },
            { 
                src: 'images/with-sir-adnan.jpg', 
                title: 'Macro World', 
                description: 'Incredible details of small objects and insects' 
            },
            { 
                src: 'images/with-sir-faisal.jpg', 
                title: 'Macro World', 
                description: 'Incredible details of small objects and insects' 
            },
            { 
                src: 'images/arefeen-rohan.jpg', 
                title: 'Macro World', 
                description: 'Incredible details of small objects and insects' 
            }
        ];
        
        sampleImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.setAttribute('data-index', index);
            
            const img = document.createElement('img');
            img.className = 'slide-image';
            
            if (this.config.lazyLoad) {
                img.setAttribute('data-src', image.src);
                img.classList.add('loading');
            } else {
                img.src = image.src;
            }
            
            img.alt = image.title;
            
            const content = document.createElement('div');
            content.className = 'slide-content';
            
            if (this.config.showTitles) {
                const title = document.createElement('h2');
                title.className = 'slide-title';
                title.textContent = image.title;
                content.appendChild(title);
            }
            
            if (this.config.showDescriptions) {
                const description = document.createElement('p');
                description.className = 'slide-description';
                description.textContent = image.description;
                content.appendChild(description);
            }
            
            slide.appendChild(img);
            slide.appendChild(content);
            this.slider.appendChild(slide);
            this.slides.push(slide);
            
            // Create pagination dot
            const dot = document.createElement('div');
            dot.className = 'pagination-dot';
            dot.setAttribute('data-index', index);
            this.paginationContainer.appendChild(dot);
            this.paginationDots.push(dot);
            
            // Add click event to dot
            dot.addEventListener('click', () => {
                if (!this.isAnimating) {
                    this.goToSlide(index);
                }
            });
        });
        
        // Initialize lazy loading if enabled
        if (this.config.lazyLoad) {
            this.initLazyLoading();
        }
    }
    
    setupControls() {
        this.prevBtn.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.prevSlide();
            }
        });
        
        this.nextBtn.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.nextSlide();
            }
        });
    }
    
    setupTouchEvents() {
        this.slider.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.stopAutoPlay();
        }, { passive: true });
        
        this.slider.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            if (this.config.autoPlay) {
                this.startAutoPlay();
            }
        }, { passive: true });
        
        // Mouse drag support
        let mouseDownX = 0;
        let isDragging = false;
        
        this.slider.addEventListener('mousedown', (e) => {
            mouseDownX = e.clientX;
            isDragging = true;
            this.stopAutoPlay();
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - mouseDownX;
            
            // Add visual feedback during drag
            if (deltaX > 50) {
                this.slides[this.currentIndex].style.transform = `translate3d(${deltaX / 5}px, 0, 0)`;
                const prevIndex = this.getPrevIndex();
                this.slides[prevIndex].style.transform = `translate3d(calc(-80% + ${deltaX / 10}px), 0, -200px) rotateY(30deg)`;
                this.slides[prevIndex].style.opacity = '0.7';
            } else if (deltaX < -50) {
                this.slides[this.currentIndex].style.transform = `translate3d(${deltaX / 5}px, 0, 0)`;
                const nextIndex = this.getNextIndex();
                this.slides[nextIndex].style.transform = `translate3d(calc(80% + ${deltaX / 10}px), 0, -200px) rotateY(-30deg)`;
                this.slides[nextIndex].style.opacity = '0.7';
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const mouseUpX = e.clientX;
            const deltaX = mouseUpX - mouseDownX;
            
            // Reset transforms
            this.slides.forEach(slide => {
                slide.style.transform = '';
                slide.style.opacity = '';
            });
            
            if (deltaX > 100) {
                this.prevSlide();
            } else if (deltaX < -100) {
                this.nextSlide();
            }
            
            if (this.config.autoPlay) {
                this.startAutoPlay();
            }
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            } else if (e.key >= '1' && e.key <= '9') {
                const num = parseInt(e.key);
                if (num <= this.slides.length) {
                    this.goToSlide(num - 1);
                }
            }
        });
    }
    
    setupParallax() {
        this.slider.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) { // Only on desktop
                const rect = this.slider.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const activeSlide = this.slides[this.currentIndex];
                const img = activeSlide.querySelector('img');
                
                if (img) {
                    const moveX = (x - centerX) * this.config.parallaxIntensity;
                    const moveY = (y - centerY) * this.config.parallaxIntensity;
                    img.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
                }
            }
        });
        
        this.slider.addEventListener('mouseleave', () => {
            const activeSlide = this.slides[this.currentIndex];
            const img = activeSlide.querySelector('img');
            if (img) {
                img.style.transform = 'translate(0, 0) scale(1)';
            }
        });
    }
    
    createTouchIndicator() {
        this.touchIndicator.className = 'touch-indicator';
        this.touchIndicator.innerHTML = 'Swipe to navigate';
        document.body.appendChild(this.touchIndicator);
        
        // Hide after 5 seconds
        setTimeout(() => {
            this.touchIndicator.style.opacity = '0';
            setTimeout(() => {
                this.touchIndicator.style.display = 'none';
            }, 500);
        }, 5000);
    }
    
    handleSwipe() {
        const diff = this.touchStartX - this.touchEndX;
        
        if (diff > 50) {
            this.nextSlide();
        } else if (diff < -50) {
            this.prevSlide();
        }
    }
    
    getPrevIndex() {
        return (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    }
    
    getNextIndex() {
        return (this.currentIndex + 1) % this.slides.length;
    }
    
    prevSlide() {
        this.goToSlide(this.getPrevIndex());
    }
    
    nextSlide() {
        this.goToSlide(this.getNextIndex());
    }
    
    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.isAnimating = true;
        this.stopProgressBar();
        
        // Determine animation direction
        const direction = index > this.currentIndex || (index === 0 && this.currentIndex === this.slides.length - 1) ? 1 : -1;
        
        // Update classes
        this.slides[this.currentIndex].classList.remove('active');
        this.slides[index].classList.add('active');
        
        // Set up initial positions based on direction
        this.slides[index].style.opacity = '0';
        this.slides[index].style.transform = direction > 0 ? 
            'translate3d(80%, 0, -200px) rotateY(-30deg)' : 
            'translate3d(-80%, 0, -200px) rotateY(30deg)';
            
        // Force reflow
        this.slides[index].offsetHeight;
        
        // Animate
        this.slides[this.currentIndex].classList.remove('prev', 'next');
        this.slides[index].classList.remove('prev', 'next');
        
        if (direction > 0) {
            this.slides[this.currentIndex].classList.add('prev');
            this.slides[index].classList.add('next');
        } else {
            this.slides[this.currentIndex].classList.add('next');
            this.slides[index].classList.add('prev');
        }
        
        setTimeout(() => {
            this.slides[index].style.opacity = '1';
            this.slides[index].style.transform = 'translate3d(0, 0, 0) rotateY(0)';
            
            this.slides[this.currentIndex].style.opacity = '0.7';
            this.slides[this.currentIndex].style.transform = direction > 0 ? 
                'translate3d(-80%, 0, -200px) rotateY(30deg)' : 
                'translate3d(80%, 0, -200px) rotateY(-30deg)';
        }, 10);
        
        // Update pagination
        this.updatePagination(index);
        
        // Lazy load next images
        if (this.config.lazyLoad) {
            this.lazyLoadAdjacentImages(index);
        }
        
        // After animation completes
        setTimeout(() => {
            this.slides[this.currentIndex].classList.remove('active', 'prev', 'next');
            this.slides[this.currentIndex].style.opacity = '0';
            this.slides[this.currentIndex].style.transform = 'translate3d(0, 0, -300px) rotateY(90deg)';
            
            this.currentIndex = index;
            this.isAnimating = false;
            this.startProgressBar();
        }, this.config.transitionDuration);
    }
    
    updatePagination(index) {
        this.paginationDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.config.autoPlayDelay);
        this.startProgressBar();
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            this.stopProgressBar();
        }
    }
    
    startProgressBar() {
        if (!this.config.autoPlay) return;
        
        this.stopProgressBar();
        this.progressBar.style.width = '0%';
        
        let startTime = null;
        const duration = this.config.autoPlayDelay;
        
        const animateProgress = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            this.progressBar.style.width = `${progress * 100}%`;
            
            if (progress < 1) {
                this.progressInterval = requestAnimationFrame(animateProgress);
            }
        };
        
        this.progressInterval = requestAnimationFrame(animateProgress);
    }
    
    stopProgressBar() {
        if (this.progressInterval) {
            cancelAnimationFrame(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    initLazyLoading() {
        // This will be implemented in the lazyload.js file
        // The actual implementation will use IntersectionObserver
    }
    
    lazyLoadAdjacentImages(currentIndex) {
        // Preload next and previous images
        const indicesToLoad = [
            (currentIndex - 1 + this.slides.length) % this.slides.length,
            (currentIndex + 1) % this.slides.length
        ];
        
        indicesToLoad.forEach(index => {
            const slide = this.slides[index];
            const img = slide.querySelector('img');
            const src = img.getAttribute('data-src');
            
            if (src && !img.src) {
                img.src = src;
                img.onload = () => {
                    img.classList.remove('loading');
                };
            }
        });
    }
}

// Initialize the slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedSlider();
});