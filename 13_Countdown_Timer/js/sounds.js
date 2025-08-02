/**
 * Sound management for the timer
 */

class SoundManager {
    constructor() {
        this.sounds = {
            alarm: new Audio('sounds/alarm.mp3'),
            alert: new Audio('sounds/alert.mp3'),
            tick: new Audio('sounds/tick.mp3')
        };
        
        this.enabled = true;
        this.tickEnabled = false;
        this.tickInterval = null;
    }
    
    // Play a sound
    play(soundName) {
        if (!this.enabled) return;
        
        try {
            const sound = this.sounds[soundName];
            sound.currentTime = 0;
            sound.play().catch(e => console.error('Sound play failed:', e));
        } catch (e) {
            console.error('Sound error:', e);
        }
    }
    
    // Toggle all sounds
    toggleSounds(enable) {
        this.enabled = enable;
        if (!enable) {
            this.stopTick();
        }
    }
    
    // Toggle tick sound
    toggleTick(enable) {
        this.tickEnabled = enable;
        if (!enable) {
            this.stopTick();
        }
    }
    
    // Start tick sound (for each second)
    startTick() {
        if (!this.enabled || !this.tickEnabled || this.tickInterval) return;
        
        this.tickInterval = setInterval(() => {
            this.play('tick');
        }, 1000);
    }
    
    // Stop tick sound
    stopTick() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
    }
}

export const soundManager = new SoundManager();