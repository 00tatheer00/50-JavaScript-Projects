/**
 * Local storage management for presets and settings
 */

const STORAGE_KEY = 'quantumCountdownSettings';

export class StorageManager {
    constructor() {
        this.settings = this.loadSettings();
    }
    
    // Load settings from localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {
                presets: [],
                theme: 'dark',
                soundEnabled: true,
                tickSoundEnabled: false,
                lastMode: 'countdown'
            };
        } catch (e) {
            console.error('Failed to load settings:', e);
            return this.getDefaultSettings();
        }
    }
    
    // Get default settings
    getDefaultSettings() {
        return {
            presets: [],
            theme: 'dark',
            soundEnabled: true,
            tickSoundEnabled: false,
            lastMode: 'countdown'
        };
    }
    
    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }
    
    // Add a new preset
    addPreset(name, settings) {
        const preset = {
            id: Date.now().toString(),
            name,
            settings,
            createdAt: new Date().toISOString()
        };
        
        this.settings.presets.unshift(preset);
        this.saveSettings();
        return preset;
    }
    
    // Remove a preset
    removePreset(id) {
        this.settings.presets = this.settings.presets.filter(p => p.id !== id);
        this.saveSettings();
    }
    
    // Update a setting
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    // Get all presets
    getPresets() {
        return this.settings.presets;
    }
    
    // Clear all data
    clearAll() {
        localStorage.removeItem(STORAGE_KEY);
        this.settings = this.getDefaultSettings();
    }
}

export const storageManager = new StorageManager();