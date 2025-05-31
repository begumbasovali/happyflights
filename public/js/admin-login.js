// admin-login.js - For admin login functionality

document.addEventListener("DOMContentLoaded", function () {
  // Check if admin is already logged in
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    // Redirect to admin panel
    window.location.href = "/admin/panel";
    return;
  }

  // Set up admin login form
  const adminLoginForm = document.getElementById("admin-login-form");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", adminLogin);
  }
});

// Admin login function
function adminLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const loginError = document.getElementById("login-error");

  // Hide any previous errors
  loginError.classList.add("d-none");

  fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    })
    .then((data) => {
      // Store admin token
      localStorage.setItem("adminToken", data.token);

      // Redirect to admin panel
      window.location.href = "/admin/panel";
    })
    .catch((error) => {
      console.error("Admin login error:", error);
      loginError.classList.remove("d-none");
    });
}
