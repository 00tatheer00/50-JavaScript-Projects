import todoStorage from './storage.js';
import todoEditor from './editor.js';

class TodoUI {
    constructor() {
        this.currentView = 'all';
        this.currentSort = 'dueDate';
        this.currentFilter = 'all';
        this.searchQuery = '';
        
        this.initEventListeners();
        this.renderAll();
    }

    initEventListeners() {
        // View switching
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchView(item.dataset.view);
            });
        });
        
        // Add task button
        document.getElementById('add-task-btn').addEventListener('click', () => {
            todoEditor.openEditor();
        });
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Sort and filter controls
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });
        
        document.getElementById('filter-by').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderTasks();
        });
        
        // Search input
        document.getElementById('task-search').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderTasks();
        });
        
        // Handle task updates
        window.addEventListener('tasksUpdated', () => {
            this.renderTasks();
        });
        
        window.addEventListener('categoriesUpdated', () => {
            this.renderCategories();
            this.renderTasks(); // In case category colors changed
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
        
        this.renderTasks();
    }

    toggleTheme() {
        const isDark = document.getElementById('theme-style').getAttribute('href').includes('dark');
        const newTheme = isDark ? 'light' : 'dark';
        
        document.getElementById('theme-style').setAttribute('href', `styles/themes/${newTheme}.css`);
        
        // Update theme toggle icon
        const icon = document.querySelector('#theme-toggle i');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        
        // Save preference
        todoStorage.updateSettings({ darkMode: !isDark });
    }

    renderAll() {
        this.renderCategories();
        this.renderTags();
        this.renderTasks();
        
        // Apply saved settings
        if (todoStorage.settings.darkMode) {
            document.getElementById('theme-style').setAttribute('href', 'styles/themes/dark.css');
            document.querySelector('#theme-toggle i').className = 'fas fa-sun';
        }
        
        document.getElementById('sort-by').value = todoStorage.settings.sortBy;
        document.getElementById('filter-by').value = todoStorage.settings.filterBy;
        this.currentSort = todoStorage.settings.sortBy;
        this.currentFilter = todoStorage.settings.filterBy;
    }

    renderCategories() {
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';
        
        todoStorage.categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.innerHTML = `
                <span class="category-color" style="background-color: ${category.color}"></span>
                <span>${category.name}</span>
                <div class="category-actions">
                    <button class="icon-button small edit-category" data-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-button small delete-category" data-id="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            categoryList.appendChild(li);
            
            // Add edit event
            li.querySelector('.edit-category').addEventListener('click', (e) => {
                e.stopPropagation();
                const category = todoStorage.getCategory(e.currentTarget.dataset.id);
                todoEditor.openCategoryModal(category);
            });
            
            // Add delete event
            li.querySelector('.delete-category').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this category? Tasks will keep their category but it will be shown as "None".')) {
                    todoStorage.deleteCategory(e.currentTarget.dataset.id);
                    window.dispatchEvent(new CustomEvent('categoriesUpdated'));
                }
            });
            
            // Add click event to filter by category
            li.addEventListener('click', () => {
                this.searchQuery = '';
                document.getElementById('task-search').value = '';
                this.currentView = 'all';
                this.currentFilter = 'all';
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.toggle('active', item.dataset.view === 'all');
                });
                
                this.renderTasks(category.id);
            });
        });
    }

    renderTags() {
        const tagCloud = document.getElementById('tag-cloud');
        tagCloud.innerHTML = '';
        
        todoStorage.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.style.backgroundColor = tag.color;
            tagElement.style.color = this.getContrastColor(tag.color);
            tagElement.innerHTML = `
                ${tag.name}
                <i class="fas fa-times remove-tag" data-id="${tag.id}"></i>
            `;
            tagCloud.appendChild(tagElement);
            
            // Add click event to filter by tag
            tagElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-tag')) {
                    e.stopPropagation();
                    if (confirm('Delete this tag? It will be removed from all tasks.')) {
                        todoStorage.deleteTag(e.target.dataset.id);
                        window.dispatchEvent(new CustomEvent('categoriesUpdated')); // Re-render everything
                    }
                    return;
                }
                
                this.searchQuery = '';
                document.getElementById('task-search').value = '';
                this.currentView = 'all';
                this.currentFilter = 'all';
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.toggle('active', item.dataset.view === 'all');
                });
                
                this.renderTasks(null, tag.id);
            });
        });
    }

    renderTasks(categoryId = null, tagId = null) {
        let tasks = [...todoStorage.tasks];
        
        // Apply view filter
        switch (this.currentView) {
            case 'today':
                tasks = tasks.filter(task => {
                    if (task.completed) return false;
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    const today = new Date();
                    return dueDate.toDateString() === today.toDateString();
                });
                break;
            case 'upcoming':
                tasks = tasks.filter(task => {
                    if (task.completed) return false;
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    const today = new Date();
                    return dueDate > today;
                });
                break;
            case 'important':
                tasks = tasks.filter(task => task.important && !task.completed);
                break;
            case 'completed':
                tasks = tasks.filter(task => task.completed);
                break;
            default:
                // 'all' view - no filter
                break;
        }
        
        // Apply category filter if specified
        if (categoryId) {
            tasks = tasks.filter(task => task.category === categoryId);
        }
        
        // Apply tag filter if specified
        if (tagId) {
            tasks = tasks.filter(task => task.tags && task.tags.includes(tagId));
        }
        
        // Apply time filter
        const now = new Date();
        switch (this.currentFilter) {
            case 'today':
                tasks = tasks.filter(task => {
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    return dueDate.toDateString() === now.toDateString();
                });
                break;
            case 'week':
                tasks = tasks.filter(task => {
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    const nextWeek = new Date(now);
                    nextWeek.setDate(now.getDate() + 7);
                    return dueDate >= now && dueDate <= nextWeek;
                });
                break;
            case 'month':
                tasks = tasks.filter(task => {
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    const nextMonth = new Date(now);
                    nextMonth.setMonth(now.getMonth() + 1);
                    return dueDate >= now && dueDate <= nextMonth;
                });
                break;
            default:
                // 'all' filter - no change
                break;
        }
        
        // Apply search
        if (this.searchQuery) {
            tasks = tasks.filter(task => {
                const titleMatch = task.title.toLowerCase().includes(this.searchQuery);
                const descMatch = task.description ? 
                    task.description.toLowerCase().includes(this.searchQuery) : false;
                return titleMatch || descMatch;
            });
        }
        
        // Apply sorting
        switch (this.currentSort) {
            case 'dueDate':
                tasks.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'priority':
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'createdAt':
                tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'alphabetical':
                tasks.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        // Save current settings
        todoStorage.updateSettings({
            sortBy: this.currentSort,
            filterBy: this.currentFilter
        });
        
        // Render tasks
        const taskList = document.getElementById('task-list');
        
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>No tasks found</h3>
                    <p>Try changing your filters or add a new task</p>
                    <button id="add-task-empty" class="primary-button">
                        <i class="fas fa-plus"></i> Add Task
                    </button>
                </div>
            `;
            
            document.getElementById('add-task-empty').addEventListener('click', () => {
                todoEditor.openEditor();
            });
            
            return;
        }
        
        taskList.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-card ${task.completed ? 'completed' : ''} ${task.important ? 'important' : ''}`;
            taskElement.dataset.taskId = task.id;
            
            // Format due date
            let dueDateText = 'No due date';
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (dueDate.toDateString() === today.toDateString()) {
                    dueDateText = `Today, ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                } else {
                    dueDateText = dueDate.toLocaleString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            }
            
            // Get category
            let categoryElement = '';
            if (task.category) {
                const category = todoStorage.getCategory(task.category);
                if (category) {
                    categoryElement = `
                        <span class="task-category" style="background-color: ${category.color}20; color: ${category.color}">
                            <i class="fas fa-folder"></i> ${category.name}
                        </span>
                    `;
                }
            }
            
            // Get tags
            let tagsElement = '';
            if (task.tags && task.tags.length > 0) {
                task.tags.forEach(tagId => {
                    const tag = todoStorage.getTag(tagId);
                    if (tag) {
                        tagsElement += `
                            <span class="task-tag" style="background-color: ${tag.color}20; color: ${tag.color}">
                                <i class="fas fa-tag"></i> ${tag.name}
                            </span>
                        `;
                    }
                });
            }
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-actions">
                        <button class="icon-button small edit-task" data-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-button small delete-task" data-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-description">${task.description ? this.truncateHtml(task.description, 200) : ''}</div>
                <div class="task-footer">
                    <div class="task-meta">
                        <span class="task-due-date">
                            <i class="fas fa-calendar-day"></i> ${dueDateText}
                        </span>
                        <span class="task-priority priority-${task.priority}">
                            <i class="fas fa-${task.priority === 'high' ? 'exclamation-triangle' : task.priority === 'medium' ? 'exclamation-circle' : 'arrow-down'}"></i>
                            ${task.priority}
                        </span>
                        ${categoryElement}
                    </div>
                    <div class="task-tags">
                        ${tagsElement}
                    </div>
                </div>
            `;
            
            taskList.appendChild(taskElement);
            
            // Add edit event
            taskElement.querySelector('.edit-task').addEventListener('click', (e) => {
                e.stopPropagation();
                const task = todoStorage.getTask(e.currentTarget.dataset.id);
                todoEditor.openEditor(task);
            });
            
            // Add delete event
            taskElement.querySelector('.delete-task').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this task?')) {
                    todoStorage.deleteTask(e.currentTarget.dataset.id);
                    window.dispatchEvent(new CustomEvent('tasksUpdated'));
                }
            });
            
            // Add click event to toggle completion
            taskElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('edit-task') && !e.target.classList.contains('delete-task') && 
                    !e.target.closest('.edit-task') && !e.target.closest('.delete-task')) {
                    const task = todoStorage.getTask(taskElement.dataset.taskId);
                    todoStorage.updateTask(task.id, {
                        completed: !task.completed
                    });
                    window.dispatchEvent(new CustomEvent('tasksUpdated'));
                }
            });
        });
    }

    truncateHtml(html, maxLength) {
        // Remove HTML tags and truncate text
        const text = html.replace(/<[^>]*>/g, '');
        if (text.length <= maxLength) return html;
        
        // Find the last space before maxLength
        let truncated = text.substr(0, maxLength);
        truncated = truncated.substr(0, Math.min(truncated.length, truncated.lastIndexOf(' ')));
        
        return truncated + '...';
    }

    getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return black or white depending on luminance
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
}

const todoUI = new TodoUI();
export default todoUI;