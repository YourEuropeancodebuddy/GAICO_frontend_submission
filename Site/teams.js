const API_BASE = "http://localhost:8080";
const token = localStorage.getItem("access_token");

async function fetchTeams() {
  const res = await fetch(`${API_BASE}/teams`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const teams = await res.json();
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  teams.forEach(team => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${team.id}</td>
      <td>${team.name}</td>
      <td>${team.productOwner}</td>
      <td>${team.productManager}</td>
      <td>
        <button onclick="editTeam('${team.id}')">✏️</button>
        <button onclick="deleteTeam('${team.id}')">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function createTeam(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    productOwner: form.owner.value,
    productManager: form.manager.value
  };

  const res = await fetch(`${API_BASE}/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert("Team created");
    fetchTeams();
    form.reset();
  } else {
    alert("Failed to create team");
  }
}

function editTeam(id) {
  const newName = prompt("New team name:");
  if (!newName) return;

  fetch(`${API_BASE}/teams/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name: newName })
  }).then(res => {
    if (res.ok) {
      alert("Updated");
      fetchTeams();
    } else {
      alert("Failed to update");
    }
  });
}

async function deleteTeam(id) {
  if (!confirm("Delete this team?")) return;
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) {
    alert("Deleted");
    fetchTeams();
  } else {
    alert("Failed to delete");
  }
}

window.onload = fetchTeams;
