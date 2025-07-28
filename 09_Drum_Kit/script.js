document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const drumPads = document.querySelectorAll('.drum-pad');
    const audioElements = {
        kick: document.getElementById('kick'),
        snare: document.getElementById('snare'),
        hihat: document.getElementById('hihat'),
        tom1: document.getElementById('tom1'),
        tom2: document.getElementById('tom2'),
        crash: document.getElementById('crash'),
        ride: document.getElementById('ride'),
        clap: document.getElementById('clap'),
        percussion: document.getElementById('percussion')
    };

    const masterVolume = document.getElementById('master-volume');
    const themeToggle = document.getElementById('theme-toggle');
    const recordBtn = document.getElementById('record-btn');
    const playBtn = document.getElementById('play-btn');
    const clearBtn = document.getElementById('clear-btn');
    const bpmControl = document.getElementById('bpm');
    const bpmValue = document.getElementById('bpm-value');

    // App State
    let isRecording = false;
    let recordedSounds = [];
    let startTime;
    let metronomeInterval;

    // Initialize theme from localStorage or prefer-color-scheme
    const savedTheme = localStorage.getItem('drumkit-theme') ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Set initial volume
    Object.values(audioElements).forEach(audio => {
        audio.volume = masterVolume.value;
    });

    // Event Listeners
    drumPads.forEach(pad => {
        pad.addEventListener('click', () => playSound(pad.dataset.sound));
        pad.addEventListener('transitionend', removeActiveClass);
    });

    document.addEventListener('keydown', handleKeyPress);

    masterVolume.addEventListener('input', () => {
        const volume = masterVolume.value;
        Object.values(audioElements).forEach(audio => {
            audio.volume = volume;
        });
    });

    themeToggle.addEventListener('click', toggleTheme);

    recordBtn.addEventListener('click', toggleRecording);
    playBtn.addEventListener('click', playRecording);
    clearBtn.addEventListener('click', clearRecording);

    bpmControl.addEventListener('input', () => {
        bpmValue.textContent = bpmControl.value;
    });

    // Functions
    function playSound(soundType) {
        const audio = audioElements[soundType];
        audio.currentTime = 0;
        audio.play();

        // Visual feedback
        const pad = document.querySelector(`.drum-pad[data-sound="${soundType}"]`);
        pad.classList.add('active');

        // If recording, store the sound with timestamp
        if (isRecording) {
            const timeElapsed = Date.now() - startTime;
            recordedSounds.push({
                sound: soundType,
                time: timeElapsed
            });
        }
    }

    function removeActiveClass(e) {
        if (e.propertyName === 'transform') {
            this.classList.remove('active');
        }
    }

    function handleKeyPress(e) {
        const pad = document.querySelector(`.drum-pad[data-key="${e.keyCode}"]`);
        if (pad) {
            playSound(pad.dataset.sound);
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('drumkit-theme', newTheme);
    }

    function toggleRecording() {
        isRecording = !isRecording;

        if (isRecording) {
            recordedSounds = [];
            startTime = Date.now();
            recordBtn.style.background = 'var(--pad-active)';
            recordBtn.textContent = '⏹';
        } else {
            recordBtn.style.background = '';
            recordBtn.textContent = '⏺';

            if (recordedSounds.length > 0) {
                playBtn.disabled = false;
                clearBtn.disabled = false;
            }
        }
    }

    function playRecording() {
        if (recordedSounds.length === 0) return;

        playBtn.disabled = true;
        recordBtn.disabled = true;

        // Play each sound with the recorded timing
        recordedSounds.forEach((soundObj, index) => {
            setTimeout(() => {
                playSound(soundObj.sound);

                // Re-enable buttons after last sound
                if (index === recordedSounds.length - 1) {
                    setTimeout(() => {
                        playBtn.disabled = false;
                        recordBtn.disabled = false;
                    }, 500);
                }
            }, soundObj.time);
        });
    }

    function clearRecording() {
        recordedSounds = [];
        playBtn.disabled = true;
        clearBtn.disabled = true;
    }

    // Initialize metronome (optional)
    function startMetronome() {
        const bpm = parseInt(bpmControl.value);
        const interval = (60 / bpm) * 1000;

        if (metronomeInterval) clearInterval(metronomeInterval);

        metronomeInterval = setInterval(() => {
            // Play metronome sound (could add a click sound)
            console.log('Tick');
        }, interval);
    }
});