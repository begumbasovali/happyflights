// register.js - User registration functionality

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is already logged in
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    // Redirect to home
    window.location.href = "/";
    return;
  }

  // Set up registration form
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", registerUser);
  }
});

// User registration function
function registerUser(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const registerError = document.getElementById("register-error");
  const passwordMatchError = document.getElementById("password-match-error");

  // Hide any previous errors
  registerError.classList.add("d-none");
  passwordMatchError.classList.add("d-none");

  // Check if passwords match
  if (password !== confirmPassword) {
    passwordMatchError.classList.remove("d-none");
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
        return response.json().then((data) => {
          throw new Error(data.message || "Registration failed");
        });
      }
      return response.json();
    })
    .then((data) => {
      // Store user token
      localStorage.setItem("userToken", data.token);

      // Redirect to home
      window.location.href = "/";
    })
    .catch((error) => {
      console.error("Registration error:", error);
      registerError.textContent = error.message;
      registerError.classList.remove("d-none");
    });
}
