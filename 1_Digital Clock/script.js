// Initialize particles.js
particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": ["#0ff", "#f0f", "#ff0"]
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            }
        },
        "opacity": {
            "value": 0.5,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 2,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.2,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 1,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": true,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "grab"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 140,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});

// Clock functionality
let is24HourFormat = false;
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const ampmElement = document.getElementById('ampm');
const dateElement = document.getElementById('date');
const format12Btn = document.getElementById('format12');
const format24Btn = document.getElementById('format24');

function updateClock() {
    const now = new Date();

    // Update time
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    let ampm = '';
    if (!is24HourFormat) {
        ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
    }

    hoursElement.textContent = String(hours).padStart(2, '0');
    minutesElement.textContent = minutes;
    secondsElement.textContent = seconds;
    ampmElement.textContent = ampm;

    // Update date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);

    // Dynamic color change
    const hue = (now.getSeconds() * 6) % 360;
    const primaryColor = `hsl(${hue}, 100%, 50%)`;
    const secondaryColor = `hsl(${(hue + 120) % 360}, 100%, 50%)`;

    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);

    // Animate seconds for extra effect
    secondsElement.style.transform = `scale(${1 + Math.sin(now.getMilliseconds() / 500) * 0.1})`;
}

// Format toggle
format12Btn.addEventListener('click', () => {
    is24HourFormat = false;
    format12Btn.classList.add('active');
    format24Btn.classList.remove('active');
    ampmElement.style.display = 'inline';
});

format24Btn.addEventListener('click', () => {
    is24HourFormat = true;
    format24Btn.classList.add('active');
    format12Btn.classList.remove('active');
    ampmElement.style.display = 'none';
});

// Initial update and set interval
updateClock();
setInterval(updateClock, 1000);

// Mouse move effect for 3D tilt
document.addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    document.querySelector('.clock-container').style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});