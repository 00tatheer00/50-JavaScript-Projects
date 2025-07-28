import todoStorage from './storage.js';
import todoUI from './ui.js';
import todoEditor from './editor.js';
import todoDragDrop from './dragdrop.js';
import todoNotifications from './notifications.js';

class TodoApp {
    constructor() {
        console.log('Advanced Todo Pro initialized');
        
        // Initialize all modules
        this.storage = todoStorage;
        this.ui = todoUI;
        this.editor = todoEditor;
        this.dragDrop = todoDragDrop;
        this.notifications = todoNotifications;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TodoApp();
});

// Make app available globally for debugging
window.todoApp = new TodoApp();