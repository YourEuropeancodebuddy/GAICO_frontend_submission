const API_BASE = "http://localhost:8081/auth";
const token = localStorage.getItem("access_token");

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function fetchProjectDetails() {
  const projectId = getQueryParam("id");
  if (!projectId) return alert("No project ID provided");

  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const project = await res.json();

  document.querySelector(".project-description h1").textContent = project.name;
  document.querySelector(".project-description p").textContent = project.description;

  const activity = document.querySelector(".project-activity ul");
  activity.innerHTML = project.activityLog.map(a => `<li>[${a.timestamp}] ${a.entry}</li>`).join("");

  const ctx = document.getElementById("statusChart").getContext("2d");
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Complete', 'Under Review', 'Incomplete'],
      datasets: [{
        data: [project.progress || 0, 100 - project.progress || 0, 0],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: 'white' }
        },
        title: { display: false }
      }
    }
  });
}

window.onload = fetchProjectDetails;

async function deleteProject() {
  const projectId = getQueryParam("id");
  if (!projectId) return alert("Missing project ID");

  const confirmed = confirm("Are you sure you want to delete this project?");
  if (!confirmed) return;

  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.ok) {
    alert("Project deleted.");
    window.location.href = "projects.html";
  } else {
    alert("Failed to delete project.");
  }
}

async function updateProjectField(field, value) {
  const projectId = getQueryParam("id");
  if (!projectId) return;

  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ [field]: value })
  });

  if (res.ok) {
    alert("Project updated.");
    fetchProjectDetails(); 
  } else {
    alert("Update failed.");
  }
}

async function trackProgress(newProgress) {
  const projectId = getQueryParam("id");
  if (!projectId) return;

  const res = await fetch(`${API_BASE}/projects/${projectId}/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ progress: newProgress })
  });

  if (res.ok) {
    alert("Progress tracked.");
    fetchProjectDetails();
  } else {
    alert("Failed to track progress.");
  }
}

async function logActivity(entry) {
  const projectId = getQueryParam("id");
  if (!projectId) return;

  const res = await fetch(`${API_BASE}/projects/${projectId}/activity-log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ entry })
  });

  if (res.ok) {
    alert("Activity logged.");
    fetchProjectDetails();
  } else {
    alert("Failed to log activity.");
  }
}

async function notify(message) {
  const projectId = getQueryParam("id");
  if (!projectId) return;

  const res = await fetch(`${API_BASE}/projects/${projectId}/notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });

  if (res.ok) {
    alert("Notification sent.");
  } else {
    alert("Failed to send notification.");
  }
}
