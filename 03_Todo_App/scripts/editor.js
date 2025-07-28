import todoStorage from './storage.js';

class TodoEditor {
    constructor() {
        this.editor = null;
        this.currentTaskId = null;
        this.initEditor();
        this.setupEventListeners();
    }

    initEditor() {
        this.editor = new Quill('#editor-container', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'direction': 'rtl' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['clean']
                ]
            },
            placeholder: 'Enter task description...'
        });
    }

    setupEventListeners() {
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        document.getElementById('cancel-task').addEventListener('click', () => {
            this.closeEditor();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeEditor();
        });

        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.openCategoryModal();
        });

        document.getElementById('add-tag-btn').addEventListener('click', () => {
            this.openTagModal();
        });

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        document.getElementById('cancel-category').addEventListener('click', () => {
            this.closeCategoryModal();
        });

        document.getElementById('close-category-modal').addEventListener('click', () => {
            this.closeCategoryModal();
        });

        // Tag input functionality
        const tagInput = document.getElementById('task-tags');
        const tagInputField = document.createElement('input');
        tagInputField.type = 'text';
        tagInputField.placeholder = 'Add tags...';
        tagInput.appendChild(tagInputField);

        tagInputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tagName = tagInputField.value.trim();
                if (tagName) {
                    this.addTagToTask(tagName);
                    tagInputField.value = '';
                }
            }
        });

        tagInput.addEventListener('click', () => {
            tagInputField.focus();
        });
    }

    openEditor(task = null) {
        this.currentTaskId = task ? task.id : null;
        document.getElementById('modal-title').textContent = task ? 'Edit Task' : 'Add New Task';
        
        // Populate form fields
        document.getElementById('task-title').value = task ? task.title : '';
        
        if (task && task.description) {
            this.editor.root.innerHTML = task.description;
        } else {
            this.editor.root.innerHTML = '';
        }
        
        document.getElementById('task-due-date').value = task && task.dueDate ? 
            new Date(task.dueDate).toISOString().slice(0, 16) : '';
        
        document.getElementById('task-priority').value = task ? task.priority || 'medium' : 'medium';
        document.getElementById('task-important').checked = task ? task.important || false : false;
        document.getElementById('task-completed').checked = task ? task.completed || false : false;
        
        // Populate category select
        const categorySelect = document.getElementById('task-category');
        categorySelect.innerHTML = '<option value="">None</option>';
        todoStorage.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            if (task && task.category === category.id) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
        
        // Populate tags
        const tagInput = document.getElementById('task-tags');
        tagInput.innerHTML = '';
        const tagInputField = document.createElement('input');
        tagInputField.type = 'text';
        tagInputField.placeholder = 'Add tags...';
        tagInput.appendChild(tagInputField);
        
        if (task && task.tags) {
            task.tags.forEach(tagId => {
                const tag = todoStorage.getTag(tagId);
                if (tag) {
                    this.addTagToTask(tag.name, tagId);
                }
            });
        }
        
        document.getElementById('task-editor-modal').classList.add('active');
    }

    closeEditor() {
        document.getElementById('task-editor-modal').classList.remove('active');
        this.currentTaskId = null;
    }

    saveTask() {
        const title = document.getElementById('task-title').value.trim();
        if (!title) {
            alert('Task title is required');
            return;
        }
        
        const description = this.editor.root.innerHTML;
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value || null;
        const important = document.getElementById('task-important').checked;
        const completed = document.getElementById('task-completed').checked;
        
        // Get tags from the tag input
        const tagElements = document.getElementById('task-tags').querySelectorAll('.tag-item');
        const tags = Array.from(tagElements).map(el => el.dataset.tagId);
        
        const taskData = {
            title,
            description,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            priority,
            category,
            tags,
            important,
            completed,
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentTaskId) {
            // Update existing task
            todoStorage.updateTask(this.currentTaskId, taskData);
        } else {
            // Add new task
            todoStorage.addTask(taskData);
        }
        
        this.closeEditor();
        window.dispatchEvent(new CustomEvent('tasksUpdated'));
    }

    addTagToTask(tagName, tagId = null) {
        let tag = null;
        
        if (tagId) {
            tag = todoStorage.getTag(tagId);
        } else {
            // Check if tag exists by name
            const existingTag = todoStorage.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
            
            if (existingTag) {
                tag = existingTag;
            } else {
                // Create new tag
                tag = todoStorage.addTag({
                    name: tagName,
                    color: this.getRandomColor()
                });
            }
        }
        
        const tagElement = document.createElement('span');
        tagElement.className = 'tag-item';
        tagElement.dataset.tagId = tag.id;
        tagElement.innerHTML = `
            ${tag.name}
            <i class="fas fa-times remove-tag"></i>
        `;
        
        const tagInput = document.getElementById('task-tags');
        tagInput.insertBefore(tagElement, tagInput.lastElementChild);
        
        tagElement.querySelector('.remove-tag').addEventListener('click', (e) => {
            e.stopPropagation();
            tagElement.remove();
        });
    }

    getRandomColor() {
        const colors = ['#3a86ff', '#8338ec', '#06d6a0', '#ffbe0b', '#ef476f', '#ff006e', '#fb5607'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    openCategoryModal(category = null) {
        this.currentCategoryId = category ? category.id : null;
        document.getElementById('category-modal-title').textContent = category ? 'Edit Category' : 'Add New Category';
        
        document.getElementById('category-name').value = category ? category.name : '';
        document.getElementById('category-color').value = category ? category.color : '#3a86ff';
        
        document.getElementById('category-modal').classList.add('active');
    }

    closeCategoryModal() {
        document.getElementById('category-modal').classList.remove('active');
        this.currentCategoryId = null;
    }

    saveCategory() {
        const name = document.getElementById('category-name').value.trim();
        if (!name) {
            alert('Category name is required');
            return;
        }
        
        const color = document.getElementById('category-color').value;
        
        const categoryData = {
            name,
            color
        };
        
        if (this.currentCategoryId) {
            // Update existing category
            todoStorage.updateCategory(this.currentCategoryId, categoryData);
        } else {
            // Add new category
            todoStorage.addCategory(categoryData);
        }
        
        this.closeCategoryModal();
        window.dispatchEvent(new CustomEvent('categoriesUpdated'));
    }

    openTagModal(tag = null) {
        // Similar to category modal but for tags
        // Implementation would be similar to category modal
        console.log('Tag modal would open here');
    }
}

const todoEditor = new TodoEditor();
export default todoEditor;