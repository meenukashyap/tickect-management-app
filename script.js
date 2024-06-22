document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/tickets';
    const taskForm = document.getElementById('task-form');
    const tasksTable = document.getElementById('tasks-table').querySelector('tbody');
    const taskIdInput = document.getElementById('task-id');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const statusSelect = document.getElementById('status');
    const dueDateInput = document.getElementById('dueDate');

    taskForm.addEventListener('submit', handleFormSubmit);

    async function fetchTasks() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            displayTasks(data);
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Failed to fetch tasks.');
        }
    }

    function displayTasks(tasks) {
        tasksTable.innerHTML = '';
        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td>${task.status}</td>
                <td>${new Date(task.dueDate).toLocaleString()}</td>
                <td>${calculatePriority(task.dueDate)}</td>
                <td>
                    <button onclick="editTask(${task.id})">Edit</button>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                </td>
            `;
            tasksTable.appendChild(row);
        });
    }

    function calculatePriority(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = (due - now) / (1000 * 60 * 60 * 24); // Difference in days
        if (diff < 1) return 'High';
        if (diff < 3) return 'Medium';
        return 'Low';
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = taskIdInput.value;
        const task = {
            title: titleInput.value,
            description: descriptionInput.value,
            status: statusSelect.value,
            dueDate: dueDateInput.value
        };
        if (id) {
            updateTask(id, task);
        } else {
            createTask(task);
        }
    }

    async function createTask(task) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            fetchTasks();
            taskForm.reset();
        } catch (error) {
            console.error('Create error:', error);
            alert('Failed to create task.');
        }
    }

    async function updateTask(id, task) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            fetchTasks();
            taskForm.reset();
            taskIdInput.value = '';
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update task.');
        }
    }

    async function deleteTask(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            fetchTasks();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete task.');
        }
    }

    window.editTask = function(id) {
        fetch(`${API_URL}/${id}`)
            .then(response => response.json())
            .then(task => {
                taskIdInput.value = task.id;
                titleInput.value = task.title;
                descriptionInput.value = task.description;
                statusSelect.value = task.status;
                dueDateInput.value = new Date(task.dueDate).toISOString().slice(0, 16);
            })
            .catch(error => {
                console.error('Fetch task error:', error);
                alert('Failed to fetch task details.');
            });
    };

    fetchTasks();
});
