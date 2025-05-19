// Configuration
const API_BASE_URL = 'http://localhost:8081/api/issues'; 
const AUTH_TOKEN_KEY = 'access_token'; // Key for storing JWT token in localStorage

// Task data store
let tasks = [];
let currentTaskId = null;

// DOM Elements
const currentDateEl = document.getElementById('current-date');
const statsContainer = document.getElementById('stats-container');
const tasksTableBody = document.getElementById('tasks-table-body');
const taskModal = document.getElementById('task-modal');
const deleteModal = document.getElementById('delete-modal');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');

// Chart instances
let statusPieChart;
let priorityBarChart;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Display current date
    updateCurrentDate();
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
        // Redirect to login page or show login modal
        alert('Please log in to access the dashboard');
        // You might want to redirect to login page
        // window.location.href = 'login.html';
        return;
    }
    
    // Load tasks from API
    fetchTasks();
    
    // Initialize event listeners
    initEventListeners();
});

// Check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// Get the JWT token from localStorage
function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Set the JWT token in localStorage
function setAuthToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

// Remove the JWT token from localStorage (logout)
function removeAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

// Get authorization headers for API requests
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Update the current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
}

// Initialize all event listeners
function initEventListeners() {
    // Add task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            openTaskModal();
        });
    }
    
    // Close modal buttons
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeTaskModal);
    }
    
    const cancelTaskBtn = document.getElementById('cancel-task');
    if (cancelTaskBtn) {
        cancelTaskBtn.addEventListener('click', closeTaskModal);
    }
    
    // Close delete modal buttons
    const closeDeleteModalBtn = document.getElementById('close-delete-modal');
    if (closeDeleteModalBtn) {
        closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    }
    
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteTask);
    }
    
    // Task form submission
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskFormSubmit);
    }
    
    // Filter dropdown
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            filterTasks(filter);
            
            // Update active class
            filterOptions.forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // View buttons for charts
    const viewStatusBtn = document.getElementById('view-status-btn');
    if (viewStatusBtn) {
        viewStatusBtn.addEventListener('click', () => {
            filterTasks('all');
            // Reset active class on filter options
            const allFilterOption = document.querySelector('.filter-option[data-filter="all"]');
            if (allFilterOption) {
                allFilterOption.click();
            }
        });
    }
    
    const viewPriorityBtn = document.getElementById('view-priority-btn');
    if (viewPriorityBtn) {
        viewPriorityBtn.addEventListener('click', () => {
            filterTasks('all');
            // Reset active class on filter options
            const allFilterOption = document.querySelector('.filter-option[data-filter="all"]');
            if (allFilterOption) {
                allFilterOption.click();
            }
        });
    }
}

// Fetch tasks from the API
async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            handleAuthError();
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        
        tasks = await response.json();
        
        // Update UI with fetched tasks
        renderTasks();
        updateStats();
        renderCharts();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        // For demo purposes, load sample data if API fails
        loadSampleData();
    }
}

// Handle authentication errors
function handleAuthError() {
    alert('Your session has expired. Please log in again.');
    removeAuthToken();
    // Redirect to login page
    // window.location.href = 'login.html';
}


// Render tasks in the table
function renderTasks() {
    if (!tasksTableBody) {
        console.error('Tasks table body element not found');
        return;
    }
    
    tasksTableBody.innerHTML = '';
    
    tasks.forEach(task => {
        const row = document.createElement('tr');
        
        // Format dates for display
        const startDate = task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A';
        const dueDate = task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A';
        
        // Create status and priority badges
        const statusBadge = getStatusBadge(task.status);
        const priorityBadge = getPriorityBadge(task.priority);
        
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${priorityBadge}</td>
            <td>${statusBadge}</td>
            <td>${startDate}</td>
            <td>${dueDate}</td>
            <td>
                <button class="btn btn-sm btn-icon edit-btn" data-id="${task.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button class="btn btn-sm btn-icon delete-btn" data-id="${task.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        `;
        
        tasksTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.currentTarget.getAttribute('data-id'));
            openTaskModal(taskId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.currentTarget.getAttribute('data-id'));
            openDeleteModal(taskId);
        });
    });
}

// Get HTML for status badge
function getStatusBadge(status) {
    const statusMap = {
        'todo': { label: 'To Do', class: 'badge-secondary' },
        'progress': { label: 'In Progress', class: 'badge-primary' },
        'review': { label: 'Under Review', class: 'badge-warning' },
        'completed': { label: 'Completed', class: 'badge-success' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: 'badge-secondary' };
    return `<span class="badge ${statusInfo.class}">${statusInfo.label}</span>`;
}

// Get HTML for priority badge
function getPriorityBadge(priority) {
    const priorityMap = {
        'high': { label: 'High', class: 'badge-danger' },
        'medium': { label: 'Medium', class: 'badge-warning' },
        'low': { label: 'Low', class: 'badge-info' }
    };
    
    const priorityInfo = priorityMap[priority] || { label: priority, class: 'badge-secondary' };
    return `<span class="badge ${priorityInfo.class}">${priorityInfo.label}</span>`;
}

// Update statistics
function updateStats() {
    if (!statsContainer) {
        console.error('Stats container element not found');
        return;
    }
    
    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'progress').length;
    const todoTasks = tasks.filter(task => task.status === 'todo').length;
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    
    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Render stats cards
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalTasks}</div>
            <div class="stat-label">Total Tasks</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${completedTasks}</div>
            <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${inProgressTasks}</div>
            <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${todoTasks}</div>
            <div class="stat-label">To Do</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${highPriorityTasks}</div>
            <div class="stat-label">High Priority</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${completionRate}%</div>
            <div class="stat-label">Completion Rate</div>
        </div>
    `;
}

// Render charts
function renderCharts() {
    renderStatusPieChart();
    renderPriorityBarChart();
}

// Render status pie chart
function renderStatusPieChart() {
    const statusPieChartEl = document.getElementById('statusPieChart');
    if (!statusPieChartEl) {
        console.error('Status pie chart element not found');
        return;
    }
    
    // Count tasks by status
    const statusCounts = {
        'todo': 0,
        'progress': 0,
        'review': 0,
        'completed': 0
    };
    
    tasks.forEach(task => {
        if (statusCounts.hasOwnProperty(task.status)) {
            statusCounts[task.status]++;
        }
    });
    
    // Prepare chart data
    const data = {
        labels: ['To Do', 'In Progress', 'Under Review', 'Completed'],
        datasets: [{
            data: [
                statusCounts.todo,
                statusCounts.progress,
                statusCounts.review,
                statusCounts.completed
            ],
            backgroundColor: [
                '#6c757d', // Secondary (To Do)
                '#007bff', // Primary (In Progress)
                '#ffc107', // Warning (Under Review)
                '#28a745'  // Success (Completed)
            ],
            borderWidth: 1
        }]
    };
    
    // Get chart context
    const ctx = statusPieChartEl.getContext('2d');
    
    // Destroy existing chart if it exists
    if (statusPieChart) {
        statusPieChart.destroy();
    }
    
    // Create new chart
    statusPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Render priority bar chart
function renderPriorityBarChart() {
    const priorityBarChartEl = document.getElementById('priorityBarChart');
    if (!priorityBarChartEl) {
        console.error('Priority bar chart element not found');
        return;
    }
    
    // Count tasks by priority
    const priorityCounts = {
        'high': 0,
        'medium': 0,
        'low': 0
    };
    
    tasks.forEach(task => {
        if (priorityCounts.hasOwnProperty(task.priority)) {
            priorityCounts[task.priority]++;
        }
    });
    
    // Prepare chart data
    const data = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            label: 'Number of Tasks',
            data: [
                priorityCounts.high,
                priorityCounts.medium,
                priorityCounts.low
            ],
            backgroundColor: [
                '#dc3545', // Danger (High)
                '#ffc107', // Warning (Medium)
                '#17a2b8'  // Info (Low)
            ],
            borderWidth: 1
        }]
    };
    
    // Get chart context
    const ctx = priorityBarChartEl.getContext('2d');
    
    // Destroy existing chart if it exists
    if (priorityBarChart) {
        priorityBarChart.destroy();
    }
    
    // Create new chart
    priorityBarChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Filter tasks based on criteria
function filterTasks(filter) {
    let filteredTasks;
    
    if (filter === 'all') {
        filteredTasks = [...tasks];
    } else if (['high', 'medium', 'low'].includes(filter)) {
        filteredTasks = tasks.filter(task => task.priority === filter);
    } else if (['todo', 'progress', 'review', 'completed'].includes(filter)) {
        filteredTasks = tasks.filter(task => task.status === filter);
    } else {
        filteredTasks = [...tasks];
    }
    
    // Update table with filtered tasks
    if (!tasksTableBody) {
        console.error('Tasks table body element not found');
        return;
    }
    
    tasksTableBody.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const row = document.createElement('tr');
        
        // Format dates for display
        const startDate = task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A';
        const dueDate = task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A';
        
        // Create status and priority badges
        const statusBadge = getStatusBadge(task.status);
        const priorityBadge = getPriorityBadge(task.priority);
        
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${priorityBadge}</td>
            <td>${statusBadge}</td>
            <td>${startDate}</td>
            <td>${dueDate}</td>
            <td>
                <button class="btn btn-sm btn-icon edit-btn" data-id="${task.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button class="btn btn-sm btn-icon delete-btn" data-id="${task.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        `;
        
        tasksTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.currentTarget.getAttribute('data-id'));
            openTaskModal(taskId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.currentTarget.getAttribute('data-id'));
            openDeleteModal(taskId);
        });
    });
}

// Open task modal for adding or editing a task
function openTaskModal(taskId = null) {
    if (!taskModal) {
        console.error('Task modal element not found');
        return;
    }
    
    currentTaskId = taskId;
    
    // Reset form
    if (taskForm) {
        taskForm.reset();
    }
    
    if (taskId) {
        // Edit existing task
        if (modalTitle) {
            modalTitle.textContent = 'Edit Task';
        }
        
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            const taskIdInput = document.getElementById('task-id');
            if (taskIdInput) taskIdInput.value = task.id;
            
            const taskNameInput = document.getElementById('task-name');
            if (taskNameInput) taskNameInput.value = task.title;
            
            const projectIdInput = document.getElementById('project-id');
            if (projectIdInput) projectIdInput.value = task.projectId;
            
            const taskDescriptionInput = document.getElementById('task-description');
            if (taskDescriptionInput) taskDescriptionInput.value = task.description || '';
            
            const taskPriorityInput = document.getElementById('task-priority');
            if (taskPriorityInput) taskPriorityInput.value = task.priority;
            
            const taskStatusInput = document.getElementById('task-status');
            if (taskStatusInput) taskStatusInput.value = task.status;
            
            const taskStartDateInput = document.getElementById('task-start-date');
            if (taskStartDateInput) taskStartDateInput.value = task.startDate;
            
            const taskDueDateInput = document.getElementById('task-due-date');
            if (taskDueDateInput) taskDueDateInput.value = task.endDate;
            
            const taskTagsInput = document.getElementById('task-tags');
            if (taskTagsInput) taskTagsInput.value = task.tags ? task.tags.join(', ') : '';
        }
    } else {
        // Add new task
        if (modalTitle) {
            modalTitle.textContent = 'Add New Task';
        }
        
        const taskIdInput = document.getElementById('task-id');
        if (taskIdInput) taskIdInput.value = '';
        
        // Set default dates (today and today + 7 days)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const taskStartDateInput = document.getElementById('task-start-date');
        if (taskStartDateInput) taskStartDateInput.value = formatDateForInput(today);
        
        const taskDueDateInput = document.getElementById('task-due-date');
        if (taskDueDateInput) taskDueDateInput.value = formatDateForInput(nextWeek);
    }
    
    // Show modal
    taskModal.classList.add('show');
}

// Format date for date input (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Close task modal
function closeTaskModal() {
    if (!taskModal) {
        console.error('Task modal element not found');
        return;
    }
    
    taskModal.classList.remove('show');
}

// Open delete confirmation modal
function openDeleteModal(taskId) {
    if (!deleteModal) {
        console.error('Delete modal element not found');
        return;
    }
    
    currentTaskId = taskId;
    deleteModal.classList.add('show');
}

// Close delete confirmation modal
function closeDeleteModal() {
    if (!deleteModal) {
        console.error('Delete modal element not found');
        return;
    }
    
    deleteModal.classList.remove('show');
}

// Handle task form submission
async function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const taskIdInput = document.getElementById('task-id');
    const taskNameInput = document.getElementById('task-name');
    const projectIdInput = document.getElementById('project-id');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskStatusInput = document.getElementById('task-status');
    const taskStartDateInput = document.getElementById('task-start-date');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskTagsInput = document.getElementById('task-tags');
    
    if (!taskNameInput || !projectIdInput || !taskPriorityInput || 
        !taskStatusInput || !taskStartDateInput || !taskDueDateInput) {
        console.error('Required form elements not found');
        alert('Form is missing required elements');
        return;
    }
    
    const taskId = taskIdInput ? taskIdInput.value : '';
    const title = taskNameInput.value;
    const projectId = parseInt(projectIdInput.value);
    const description = taskDescriptionInput ? taskDescriptionInput.value : '';
    const priority = taskPriorityInput.value;
    const status = taskStatusInput.value;
    const startDate = taskStartDateInput.value;
    const endDate = taskDueDateInput.value;
    const tagsInput = taskTagsInput ? taskTagsInput.value : '';
    
    // Parse tags (comma separated)
    const tags = tagsInput.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    
    // Create task object
    const taskData = {
        title,
        status,
        projectId,
        priority,
        startDate,
        endDate,
        description,
        tags
    };
    
    try {
        if (taskId) {
            // Update existing task
            taskData.id = parseInt(taskId);
            await updateTask(taskData);
        } else {
            // Create new task
            await createTask(taskData);
        }
        
        // Close modal
        closeTaskModal();
        
        // Refresh tasks
        fetchTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        alert('Failed to save task. Please try again.');
    }
}

// Create a new task
async function createTask(taskData) {
    try {
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(taskData)
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            handleAuthError();
            return null;
        }
        
        if (!response.ok) {
            throw new Error('Failed to create task');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating task:', error);
        
        // For demo purposes, simulate successful creation
        const newTask = {
            ...taskData,
            id: Math.max(...tasks.map(t => t.id || 0), 0) + 1
        };
        
        tasks.push(newTask);
        return newTask;
    }
}

// Update an existing task
async function updateTask(taskData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${taskData.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(taskData)
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            handleAuthError();
            return null;
        }
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating task:', error);
        
        // For demo purposes, simulate successful update
        const index = tasks.findIndex(t => t.id === taskData.id);
        if (index !== -1) {
            tasks[index] = taskData;
        }
        
        return taskData;
    }
}

// Delete a task
async function confirmDeleteTask() {
    if (!currentTaskId) return;
    
    try {
        await deleteTask(currentTaskId);
        
        // Close modal
        closeDeleteModal();
        
        // Refresh tasks
        fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
    }
}

// Delete a task from the API
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            handleAuthError();
            return false;
        }
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        
        // For demo purposes, simulate successful deletion
        tasks = tasks.filter(t => t.id !== taskId);
        return true;
    }
}

// Login function (to be called from login form)
async function login(username, password) {
    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        
        // Save the JWT token
        if (data.token) {
            setAuthToken(data.token);
            return true;
        } else {
            throw new Error('No token received');
        }
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// Logout function
function logout() {
    removeAuthToken();
    // Redirect to login page
    // window.location.href = 'login.html';
}

// Add a login form event listener (if you have a login form)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            
            if (!usernameInput || !passwordInput) {
                console.error('Username or password input not found');
                return;
            }
            
            const username = usernameInput.value;
            const password = passwordInput.value;
            
            const success = await login(username, password);
            
            if (success) {
                // Redirect to dashboard or reload page
                window.location.reload();
            } else {
                alert('Login failed. Please check your credentials.');
            }
        });
    }
    
    // Add logout button event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});