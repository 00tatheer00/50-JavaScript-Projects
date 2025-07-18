class TodoStorage {
    constructor() {
        this.tasks = this.loadTasks();
        this.categories = this.loadCategories();
        this.tags = this.loadTags();
        this.settings = this.loadSettings();
    }

    // Task methods
    loadTasks() {
        const tasks = localStorage.getItem('advanced-todo-tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    saveTasks() {
        localStorage.setItem('advanced-todo-tasks', JSON.stringify(this.tasks));
    }

    addTask(task) {
        task.id = Date.now().toString();
        task.createdAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();
        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    updateTask(id, updates) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            updates.updatedAt = new Date().toISOString();
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            return this.tasks[taskIndex];
        }
        return null;
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    // Category methods
    loadCategories() {
        const categories = localStorage.getItem('advanced-todo-categories');
        return categories ? JSON.parse(categories) : [
            { id: '1', name: 'Work', color: '#3a86ff' },
            { id: '2', name: 'Personal', color: '#8338ec' },
            { id: '3', name: 'Shopping', color: '#06d6a0' }
        ];
    }

    saveCategories() {
        localStorage.setItem('advanced-todo-categories', JSON.stringify(this.categories));
    }

    addCategory(category) {
        category.id = Date.now().toString();
        this.categories.push(category);
        this.saveCategories();
        return category;
    }

    updateCategory(id, updates) {
        const categoryIndex = this.categories.findIndex(c => c.id === id);
        if (categoryIndex !== -1) {
            this.categories[categoryIndex] = { ...this.categories[categoryIndex], ...updates };
            this.saveCategories();
            return this.categories[categoryIndex];
        }
        return null;
    }

    deleteCategory(id) {
        this.categories = this.categories.filter(category => category.id !== id);
        // Remove category from tasks
        this.tasks = this.tasks.map(task => {
            if (task.category === id) {
                return { ...task, category: null };
            }
            return task;
        });
        this.saveCategories();
        this.saveTasks();
    }

    getCategory(id) {
        return this.categories.find(category => category.id === id);
    }

    // Tag methods
    loadTags() {
        const tags = localStorage.getItem('advanced-todo-tags');
        return tags ? JSON.parse(tags) : [
            { id: '1', name: 'Urgent', color: '#ef476f' },
            { id: '2', name: 'Home', color: '#06d6a0' },
            { id: '3', name: 'Office', color: '#3a86ff' }
        ];
    }

    saveTags() {
        localStorage.setItem('advanced-todo-tags', JSON.stringify(this.tags));
    }

    addTag(tag) {
        tag.id = Date.now().toString();
        this.tags.push(tag);
        this.saveTags();
        return tag;
    }

    updateTag(id, updates) {
        const tagIndex = this.tags.findIndex(t => t.id === id);
        if (tagIndex !== -1) {
            this.tags[tagIndex] = { ...this.tags[tagIndex], ...updates };
            this.saveTags();
            return this.tags[tagIndex];
        }
        return null;
    }

    deleteTag(id) {
        this.tags = this.tags.filter(tag => tag.id !== id);
        // Remove tag from tasks
        this.tasks = this.tasks.map(task => {
            if (task.tags && task.tags.includes(id)) {
                return { ...task, tags: task.tags.filter(tagId => tagId !== id) };
            }
            return task;
        });
        this.saveTags();
        this.saveTasks();
    }

    getTag(id) {
        return this.tags.find(tag => tag.id === id);
    }

    // Settings methods
    loadSettings() {
        const settings = localStorage.getItem('advanced-todo-settings');
        return settings ? JSON.parse(settings) : {
            darkMode: false,
            sortBy: 'dueDate',
            filterBy: 'all'
        };
    }

    saveSettings() {
        localStorage.setItem('advanced-todo-settings', JSON.stringify(this.settings));
    }

    updateSettings(updates) {
        this.settings = { ...this.settings, ...updates };
        this.saveSettings();
        return this.settings;
    }
}

const todoStorage = new TodoStorage();
export default todoStorage;