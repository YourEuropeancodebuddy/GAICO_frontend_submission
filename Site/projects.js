/*
const API_BASE = "http://localhost:8081/api/projects";
const token = localStorage.getItem("access_token");

// Fetch and display all projects
async function fetchProjects() {
  const res = await fetch(`${API_BASE}/getProjects`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const projects = await res.json();
  const container = document.querySelector(".center-container");

  // Remove existing project cards (but not the form)
  const cards = container.querySelectorAll(".project-card");
  cards.forEach(card => card.remove());

  projects.forEach(project => {
    const card = document.createElement("div");
    card.className = "project-card";

    card.innerHTML = `
      <div class="section top-section">
        <div class="project-name">
          <a href="project.html?id=${project.id}">${project.name}</a>
        </div>
        <div class="progress-wrapper">
          <div class="progress-bar">
            <div class="progress" style="width: ${project.progress || 0}%"></div>
          </div>
          <div class="progress-percent">${project.progress || 0}%</div>
        </div>
      </div>
      <div class="section middle-section">
        <div class="last-edited">Last edited: ${project.lastEdited || "N/A"}</div>
        <div class="dates">
          Start: ${project.startDate || "N/A"}<br/>
          Est. End: ${project.endDate || "N/A"}
        </div>
      </div>
      <div class="section bottom-section toggle-trigger">
        <div class="last-notification">${project.status || "No data so far."}</div>
        <div class="unread-count">${(project.notifications?.length || 0)} unread</div>
      </div>
      <div class="hidden-details">
        <div><strong>Current Phase:</strong> ${project.currentPhase || "No data so far."}</div>
        <div><strong>Status:</strong> ${project.status || "No data so far."}</div>
        <div><strong>Description:</strong> ${project.description || "No data so far."}</div>
        <div><strong>Notifications:</strong> ${(project.notifications?.length || 0) || "No data so far."}</div>
        <button onclick="editProject(${project.id})">✏️ Edit</button>
        <button onclick="deleteProject(${project.id})">🗑️ Delete</button>
      </div>
    `;

    // Enable toggle animation
    const toggleTrigger = card.querySelector(".toggle-trigger");
    const detailsSection = card.querySelector(".hidden-details");
    toggleTrigger.addEventListener("click", () => {
      detailsSection.classList.toggle("show");
    });

    container.appendChild(card);
  });
}

// Handle new project creation
async function createProject(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    description: form.description.value,
    startDate: form.startDate.value,
    endDate: form.endDate.value
  };

  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert("Project created!");
    fetchProjects();
    form.reset();

    // Close the form UI
    document.getElementById("create-project-card").classList.add("hidden");
    document.getElementById("create-toggle-button").classList.remove("hidden");
  } else {
    alert("Failed to create project");
  }
}

// Handle project deletion
async function deleteProject(id) {
  if (!confirm("Delete this project?")) return;

  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) {
    alert("Deleted.");
    fetchProjects();
  } else {
    alert("Delete failed.");
  }
}

// Handle project name editing
function editProject(id) {
  const newName = prompt("New project name:");
  if (!newName) return;

  fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name: newName })
  }).then(res => {
    if (res.ok) {
      alert("Updated.");
      fetchProjects();
    } else {
      alert("Update failed.");
    }
  });
}

// Load projects on page load
window.onload = () => {
  fetchProjects();
};
*/



// projects.js

/*
//const API_BASE_URL = "http://localhost:8081/api/projects"; // Replace with your actual backend API URL

const API_PROJECTS_URL = "http://localhost:8081/api/projects";
const API_USERS_URL = "http://localhost:8081/api/users";


async function createProject(event) {
  event.preventDefault();

  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('Authentication token not found. Please log in again.');
    window.location.href = 'login.html';
    return;
  }

  const projectName = document.getElementById('project-name').value;
  const description = document.getElementById('project-description').value;
  const projectManager = document.getElementById('project-manager').value;
  const controller = document.getElementById('project-controller').value;
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const status = document.getElementById('project-status').value;
  const budget = document.getElementById('project-budget').value;
  const teamMembers = document.getElementById('teamMembers').value.split(',').filter(Boolean);

  const projectData = {
    name: projectName,
    description: description,
    projectManager: projectManager,
    controller: controller,
    startDate: startDate,
    endDate: endDate,
    status: status,
    budget: parseFloat(budget), // Ensure budget is a number
    teamMembers: teamMembers,
  };

  try {
    const response = await fetch(`${API_PROJECTS_URL}`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating project:', errorData);
      alert(`Failed to create project: ${errorData.message || response.statusText}`);
      return;
    }

    const newProject = await response.json();
    console.log('Project created successfully:', newProject);
    alert('Project created successfully!');
    window.location.href = 'projectlisting.html'; // Redirect to project listing page

  } catch (error) {
    console.error('Error sending project data:', error);
    alert('Failed to create project. Please try again later.');
  }
}
/*
// trying this function  to be evaluated 
async function createProject(event) { event.preventDefault();
  
  const project = {
    id: Date.now().toString(),
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    manager: document.getElementById('project-manager').value,
    controller: document.getElementById('project-controller').value,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    status: document.getElementById('status').value,
    budget: document.getElementById('budget').value,
    teamMembers: document.getElementById('teamMembers').value.split(',').filter(Boolean),
    createdOn: new Date().toISOString().split('T')[0]
  };

  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error('No access token found.');
    alert('You are not authenticated. Please log in again.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });

    if (!response.ok) {
      console.error('Failed to create project:', response.statusText);
      throw new Error('Failed to create project');
    }

    const data = await response.json();
    console.log('Project created successfully:', data);
    window.location.href = 'projectlisting.html'; // Redirect after successful project creation

  } catch (error) {
    console.error('Error creating project:', error);
    alert('Failed to create project. Please try again.');
  }
}
  */
/*

// Function to fetch and populate project managers (example)
async function fetchProjectManagers() {
  const token = localStorage.getItem('access_token');
  if (!token) return [];

//await fetch(`${API_USERS_URL}?role=manager`, { ... })
//await fetch(`${API_USERS_URL}?role=controller`, { ... })

  try {
    const response = await fetch(`${API_USERS_UR}/api/users?role=manager`, { // Adjust the API endpoint as needed this . This leads to api/projects/api/users
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch project managers:', response.statusText);
      return [];
    }

    const managers = await response.json();
    const managerSelect = document.getElementById('project-manager');
    managers.forEach(manager => {
      const option = document.createElement('option');
      option.value = manager.id; // Or the appropriate identifier
      option.textContent = manager.name || manager.email; // Display name or email
      managerSelect.appendChild(option);
    });
    return managers;

  } catch (error) {
    console.error('Error fetching project managers:', error);
    return [];
  }
}

// Function to fetch and populate controllers (example)
async function fetchControllers() {
  const token = localStorage.getItem('access_token');
  if (!token) return [];

  try {
    const response = await fetch(`${API_USERS_UR}role=controller`, { // Adjust the API endpoint as needed //
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch controllers:', response.statusText);
      return [];
    }

    const controllers = await response.json();
    const controllerSelect = document.getElementById('project-controller');
    controllers.forEach(controller => {
      const option = document.createElement('option');
      option.value = controller.id; // Or the appropriate identifier
      option.textContent = controller.name || controller.email; // Display name or email
      controllerSelect.appendChild(option);
    });
    return controllers;

  } catch (error) {
    console.error('Error fetching controllers:', error);
    return [];
  }
}

// Call these functions when the page loads to populate dropdowns
document.addEventListener('DOMContentLoaded', () => {
  fetchProjectManagers();
  fetchControllers();
});

*/
/*
//cleaned version
const API_BASE_URL = "http://localhost:8081/api/projects";
const USER_API_URL = "http://localhost:8081/api/users/profile"; // Separate base for users

async function fetchUsersByRole(role) {
  const token = localStorage.getItem('access_token');  // Assuming the token is stored in localStorage
  if (!token) {
    console.error('No access token found');
    return [];
  }

  try {
    const response = await fetch(`${USER_API_URL}?role=${role}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${role}s`);
    }
    const users = await response.json();
    return users;
  } catch (error) {
    console.error(`Error fetching ${role}s:`, error);
    return [];
  }
}

async function populateUserSelect(selectId, role) {
  const select = document.getElementById(selectId);
  const users = await fetchUsersByRole(role);

  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    select.appendChild(option);
  });
}

async function createProject() {
  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  const projectManager = document.getElementById('project-manager').value;
  const controller = document.getElementById('controller').value;
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const status = document.getElementById('status').value;
  const budget = document.getElementById('budget').value;
  const teamMembers = Array.from(document.getElementById('team-members').selectedOptions).map(option => option.value);

  const projectData = {
    name,
    description,
    projectManager,
    controller,
    startDate,
    endDate,
    status,
    budget: parseFloat(budget),
    teamMembers,
  };

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(project),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    alert('Project created successfully!');
    window.location.href = 'project_list.html'; // Redirect to project list page
  } catch (error) {
    console.error('Error creating project:', error);
    alert('Error creating project. Please try again.');
  }
}

// Initialize dropdowns
populateUserSelect('project-manager', 'manager');
populateUserSelect('controller', 'controller');
populateUserSelect('team-members', 'member');

*/
/*
// fixed from deepseek
document.addEventListener('DOMContentLoaded', function() {
  setDefaultDates();
  console.log('DOM fully loaded and default dates set.');
});

function setDefaultDates() {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  if (startDateInput && endDateInput) {
    startDateInput.valueAsDate = today;
    endDateInput.valueAsDate = nextMonth;
    console.log('Default dates set.');
  } else {
    console.warn('Start or end date input elements not found.');
  }
}

document.getElementById('projectForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const token = localStorage.getItem('access_token');
  if (!token) {
      alert('You must be logged in first!');
      return;
  }

  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;
  // Assuming you have input fields with these IDs in your form
  const owner= document.getElementById('owner').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const budget = document.getElementById('budget').value;
  const status= document.getElementById('category').value;
  // Assuming you have a way to collect team members, perhaps a comma-separated input
  const teamMembersInput = document.getElementById('teamMembers').value;
  const teamMembers = teamMembersInput.split(',').map(email => email.trim()).filter(Boolean);

  const project = {
    
      name,
      status,
      description,
      owner,
      startDate,
      endDate,
      budget: parseFloat(budget), // Ensure budget is a number
      teamMembers,
  };

  try {
      const response = await fetch('http://localhost:8081/api/projects', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(project)
      });

      const result = await response.json();

      if (response.ok) {
          document.getElementById('message').innerText = "Project created successfully!";
          document.getElementById('projectForm').reset();
      } else {
          document.getElementById('message').innerText = "Error: " + (result.message || "Unexpected error");
      }
  } catch (error) {
      console.error('Error:', error);
      document.getElementById('message').innerText = "An error occurred.";
  }
});

*/

document.addEventListener('DOMContentLoaded', function() {
  // setDefaultDates() is already here, which is good
  setDefaultDates();
  console.log('DOM fully loaded and default dates set.');

  // >>> Move the form submit listener INSIDE this DOMContentLoaded block <<<
  const projectForm = document.getElementById('projectForm'); // Get the form element

  if (projectForm) { // Check if the form element was found
    projectForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const token = localStorage.getItem('access_token');
      if (!token) {
          alert('You must be logged in first!');
          return;
      }

      const name = document.getElementById('name').value;
      const description = document.getElementById('description').value;
      const owner= document.getElementById('owner').value;
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      const budget = document.getElementById('budget').value;
      const status= document.getElementById('category').value;
      const teamMembersInput = document.getElementById('teamMembers').value;
      const teamMembers = teamMembersInput.split(',').map(email => email.trim()).filter(Boolean);

      const project = {
          name,
          status,
          description,
          owner,
          startDate,
          endDate,
          budget: parseFloat(budget),
          teamMembers,
      };

      try {
          const response = await fetch('http://localhost:8081/api/projects', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(project)
          });

          const result = await response.json();

          if (response.ok) {
              document.getElementById('message').innerText = "Project created successfully!";
              document.getElementById('projectForm').reset();
          } else {
              document.getElementById('message').innerText = "Error: " + (result.message || "Unexpected error");
          }
      } catch (error) {
          console.error('Error:', error);
          document.getElementById('message').innerText = "An error occurred.";
      }
    });
  } else {
      console.warn('Project form element with ID "projectForm" not found.'); // Add a warning if the form isn't found
  }
});

// Keep setDefaultDates function outside if you prefer, or move it inside if it's only used here.
// If moved inside, ensure it's defined before it's called.
function setDefaultDates() {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  if (startDateInput && endDateInput) {
    startDateInput.valueAsDate = today;
    endDateInput.valueAsDate = nextMonth;
    console.log('Default dates set.');
  } else {
    console.warn('Start or end date input elements not found.');
  }
}