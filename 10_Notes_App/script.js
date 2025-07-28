
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const notesGrid = document.getElementById('notesGrid');
    const pinnedNotesGrid = document.getElementById('pinnedNotesGrid');
    const pinnedNotesContainer = document.getElementById('pinnedNotesContainer');
    const allNotesContainer = document.getElementById('allNotesContainer');
    const emptyState = document.getElementById('emptyState');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
    const noteModal = document.getElementById('noteModal');
    const deleteModal = document.getElementById('deleteModal');
    const noteForm = document.getElementById('noteForm');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const noteId = document.getElementById('noteId');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const searchInput = document.getElementById('searchInput');
    const themeToggle = document.getElementById('themeToggle');
    const toast = document.getElementById('toast');

    // Color options yahan
    const colorOptions = document.querySelectorAll('.color-option');
    let selectedColor = '#ffffff';

    // State
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let noteToDelete = null;
    let draggedNote = null;

    // Initialize
    renderNotes();
    checkEmptyState();
    checkPinnedNotes();

    // Event Listeners
    addNoteBtn.addEventListener('click', openAddNoteModal);
    emptyStateAddBtn.addEventListener('click', openAddNoteModal);
    noteForm.addEventListener('submit', saveNote);
    closeModalBtn.addEventListener('click', closeNoteModal);
    cancelBtn.addEventListener('click', closeNoteModal);
    closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    searchInput.addEventListener('input', filterNotes);
    themeToggle.addEventListener('click', toggleTheme);

    // Color selection
    colorOptions.forEach(option => {
        option.addEventListener('click', function () {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.getAttribute('data-color');
        });
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Functions
    function renderNotes(filteredNotes = null) {
        const notesToRender = filteredNotes || notes;

        // Clear the grids
        notesGrid.innerHTML = '';
        pinnedNotesGrid.innerHTML = '';

        if (notesToRender.length === 0) {
            return;
        }

        notesToRender.forEach((note, index) => {
            const noteElement = createNoteElement(note, index);
            if (note.pinned) {
                pinnedNotesGrid.appendChild(noteElement);
            } else {
                notesGrid.appendChild(noteElement);
            }
        });

        // Initialize drag and drop for notes
        initDragAndDrop();
    }

    function createNoteElement(note, index) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.setAttribute('data-id', note.id);
        noteElement.style.backgroundColor = note.color || '#ffffff';
        noteElement.draggable = true;

        const date = new Date(note.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        noteElement.innerHTML = `
                    <div class="note-header">
                        <h3 class="note-title">${note.title}</h3>
                        <div class="note-actions">
                            <button class="note-btn pin ${note.pinned ? 'active' : ''}" data-id="${note.id}" title="${note.pinned ? 'Unpin' : 'Pin'}">
                                📌
                            </button>
                            <button class="note-btn edit" data-id="${note.id}" title="Edit">
                                ✏️
                            </button>
                            <button class="note-btn delete" data-id="${note.id}" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="note-content">${note.content}</div>
                    <div class="note-footer">
                        <div class="note-date">${formattedDate}</div>
                        <div class="note-color" style="background-color: ${note.color || '#ffffff'};"></div>
                    </div>
                `;

        // Add event listeners to the buttons
        noteElement.querySelector('.edit').addEventListener('click', () => openEditNoteModal(note.id));
        noteElement.querySelector('.delete').addEventListener('click', () => openDeleteModal(note.id));
        noteElement.querySelector('.pin').addEventListener('click', () => togglePinNote(note.id));

        // Drag events
        noteElement.addEventListener('dragstart', handleDragStart);
        noteElement.addEventListener('dragover', handleDragOver);
        noteElement.addEventListener('dragleave', handleDragLeave);
        noteElement.addEventListener('drop', handleDrop);
        noteElement.addEventListener('dragend', handleDragEnd);

        return noteElement;
    }

    function openAddNoteModal() {
        document.getElementById('modalTitle').textContent = 'Add New Note';
        noteId.value = '';
        noteTitle.value = '';
        noteContent.value = '';
        selectedColor = '#ffffff';
        colorOptions.forEach(opt => {
            opt.classList.remove('selected');
            if (opt.getAttribute('data-color') === '#ffffff') {
                opt.classList.add('selected');
            }
        });
        noteModal.classList.add('active');
    }

    function openEditNoteModal(id) {
        const note = notes.find(note => note.id === id);
        if (note) {
            document.getElementById('modalTitle').textContent = 'Edit Note';
            noteId.value = note.id;
            noteTitle.value = note.title;
            noteContent.value = note.content;
            selectedColor = note.color || '#ffffff';

            colorOptions.forEach(opt => {
                opt.classList.remove('selected');
                if (opt.getAttribute('data-color') === selectedColor) {
                    opt.classList.add('selected');
                }
            });

            noteModal.classList.add('active');
        }
    }

    function closeNoteModal() {
        noteModal.classList.remove('active');
    }

    function openDeleteModal(id) {
        noteToDelete = id;
        deleteModal.classList.add('active');
    }

    function closeDeleteModal() {
        noteToDelete = null;
        deleteModal.classList.remove('active');
    }

    function confirmDelete() {
        if (noteToDelete) {
            deleteNote(noteToDelete);
            closeDeleteModal();
        }
    }

    function saveNote(e) {
        e.preventDefault();

        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();

        if (!title || !content) {
            showToast('Please fill in all fields');
            return;
        }

        const now = new Date();

        if (noteId.value) {
            // Update existing note
            const index = notes.findIndex(note => note.id === noteId.value);
            if (index !== -1) {
                notes[index] = {
                    ...notes[index],
                    title,
                    content,
                    color: selectedColor,
                    date: now.toISOString()
                };
            }
        } else {
            // Add new note
            const newNote = {
                id: Date.now().toString(),
                title,
                content,
                color: selectedColor,
                date: now.toISOString(),
                pinned: false
            };
            notes.unshift(newNote);
        }

        saveToLocalStorage();
        renderNotes();
        closeNoteModal();
        checkEmptyState();
        checkPinnedNotes();
        showToast(noteId.value ? 'Note updated successfully' : 'Note added successfully');
    }

    function deleteNote(id) {
        notes = notes.filter(note => note.id !== id);
        saveToLocalStorage();
        renderNotes();
        checkEmptyState();
        checkPinnedNotes();
        showToast('Note deleted successfully');
    }

    function togglePinNote(id) {
        const index = notes.findIndex(note => note.id === id);
        if (index !== -1) {
            notes[index].pinned = !notes[index].pinned;
            saveToLocalStorage();
            renderNotes();
            checkPinnedNotes();
            showToast(notes[index].pinned ? 'Note pinned' : 'Note unpinned');
        }
    }

    function filterNotes() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            renderNotes();
            return;
        }

        const filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );

        renderNotes(filteredNotes);
    }

    function checkEmptyState() {
        if (notes.length === 0) {
            emptyState.style.display = 'block';
            allNotesContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            allNotesContainer.style.display = 'block';
        }
    }

    function checkPinnedNotes() {
        const pinnedNotes = notes.filter(note => note.pinned);
        if (pinnedNotes.length > 0) {
            pinnedNotesContainer.style.display = 'block';
        } else {
            pinnedNotesContainer.style.display = 'none';
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    }

    // Drag and Drop functions
    function initDragAndDrop() {
        const noteElements = document.querySelectorAll('.note');
        noteElements.forEach(note => {
            note.addEventListener('dragstart', handleDragStart);
            note.addEventListener('dragover', handleDragOver);
            note.addEventListener('dragleave', handleDragLeave);
            note.addEventListener('drop', handleDrop);
            note.addEventListener('dragend', handleDragEnd);
        });
    }

    function handleDragStart(e) {
        draggedNote = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        this.classList.remove('drag-over');

        if (draggedNote !== this) {
            // Get the IDs of the dragged note and the target note
            const draggedId = draggedNote.getAttribute('data-id');
            const targetId = this.getAttribute('data-id');

            // Find the indices of the notes in the array
            const draggedIndex = notes.findIndex(note => note.id === draggedId);
            const targetIndex = notes.findIndex(note => note.id === targetId);

            // Reorder the array
            if (draggedIndex !== -1 && targetIndex !== -1) {
                const [removed] = notes.splice(draggedIndex, 1);
                notes.splice(targetIndex, 0, removed);
                saveToLocalStorage();
                renderNotes();
            }
        }
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        const noteElements = document.querySelectorAll('.note');
        noteElements.forEach(note => {
            note.classList.remove('drag-over');
        });
    }
});