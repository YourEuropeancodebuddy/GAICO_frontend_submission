const token = localStorage.getItem("access_token");

// Dynamically set the current month and year based on today's date
let currentDate = new Date();
currentDate.setDate(1); // Set the day to the first to ensure we're viewing the correct month

// Fetch tasks from the backend based on the current month
function fetchTasks() {
  const month = currentDate.getMonth() + 1; // Backend expects 1-based month (1 for January, 12 for December)
  const year = currentDate.getFullYear();

  fetch(`http://localhost:8081/api/issues?month=${month}&year=${year}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}` // Assuming JWT token for authentication 
    }
  })
    .then(response => response.json())
    .then(data => {
      // Populate tasks in the calendar
      loadTasks(data); // Pass the tasks to loadTasks function
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

// Load the current month and update the grid
window.onload = () => {
  buildCalendar(currentDate); // Ensure calendar is built on load
  fetchTasks(); // Fetch tasks from the backend
  updateMonthLabel();
  document.getElementById("prevMonthBtn").addEventListener("click", changeMonth);
  document.getElementById("nextMonthBtn").addEventListener("click", changeMonth);
};

// Change the month when the user clicks next/previous buttons
function changeMonth(event) {
  if (event.target.id === "prevMonthBtn") {
    currentDate.setMonth(currentDate.getMonth() - 1); // Go to the previous month
  } else if (event.target.id === "nextMonthBtn") {
    currentDate.setMonth(currentDate.getMonth() + 1); // Go to the next month
  }

  // Rebuild the calendar and update the month label
  buildCalendar(currentDate);
  updateMonthLabel();
  fetchTasks(); // Fetch tasks for the new month
}

// Update the month label
function updateMonthLabel() {
  const monthLabel = document.getElementById("monthLabel");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  monthLabel.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

// Build the calendar grid (with correct days)
function buildCalendar(date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const calendarGrid = document.getElementById("calendarGrid");

  // Clear the calendar grid
  calendarGrid.innerHTML = "";

  // Calculate the first day of the month (for positioning)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Add empty cells for the days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyDiv = document.createElement("div");
    calendarGrid.appendChild(emptyDiv);
  }

  // Add day cells for the days of the month (1 to 31)
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day-item";
    dayDiv.id = `day${day}`; // Assign id to each day cell
    const dateNumber = document.createElement("div");
    dateNumber.className = "date-number";
    dateNumber.textContent = day;
    dayDiv.appendChild(dateNumber);
    calendarGrid.appendChild(dayDiv);
  }
}

// Load tasks and add them to the calendar grid
function loadTasks(tasks) {
  tasks.forEach((task) => {
    const taskEndDate = new Date(task.endDate);

    // Only load tasks that have their end date in the current month
    if (taskEndDate.getMonth() === currentDate.getMonth() && taskEndDate.getFullYear() === currentDate.getFullYear()) {
      const taskDay = taskEndDate.getDate();  

      // Create the task element and add it to the calendar
      const taskElement = createTaskElement(task, taskDay);

      const dayCell = document.getElementById(`day${taskDay}`);
      if (dayCell) {
        const taskContainer = dayCell.querySelector('.task-container') || document.createElement('div');
        taskContainer.className = 'task-container';
        taskContainer.appendChild(taskElement); // Add task to the container
        dayCell.appendChild(taskContainer); // Add the container to the day cell
      }
    }
  });
}

// Helper function to create task element (for the calendar grid)
function createTaskElement(task, taskDay) {
  const taskElement = document.createElement("div");
  taskElement.className = "task";

  // Create the task name element
  const taskNameElement = document.createElement("div");
  taskNameElement.className = "task-name";
  taskNameElement.textContent = task.title;

  // Create the task project element
  const taskProjectElement = document.createElement("div");
  taskProjectElement.className = "task-project";
  taskProjectElement.textContent = task.project;

  // Create the task status element (to show on task box)
  const taskStatusElement = document.createElement("div");
  taskStatusElement.className = "task-status";
  taskStatusElement.textContent = `Status: ${task.status}`; // Only show status here

  // Append the elements to the task (only show name, project, and status)
  taskElement.appendChild(taskNameElement);
  taskElement.appendChild(taskProjectElement);
  taskElement.appendChild(taskStatusElement); // Add status to task box

  // Add event listener for hover (to show task details)
  taskElement.addEventListener("mouseenter", (event) => showTaskDetails(task, event));
  taskElement.addEventListener("mouseleave", hideTaskDetails);

  return taskElement;
}

// Display task details on hover
let popupTimeout = null;

function showTaskDetails(task, event) {
  const taskDetail = document.getElementById("taskDetailsPopup");

  // Populate the task details dynamically, including priority and status
  taskDetail.innerHTML = ` 
    <strong>Task Name:</strong> ${task.title}<br>
    <strong>Start Date:</strong> ${task.startDate ? task.startDate : 'Not specified'}<br>
    <strong>End Date:</strong> ${task.endDate ? task.endDate : 'Not specified'}<br>
    <strong>Project:</strong> ${task.project ? task.project : 'Not specified'}<br>
    <strong>Priority:</strong> ${task.priority}<br>
    <strong>Status:</strong> ${task.status}
  `;

  // Show the popup (set display to block)
  taskDetail.style.display = 'block';

  // Position the popup near the task element (adjust as needed)
  const taskElement = event.target; // This refers to the task element being hovered
  const rect = taskElement.getBoundingClientRect();
  taskDetail.style.left = rect.right + 10 + 'px'; // Adjust to appear to the right of the task box
  taskDetail.style.top = rect.top + 'px'; // Align top of popup with top of the task box
}

function hideTaskDetails() {
  const taskDetail = document.getElementById("taskDetailsPopup");
  taskDetail.style.display = 'none'; // Hide the popup
}