// login.js - User login functionality

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is already logged in
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");
  
  if (userToken || adminToken) {
    // Redirect to home page
    window.location.href = "/";
    return;
  }

  // Set up form event listeners
  setupUserLogin();
  setupUserRegister();
  setupAdminLogin();
  setupFormToggle();
  setupTabSwitching();
});

// User login functionality
function setupUserLogin() {
  const userLoginForm = document.getElementById("user-login-form");
  if (userLoginForm) {
    userLoginForm.addEventListener("submit", handleUserLogin);
  }
}

function handleUserLogin(e) {
  e.preventDefault();

  const email = document.getElementById("user-email").value;
  const password = document.getElementById("user-password").value;
  const errorDiv = document.getElementById("user-login-error");

  // Hide any previous errors
  errorDiv.classList.add("d-none");

  fetch("/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    })
    .then((data) => {
      // Store user token
      localStorage.setItem("userToken", data.token);

      // Show success message
      showSuccess("Login successful! Redirecting...");
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    })
    .catch((error) => {
      console.error("User login error:", error);
      errorDiv.textContent = "Invalid email or password. Please try again.";
      errorDiv.classList.remove("d-none");
    });
}

// User registration functionality
function setupUserRegister() {
  const userRegisterForm = document.getElementById("user-register-form");
  if (userRegisterForm) {
    userRegisterForm.addEventListener("submit", handleUserRegister);
  }
}

function handleUserRegister(e) {
  e.preventDefault();

  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-confirm-password").value;
  const errorDiv = document.getElementById("register-error");

  // Hide any previous errors
  errorDiv.classList.add("d-none");

  // Validate passwords match
  if (password !== confirmPassword) {
    errorDiv.textContent = "Passwords do not match.";
    errorDiv.classList.remove("d-none");
    return;
  }

  // Validate password length
  if (password.length < 6) {
    errorDiv.textContent = "Password must be at least 6 characters long.";
    errorDiv.classList.remove("d-none");
    return;
  }

  fetch("/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    })
    .then((data) => {
      // Store user token
      localStorage.setItem("userToken", data.token);
      
      // Show success message
      showSuccess("Registration successful! Redirecting...");
      
      // Redirect to home page
      setTimeout(() => {
      window.location.href = "/";
      }, 1500);
    })
    .catch((error) => {
      console.error("User registration error:", error);
      errorDiv.textContent = error.message || "Registration failed. Please try again.";
      errorDiv.classList.remove("d-none");
    });
}

// Admin login functionality
function setupAdminLogin() {
  const adminLoginForm = document.getElementById("admin-login-form");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", handleAdminLogin);
  }
}

function handleAdminLogin(e) {
  e.preventDefault();

  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;
  const errorDiv = document.getElementById("admin-login-error");

  // Hide any previous errors
  errorDiv.classList.add("d-none");

  console.log("Admin login attempt:", { username, password: "***" });

  fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      console.log("Admin login response status:", response.status);
      console.log("Admin login response headers:", Object.fromEntries(response.headers));
      
      if (!response.ok) {
        return response.text().then(text => {
          console.error("Admin login error response:", text);
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch (e) {
            errorData = { message: text };
          }
          throw new Error(errorData.message || `HTTP ${response.status}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Admin login success:", data);
      
      // Store admin token
      localStorage.setItem("adminToken", data.token);
      
      // Show success message
      showSuccess("Admin login successful! Redirecting...");
      
      // Redirect to admin panel
      setTimeout(() => {
        window.location.href = "/admin/panel";
      }, 1500);
    })
    .catch((error) => {
      console.error("Admin login error:", error);
      console.error("Error stack:", error.stack);
      errorDiv.textContent = error.message || "Login failed. Please try again.";
      errorDiv.classList.remove("d-none");
    });
}

// Form toggle functionality
function setupFormToggle() {
  const showRegisterBtn = document.getElementById("show-register-btn");
  const showLoginBtn = document.getElementById("show-login-btn");
  const loginContainer = document.getElementById("user-login-form-container");
  const registerContainer = document.getElementById("user-register-form-container");

  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", () => {
      loginContainer.classList.add("d-none");
      registerContainer.classList.remove("d-none");
    });
  }

  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", () => {
      registerContainer.classList.add("d-none");
      loginContainer.classList.remove("d-none");
    });
  }
}

// Manual tab switching functionality
function setupTabSwitching() {
  const userTab = document.getElementById("user-tab");
  const adminTab = document.getElementById("admin-tab");
  const userLoginPane = document.getElementById("user-login");
  const adminLoginPane = document.getElementById("admin-login");

  if (userTab && adminTab && userLoginPane && adminLoginPane) {
    // User tab click
    userTab.addEventListener("click", function(e) {
      e.preventDefault();
      
      // Update tab states
      userTab.classList.add("active");
      adminTab.classList.remove("active");
      
      // Update content states
      userLoginPane.classList.add("show", "active");
      userLoginPane.classList.remove("fade");
      adminLoginPane.classList.remove("show", "active");
      adminLoginPane.classList.add("fade");
      
      console.log("Switched to User tab");
    });

    // Admin tab click
    adminTab.addEventListener("click", function(e) {
      e.preventDefault();
      
      // Update tab states
      adminTab.classList.add("active");
      userTab.classList.remove("active");
      
      // Update content states
      adminLoginPane.classList.add("show", "active");
      adminLoginPane.classList.remove("fade");
      userLoginPane.classList.remove("show", "active");
      userLoginPane.classList.add("fade");
      
      console.log("Switched to Admin tab");
    });

    // Ensure user tab is active by default
    userTab.classList.add("active");
    adminTab.classList.remove("active");
    userLoginPane.classList.add("show", "active");
    userLoginPane.classList.remove("fade");
    adminLoginPane.classList.remove("show", "active");
    adminLoginPane.classList.add("fade");
  }
}

// Utility function to show success messages
function showSuccess(message) {
  // Remove any existing alerts
  const existingAlerts = document.querySelectorAll('.alert-success');
  existingAlerts.forEach(alert => alert.remove());

  // Create success alert
  const successAlert = document.createElement('div');
  successAlert.className = 'alert alert-success mt-3';
  successAlert.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  
  // Add to the active form
  const activeTab = document.querySelector('.tab-pane.active');
  if (activeTab) {
    activeTab.appendChild(successAlert);
  }
}
