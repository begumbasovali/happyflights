// main.js - Common functionality for the entire application

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication status
  checkAuthenticationStatus();
  
  // Set up logout handlers
  setupLogoutHandlers();
  
  // Set up navigation
  setupNavigation();
});

function checkAuthenticationStatus() {
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");
  
  const userLoggedOut = document.querySelectorAll(".user-logged-out");
  const userLoggedIn = document.querySelectorAll(".user-logged-in");
  const adminLoggedIn = document.querySelectorAll(".admin-logged-in");
  
  if (userToken) {
    // User is logged in
    userLoggedOut.forEach(el => el.classList.add("d-none"));
    userLoggedIn.forEach(el => el.classList.remove("d-none"));
    adminLoggedIn.forEach(el => el.classList.add("d-none"));
    
    // Set username in dropdown
    setUserDisplayName(userToken);
  } else if (adminToken) {
    // Admin is logged in
    userLoggedOut.forEach(el => el.classList.add("d-none"));
    userLoggedIn.forEach(el => el.classList.add("d-none"));
    adminLoggedIn.forEach(el => el.classList.remove("d-none"));
  } else {
    // No one is logged in
    userLoggedOut.forEach(el => el.classList.remove("d-none"));
    userLoggedIn.forEach(el => el.classList.add("d-none"));
    adminLoggedIn.forEach(el => el.classList.add("d-none"));
  }
}

function setUserDisplayName(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const usernameDisplay = document.getElementById("username-display");
    if (usernameDisplay && payload.username) {
      usernameDisplay.textContent = payload.username;
    }
  } catch (error) {
    console.error("Error decoding token:", error);
  }
}

function setupLogoutHandlers() {
  // User logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function(e) {
      e.preventDefault();
      logout('user');
    });
  }
  
  // Admin logout
  const adminLogoutBtn = document.getElementById("admin-logout-btn");
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", function(e) {
      e.preventDefault();
      logout('admin');
    });
  }
}

function logout(type) {
  if (type === 'user') {
    localStorage.removeItem("userToken");
  } else if (type === 'admin') {
    localStorage.removeItem("adminToken");
  }
  
  // Show logout message
  showLogoutMessage();
  
  // Redirect to home after a short delay
  setTimeout(() => {
    window.location.href = "/";
  }, 1500);
}

function showLogoutMessage() {
  // Create and show logout message
  const logoutAlert = document.createElement('div');
  logoutAlert.className = 'alert alert-success position-fixed';
  logoutAlert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  logoutAlert.innerHTML = `
    <i class="fas fa-check-circle"></i> Logged out successfully! Redirecting...
  `;
  
  document.body.appendChild(logoutAlert);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (logoutAlert.parentNode) {
      logoutAlert.parentNode.removeChild(logoutAlert);
    }
  }, 3000);
}

function setupNavigation() {
  // Add active class to current page
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Utility function to check if user is authenticated
function isUserAuthenticated() {
  return !!localStorage.getItem("userToken");
}

// Utility function to check if admin is authenticated
function isAdminAuthenticated() {
  return !!localStorage.getItem("adminToken");
}

// Utility function to get user data from token
function getUserData() {
  const token = localStorage.getItem("userToken");
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error("Error decoding user token:", error);
    return null;
  }
}

// Utility function to get admin data from token
function getAdminData() {
  const token = localStorage.getItem("adminToken");
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error("Error decoding admin token:", error);
    return null;
  }
}

// Make utility functions available globally
window.isUserAuthenticated = isUserAuthenticated;
window.isAdminAuthenticated = isAdminAuthenticated;
window.getUserData = getUserData;
window.getAdminData = getAdminData;

// Format date for display
function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-GB", options);
}

// Format price for display
function formatPrice(price) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
}

// Get duration between two dates
function getFlightDuration(departureTime, arrivalTime) {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  const durationMs = arrival - departure;

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

// Show alert message
function showAlert(message, type, container) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = "alert";

  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  container.prepend(alertDiv);

  // Auto dismiss after 5 seconds
  setTimeout(() => {
    const bsAlert = new bootstrap.Alert(alertDiv);
    bsAlert.close();
  }, 5000);
}
