// my-tickets.js - For viewing ticket history by email

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication status
  checkAuthAndLoadTickets();
  
  // Set up event listeners
  setupEventListeners();
});

function checkAuthAndLoadTickets() {
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");
  
  if (userToken) {
    // User is logged in - get email from token and load tickets automatically
    getUserEmailAndLoadTickets(userToken);
  } else if (adminToken) {
    // Admin is logged in - redirect to admin panel
    window.location.href = "/admin/panel";
  } else {
    // Not logged in - show email search form
    showEmailSearchForm();
  }
}

function getUserEmailAndLoadTickets(token) {
  // Hide email search, show logged user message
  document.getElementById("email-search-section").classList.add("d-none");
  document.getElementById("logged-user-message").classList.remove("d-none");
  
  // Decode token to get user email (basic decode, not secure but for UI purposes)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userEmail = payload.email;
    
    if (userEmail) {
      loadTicketsByEmail(userEmail);
    } else {
      showError("Unable to retrieve user information. Please try logging in again.");
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    showError("Invalid authentication. Please log in again.");
  }
}

function showEmailSearchForm() {
  document.getElementById("email-search-section").classList.remove("d-none");
  document.getElementById("logged-user-message").classList.add("d-none");
}

function setupEventListeners() {
  const searchBtn = document.getElementById("search-tickets-btn");
  const emailInput = document.getElementById("search-email");
  
  if (searchBtn) {
    searchBtn.addEventListener("click", handleEmailSearch);
  }
  
  if (emailInput) {
    emailInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        handleEmailSearch();
      }
    });
  }
}

function handleEmailSearch() {
  const email = document.getElementById("search-email").value.trim();
  
  if (!email) {
    showError("Please enter a valid email address.");
    return;
  }
  
  if (!isValidEmail(email)) {
    showError("Please enter a valid email format.");
    return;
  }
  
  loadTicketsByEmail(email);
}

function loadTicketsByEmail(email) {
  showLoading(true);
  hideError();
  
  fetch(`/api/tickets/by-email/${encodeURIComponent(email)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(tickets => {
      showLoading(false);
      displayTickets(tickets);
    })
    .catch(error => {
      console.error("Error loading tickets:", error);
      showLoading(false);
      showError("Error loading tickets. Please try again.");
    });
}

function displayTickets(tickets) {
  const ticketsList = document.getElementById("tickets-list");
  const noTicketsMessage = document.getElementById("no-tickets-message");

  // Clear previous results
  ticketsList.innerHTML = "";
  noTicketsMessage.classList.add("d-none");
  
  if (!tickets || tickets.length === 0) {
    noTicketsMessage.classList.remove("d-none");
    return;
  }

  tickets.forEach(ticket => {
    const ticketCard = createTicketCard(ticket);
    ticketsList.appendChild(ticketCard);
  });
}

function createTicketCard(ticket) {
  const col = document.createElement("div");
  col.className = "col-md-6 col-lg-4";
  
  // Format dates
  const departureDate = new Date(ticket.flight.departure_time).toLocaleDateString();
  const departureTime = new Date(ticket.flight.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const arrivalTime = new Date(ticket.flight.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  // Status color mapping
  const statusColors = {
    'confirmed': 'success',
    'pending': 'warning',
    'cancelled': 'danger'
  };
  
  const statusColor = statusColors[ticket.status] || 'secondary';
  
  // Get correct field names for from and to cities
  const fromCity = ticket.flight.from_city || ticket.flight.from || 'Unknown';
  const toCity = ticket.flight.to_city || ticket.flight.to || 'Unknown';
  
  // Cancellation info
  const isCancelled = ticket.status === 'cancelled';
  const cancellationReason = ticket.cancellation_reason || 'No reason provided';
  const cancelledDate = ticket.cancelled_at ? new Date(ticket.cancelled_at).toLocaleDateString() : '';
  
  col.innerHTML = `
    <div class="card h-100 shadow-sm ${isCancelled ? 'border-danger' : ''}">
      <div class="card-header ${isCancelled ? 'bg-danger text-white' : 'bg-light'}">
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            <i class="fas fa-plane"></i> ${ticket.flight.flight_id}
          </h6>
          <span class="badge bg-${statusColor}">
            ${isCancelled ? '❌ CANCELLED' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </span>
        </div>
      </div>
    <div class="card-body">
        ${isCancelled ? `
          <div class="alert alert-danger mb-3">
            <i class="fas fa-exclamation-triangle"></i> 
            <strong>This ticket has been cancelled</strong><br>
            <small>Reason: ${cancellationReason}</small>
            ${cancelledDate ? `<br><small>Cancelled on: ${cancelledDate}</small>` : ''}
          </div>
        ` : ''}
        
        <div class="route mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-center">
              <h6 class="mb-0">${fromCity}</h6>
              <small class="text-muted">${departureTime}</small>
            </div>
            <div class="text-center">
              <i class="fas fa-arrow-right ${isCancelled ? 'text-muted' : 'text-primary'}"></i>
            </div>
            <div class="text-center">
              <h6 class="mb-0">${toCity}</h6>
              <small class="text-muted">${arrivalTime}</small>
            </div>
          </div>
        </div>
        
        <div class="ticket-details">
          <div class="row text-sm">
            <div class="col-6">
              <strong>Date:</strong><br>
              <span class="text-muted">${departureDate}</span>
            </div>
            <div class="col-6">
              <strong>Seat:</strong><br>
              <span class="text-muted">${ticket.seat_number}</span>
            </div>
            <div class="col-6 mt-2">
              <strong>Passenger:</strong><br>
              <span class="text-muted">${ticket.passenger_name}</span>
            </div>
            <div class="col-6 mt-2">
              <strong>Price:</strong><br>
              <span class="${isCancelled ? 'text-muted text-decoration-line-through' : 'text-success fw-bold'}">₺${ticket.price}</span>
              ${isCancelled ? '<br><small class="text-danger">Refund pending</small>' : ''}
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer ${isCancelled ? 'bg-light text-muted' : 'bg-light'}">
        <small class="text-muted">
          <i class="fas fa-envelope"></i> ${ticket.email}
        </small>
        ${ticket.status === 'confirmed' ? `
          <button class="btn btn-outline-primary btn-sm float-end" onclick="downloadTicket('${ticket._id}')">
            <i class="fas fa-download"></i> Download
          </button>
        ` : `
          <span class="float-end text-muted small">
            <i class="fas fa-ban"></i> Not available for cancelled tickets
          </span>
        `}
      </div>
    </div>
  `;

  return col;
}

function downloadTicket(ticketId) {
  // Placeholder for ticket download functionality
  alert(`Download functionality for ticket ${ticketId} will be implemented.`);
}

function showLoading(show) {
  const loadingDiv = document.getElementById("loading-tickets");
  if (show) {
    loadingDiv.classList.remove("d-none");
  } else {
    loadingDiv.classList.add("d-none");
  }
}

function showError(message) {
  const errorDiv = document.getElementById("search-error");
  errorDiv.textContent = message;
  errorDiv.classList.remove("d-none");
}

function hideError() {
  const errorDiv = document.getElementById("search-error");
  errorDiv.classList.add("d-none");
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
