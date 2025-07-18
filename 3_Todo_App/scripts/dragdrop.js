import todoStorage from './storage.js';

class TodoDragDrop {
    constructor() {
        this.initSortable();
    }

    initSortable() {
        const taskList = document.getElementById('task-list');
        
        new Sortable(taskList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: (evt) => {
                // We could implement custom sorting logic here if needed
                console.log('Task moved', evt.oldIndex, evt.newIndex);
            }
        });
    }
}

const todoDragDrop = new TodoDragDrop();
export default todoDragDrop;