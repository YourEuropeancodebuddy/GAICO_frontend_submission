const API_BASE = "http://localhost:8081/auth"; // will replace with backend base thing

// REGISTER
async function register() {
  const fullName = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Registered successfully! You can now log in.");
    window.location.href = "login.html";
  } else {
    alert(data.message || "Registration failed.");
  }
}

// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE}/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("access_token", data.jwt);
    localStorage.setItem("refresh_token", data.refresh_token);
    alert("Logged in!");
    window.location.href = "index.html";
  } else {
    alert(data.message || "Login failed.");
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  alert("Logged out.");
  window.location.href = "login.html";
}

// CHECK TOKEN
function isLoggedIn() {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 > Date.now();
}
