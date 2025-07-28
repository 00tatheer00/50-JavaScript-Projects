class TodoNotifications {
    constructor() {
        this.checkPermissions();
        this.setupReminderChecks();
    }

    checkPermissions() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }
        
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }
    }

    setupReminderChecks() {
        // Check for due tasks every minute
        setInterval(() => {
            this.checkDueTasks();
        }, 60000);
        
        // Initial check
        this.checkDueTasks();
    }

    checkDueTasks() {
        if (Notification.permission !== 'granted') return;
        
        const now = new Date();
        const tasks = todoStorage.tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            
            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate.getTime() - now.getTime();
            const minutesDiff = timeDiff / (1000 * 60);
            
            // Notify if task is due within 15 minutes or is overdue
            return minutesDiff <= 15 && minutesDiff > -60; // -60 to avoid showing notifications for very old tasks
        });
        
        tasks.forEach(task => {
            this.showNotification(task);
        });
    }

    showNotification(task) {
        // Check if we've already notified for this task recently
        const lastNotified = localStorage.getItem(`task-notified-${task.id}`);
        if (lastNotified) {
            const lastNotifiedTime = new Date(lastNotified);
            const now = new Date();
            const hoursDiff = (now.getTime() - lastNotifiedTime.getTime()) / (1000 * 60 * 60);
            
            if (hoursDiff < 1) return; // Only notify once per hour for the same task
        }
        
        const dueDate = new Date(task.dueDate);
        const options = {
            body: `Due: ${dueDate.toLocaleString()}\n${task.description ? task.description.replace(/<[^>]*>/g, '').substring(0, 100) : ''}`,
            icon: '/assets/notification-icon.png',
            tag: `task-reminder-${task.id}`
        };
        
        new Notification(`Task Due: ${task.title}`, options);
        
        // Remember that we've notified for this task
        localStorage.setItem(`task-notified-${task.id}`, new Date().toISOString());
    }

    showCustomNotification(title, message) {
        if (Notification.permission !== 'granted') return;
        
        new Notification(title, {
            body: message,
            icon: '/assets/notification-icon.png'
        });
    }
}

const todoNotifications = new TodoNotifications();
export default todoNotifications;