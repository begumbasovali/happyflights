// admin-panel.js - For admin panel functionality

document.addEventListener("DOMContentLoaded", function () {
  // Check if admin is logged in
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    // Redirect to admin login page
    window.location.href = "/admin/login";
    return;
  }

  // Set up manual tab switching
  setupTabSwitching();

  // Load cities for dropdowns
  loadCities();

  // Load all flights
  loadFlights();

  // Set up logout button
  const logoutBtn = document.getElementById("logout-admin");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutAdmin);
  }

  // Set up add flight form
  const saveFlightBtn = document.getElementById("save-flight-btn");
  if (saveFlightBtn) {
    saveFlightBtn.addEventListener("click", addFlight);
  }

  // Set up update flight button
  const updateFlightBtn = document.getElementById("update-flight-btn");
  if (updateFlightBtn) {
    updateFlightBtn.addEventListener("click", updateFlight);
  }

  // Set up delete flight button
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", deleteFlight);
  }
});

// Manual tab switching functionality for admin panel
function setupTabSwitching() {
  const flightsTab = document.getElementById("flights-tab");
  const ticketsTab = document.getElementById("tickets-tab");
  const flightsPane = document.getElementById("flights-panel");
  const ticketsPane = document.getElementById("tickets-panel");

  if (flightsTab && ticketsTab && flightsPane && ticketsPane) {
    // Flights tab click
    flightsTab.addEventListener("click", function(e) {
      e.preventDefault();
      
      // Update tab states
      flightsTab.classList.add("active");
      ticketsTab.classList.remove("active");
      
      // Update content states
      flightsPane.classList.add("show", "active");
      flightsPane.classList.remove("fade");
      ticketsPane.classList.remove("show", "active");
      ticketsPane.classList.add("fade");
      
      console.log("Switched to Flights tab");
    });

    // Tickets tab click
    ticketsTab.addEventListener("click", function(e) {
      e.preventDefault();
      
      // Update tab states
      ticketsTab.classList.add("active");
      flightsTab.classList.remove("active");
      
      // Update content states
      ticketsPane.classList.add("show", "active");
      ticketsPane.classList.remove("fade");
      flightsPane.classList.remove("show", "active");
      flightsPane.classList.add("fade");
      
      console.log("Switched to Tickets tab");
      
      // Load ticket bookings when switching to tickets tab
      loadTicketBookings();
    });

    // Ensure flights tab is active by default
    flightsTab.classList.add("active");
    ticketsTab.classList.remove("active");
    flightsPane.classList.add("show", "active");
    flightsPane.classList.remove("fade");
    ticketsPane.classList.remove("show", "active");
    ticketsPane.classList.add("fade");
  } else {
    console.error("Tab elements not found:", {
      flightsTab, 
      ticketsTab, 
      flightsPane, 
      ticketsPane
    });
  }
}

// Load cities from API
function loadCities() {
  fetch("/api/cities")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load cities");
      }
      return response.json();
    })
    .then((cities) => {
      populateCityDropdowns(cities);
    })
    .catch((error) => {
      console.error("Error loading cities:", error);
    });
}

// Populate city dropdowns
function populateCityDropdowns(cities) {
  const citySelects = [
    document.getElementById("from-city"),
    document.getElementById("to-city"),
    document.getElementById("edit-from-city"),
    document.getElementById("edit-to-city"),
  ];

  citySelects.forEach((select) => {
    if (select) {
      // Clear existing options
      select.innerHTML =
        '<option value="" selected disabled>Select city</option>';

      // Add city options
      cities.forEach((city) => {
        const option = document.createElement("option");
        option.value = city.city_name;
        option.textContent = city.city_name;
        select.appendChild(option);
      });
    }
  });
}

// Load all flights
function loadFlights() {
  const adminToken = localStorage.getItem("adminToken");

  fetch("/api/flights/admin/all", {
    headers: {
      "x-auth-token": adminToken,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load flights");
      }
      return response.json();
    })
    .then((flights) => {
      displayFlights(flights);
    })
    .catch((error) => {
      console.error("Error loading flights:", error);

      const loadingElement = document.getElementById("loading-flights");
      loadingElement.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle"></i> Error loading flights. Please refresh the page.
      </div>
    `;
    });
}

// Display flights in table
function displayFlights(flights) {
  const tableBody = document.querySelector("#flights-table tbody");
  const loadingElement = document.getElementById("loading-flights");

  // Hide loading message
  loadingElement.style.display = "none";

  // Clear table
  tableBody.innerHTML = "";

  // Sort flights by departure time (newest first)
  flights.sort(
    (a, b) => new Date(b.departure_time) - new Date(a.departure_time)
  );

  flights.forEach((flight) => {
    const departureDate = new Date(flight.departure_time);
    const arrivalDate = new Date(flight.arrival_time);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${flight.flight_id}</td>
      <td>${flight.from_city}</td>
      <td>${flight.to_city}</td>
      <td>${formatDate(flight.departure_time)}</td>
      <td>${formatDate(flight.arrival_time)}</td>
      <td>${formatPrice(flight.price)}</td>
      <td>
        <span class="${
          flight.seats_available <= 5 ? "text-danger fw-bold" : ""
        }">
          ${flight.seats_available}/${flight.seats_total}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary me-1 edit-flight-btn" data-flight-id="${
          flight.flight_id
        }">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-flight-btn" data-flight-id="${
          flight.flight_id
        }" 
          data-from="${flight.from_city}" data-to="${flight.to_city}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Add event listeners for edit and delete buttons
  document.querySelectorAll(".edit-flight-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      loadFlightForEdit(btn.getAttribute("data-flight-id"));
    });
  });

  document.querySelectorAll(".delete-flight-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const flightId = btn.getAttribute("data-flight-id");
      const fromCity = btn.getAttribute("data-from");
      const toCity = btn.getAttribute("data-to");

      // Set modal data
      document.getElementById("delete-flight-id").textContent = flightId;
      document.getElementById("delete-flight-from").textContent = fromCity;
      document.getElementById("delete-flight-to").textContent = toCity;

      // Store flight ID for delete operation
      document
        .getElementById("confirm-delete-btn")
        .setAttribute("data-flight-id", flightId);

      // Show delete modal
      const deleteModal = new bootstrap.Modal(
        document.getElementById("deleteFlightModal")
      );
      deleteModal.show();
    });
  });
}

// Add new flight
function addFlight() {
  const adminToken = localStorage.getItem("adminToken");
  const flightId = document.getElementById("flight-id").value;
  const fromCity = document.getElementById("from-city").value;
  const toCity = document.getElementById("to-city").value;
  const departureTime = document.getElementById("departure-time").value;
  const arrivalTime = document.getElementById("arrival-time").value;
  const price = document.getElementById("price").value;
  const seatsTotal = document.getElementById("seats-total").value;
  const errorElement = document.getElementById("add-flight-error");

  // Validate input
  if (
    !flightId ||
    !fromCity ||
    !toCity ||
    !departureTime ||
    !arrivalTime ||
    !price ||
    !seatsTotal
  ) {
    errorElement.textContent = "Please fill in all fields.";
    errorElement.classList.remove("d-none");
    return;
  }

  if (fromCity === toCity) {
    errorElement.textContent =
      "Departure and arrival cities cannot be the same.";
    errorElement.classList.remove("d-none");
    return;
  }

  if (new Date(departureTime) >= new Date(arrivalTime)) {
    errorElement.textContent = "Arrival time must be after departure time.";
    errorElement.classList.remove("d-none");
    return;
  }

  // Hide error message
  errorElement.classList.add("d-none");

  const flightData = {
    flight_id: flightId,
    from_city: fromCity,
    to_city: toCity,
    departure_time: departureTime,
    arrival_time: arrivalTime,
    price: parseFloat(price),
    seats_total: parseInt(seatsTotal),
  };

  fetch("/api/flights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": adminToken,
    },
    body: JSON.stringify(flightData),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "Failed to add flight");
        });
      }
      return response.json();
    })
    .then((flight) => {
      // Hide modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addFlightModal")
      );
      modal.hide();

      // Reset form
      document.getElementById("add-flight-form").reset();

      // Reload flights
      loadFlights();

      // Show success message
      showToast("Flight added successfully", "success");
    })
    .catch((error) => {
      console.error("Error adding flight:", error);
      errorElement.textContent = error.message;
      errorElement.classList.remove("d-none");
    });
}

// Load flight data for editing
function loadFlightForEdit(flightId) {
  const adminToken = localStorage.getItem("adminToken");

  fetch(`/api/flights/${flightId}`, {
    headers: {
      "x-auth-token": adminToken,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load flight details");
      }
      return response.json();
    })
    .then((flight) => {
      // Format dates for datetime-local input
      const departureDateTime = new Date(flight.departure_time)
        .toISOString()
        .slice(0, 16);
      const arrivalDateTime = new Date(flight.arrival_time)
        .toISOString()
        .slice(0, 16);

      // Populate edit form
      document.getElementById("edit-flight-id").value = flight.flight_id;
      document.getElementById("edit-flight-id-display").value =
        flight.flight_id;
      document.getElementById("edit-from-city").value = flight.from_city;
      document.getElementById("edit-to-city").value = flight.to_city;
      document.getElementById("edit-departure-time").value = departureDateTime;
      document.getElementById("edit-arrival-time").value = arrivalDateTime;
      document.getElementById("edit-price").value = flight.price;
      document.getElementById("edit-seats-total").value = flight.seats_total;
      document.getElementById("edit-seats-available").value =
        flight.seats_available;

      // Show edit modal
      const editModal = new bootstrap.Modal(
        document.getElementById("editFlightModal")
      );
      editModal.show();
    })
    .catch((error) => {
      console.error("Error loading flight for edit:", error);
      showToast("Error loading flight details", "danger");
    });
}

// Update flight
function updateFlight() {
  const adminToken = localStorage.getItem("adminToken");
  const flightId = document.getElementById("edit-flight-id").value;
  const fromCity = document.getElementById("edit-from-city").value;
  const toCity = document.getElementById("edit-to-city").value;
  const departureTime = document.getElementById("edit-departure-time").value;
  const arrivalTime = document.getElementById("edit-arrival-time").value;
  const price = document.getElementById("edit-price").value;
  const seatsTotal = document.getElementById("edit-seats-total").value;
  const seatsAvailable = document.getElementById("edit-seats-available").value;
  const errorElement = document.getElementById("edit-flight-error");

  // Validate input
  if (
    !fromCity ||
    !toCity ||
    !departureTime ||
    !arrivalTime ||
    !price ||
    !seatsTotal ||
    !seatsAvailable
  ) {
    errorElement.textContent = "Please fill in all fields.";
    errorElement.classList.remove("d-none");
    return;
  }

  if (fromCity === toCity) {
    errorElement.textContent =
      "Departure and arrival cities cannot be the same.";
    errorElement.classList.remove("d-none");
    return;
  }

  if (new Date(departureTime) >= new Date(arrivalTime)) {
    errorElement.textContent = "Arrival time must be after departure time.";
    errorElement.classList.remove("d-none");
    return;
  }

  if (parseInt(seatsAvailable) > parseInt(seatsTotal)) {
    errorElement.textContent = "Available seats cannot exceed total seats.";
    errorElement.classList.remove("d-none");
    return;
  }

  // Hide error message
  errorElement.classList.add("d-none");

  const flightData = {
    from_city: fromCity,
    to_city: toCity,
    departure_time: departureTime,
    arrival_time: arrivalTime,
    price: parseFloat(price),
    seats_total: parseInt(seatsTotal),
    seats_available: parseInt(seatsAvailable),
  };

  fetch(`/api/flights/${flightId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": adminToken,
    },
    body: JSON.stringify(flightData),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "Failed to update flight");
        });
      }
      return response.json();
    })
    .then((flight) => {
      // Hide modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editFlightModal")
      );
      modal.hide();

      // Reload flights
      loadFlights();

      // Show success message
      showToast("Flight updated successfully", "success");
    })
    .catch((error) => {
      console.error("Error updating flight:", error);
      errorElement.textContent = error.message;
      errorElement.classList.remove("d-none");
    });
}

// Delete flight
function deleteFlight() {
  const adminToken = localStorage.getItem("adminToken");
  const flightId = document
    .getElementById("confirm-delete-btn")
    .getAttribute("data-flight-id");
  const errorElement = document.getElementById("delete-flight-error");

  // First attempt - normal delete
  fetch(`/api/flights/${flightId}`, {
    method: "DELETE",
    headers: {
      "x-auth-token": adminToken,
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          // If flight has bookings, ask for confirmation
          if (data.requiresForce && data.bookedSeats > 0) {
            const confirmMessage = `⚠️ WARNING: This flight has ${data.bookedSeats} booked seats.\n\nCancelling this flight will:\n- Affect ${data.bookedSeats} passengers\n- Require passenger notifications\n- Process refunds\n\nAre you sure you want to CANCEL this flight?`;
            
            if (confirm(confirmMessage)) {
              // Make second request with force=true
              return fetch(`/api/flights/${flightId}?force=true`, {
                method: "DELETE",
                headers: {
                  "x-auth-token": adminToken,
                },
              })
              .then(forceResponse => {
                if (!forceResponse.ok) {
                  return forceResponse.json().then(forceData => {
                    throw new Error(forceData.message || "Failed to cancel flight");
                  });
                }
                return forceResponse.json();
              });
            } else {
              throw new Error("Flight cancellation cancelled by user");
            }
          }
          throw new Error(data.message || "Failed to delete flight");
        });
      }
      return response.json();
    })
    .then((result) => {
      // Hide modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("deleteFlightModal")
      );
      modal.hide();

      // Reload flights
      loadFlights();

      // Show appropriate success message
      if (result.affectedPassengers > 0) {
        showToast(`Flight cancelled! ${result.affectedPassengers} passengers affected. ${result.warning}`, "warning");
      } else {
        showToast("Flight deleted successfully", "success");
      }
    })
    .catch((error) => {
      console.error("Error deleting flight:", error);
      if (error.message !== "Flight cancellation cancelled by user") {
        errorElement.textContent = error.message;
        errorElement.classList.remove("d-none");
      }
    });
}

// Logout admin
function logoutAdmin() {
  localStorage.removeItem("adminToken");
  window.location.href = "/admin/login";
}

// Show toast notification
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className =
      "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  // Create toast
  const toastId = "toast-" + Date.now();
  const toastElement = document.createElement("div");
  toastElement.className = `toast bg-${type} text-white`;
  toastElement.id = toastId;
  toastElement.setAttribute("role", "alert");
  toastElement.setAttribute("aria-live", "assertive");
  toastElement.setAttribute("aria-atomic", "true");

  toastElement.innerHTML = `
    <div class="toast-header bg-${type} text-white">
      <strong class="me-auto">HappyFlights Admin</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;

  // Add to container
  toastContainer.appendChild(toastElement);

  // Initialize and show toast
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 5000,
  });
  toast.show();
}

// Load all ticket bookings
function loadTicketBookings() {
  console.log("🎫 loadTicketBookings function called");
  
  const adminToken = localStorage.getItem("adminToken");
  const loadingElement = document.getElementById("loading-tickets");
  const noTicketsElement = document.getElementById("no-tickets");
  const tableBody = document.querySelector("#tickets-table tbody");

  console.log("🎫 Loading element:", loadingElement);
  console.log("🎫 No tickets element:", noTicketsElement);
  console.log("🎫 Table body:", tableBody);

  // Show loading
  loadingElement.style.display = "block";
  noTicketsElement.classList.add("d-none");

  console.log("🎫 Making fetch request to /api/admin/tickets");

  fetch("/api/admin/tickets", {
    headers: {
      "x-auth-token": adminToken,
    },
  })
    .then((response) => {
      console.log("🎫 Response received:", response.status, response.ok);
      if (!response.ok) {
        throw new Error("Failed to load ticket bookings");
      }
      return response.json();
    })
    .then((tickets) => {
      console.log("🎫 Tickets data received:", tickets);
      console.log("🎫 Calling displayTicketBookings...");
      displayTicketBookings(tickets);
    })
    .catch((error) => {
      console.error("🎫 Error in loadTicketBookings:", error);
      
      // Hide loading
      loadingElement.style.display = "none";
      
      // Show error message
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center">
            <div class="alert alert-danger mb-0">
              <i class="fas fa-exclamation-circle"></i> Error loading ticket bookings: ${error.message}
            </div>
          </td>
        </tr>
      `;
    });
}

// Display ticket bookings in table
function displayTicketBookings(tickets) {
  console.log("🎫 Displaying ticket bookings:", tickets.length, "tickets");
  console.log("🎫 First ticket structure:", tickets[0]);
  
  const tableBody = document.querySelector("#tickets-table tbody");
  const loadingElement = document.getElementById("loading-tickets");
  const noTicketsElement = document.getElementById("no-tickets");

  // Hide loading
  loadingElement.style.display = "none";

  // Clear table
  tableBody.innerHTML = "";

  if (tickets.length === 0) {
    // Show no tickets message
    noTicketsElement.classList.remove("d-none");
    return;
  }

  // Hide no tickets message
  noTicketsElement.classList.add("d-none");

  // Sort tickets by booking date (newest first)
  tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  tickets.forEach((ticket, index) => {
    console.log(`🎫 Processing ticket ${index + 1}:`, ticket);
    
    const row = document.createElement("tr");
    
    // Extract flight details with fallback handling
    const flightDetails = ticket.flight_details;
    console.log(`🎫 Flight details for ticket ${ticket.ticket_id}:`, flightDetails);
    
    // Handle route with multiple possible field names
    let route = "N/A";
    if (flightDetails) {
      const fromCity = flightDetails.from || flightDetails.from_city || "Unknown";
      const toCity = flightDetails.to || flightDetails.to_city || "Unknown";
      route = `${fromCity} → ${toCity}`;
      console.log(`🎫 Route calculated: ${route}`);
    }
    
    const departureTime = flightDetails ? formatDate(flightDetails.departure_time) : "N/A";
    const price = flightDetails ? formatPrice(flightDetails.price) : "N/A";
    
    // Status badge with colors
    const status = ticket.status || 'confirmed';
    const statusBadgeClass = status === 'cancelled' ? 'bg-danger' : 'bg-success';
    const statusText = status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED';
    
    // Cancellation info
    const cancellationReason = ticket.cancellation_reason || '';
    const cancelledDate = ticket.cancelled_at ? formatDate(ticket.cancelled_at) : '';
    
    row.innerHTML = `
      <td>
        <span class="badge bg-primary">${ticket.ticket_id}</span>
      </td>
      <td>
        <strong>${ticket.passenger_name} ${ticket.passenger_surname}</strong>
      </td>
      <td>
        <a href="mailto:${ticket.passenger_email}" class="text-decoration-none">
          ${ticket.passenger_email}
        </a>
      </td>
      <td>
        <span class="badge bg-info">${ticket.flight_id}</span>
      </td>
      <td>${route}</td>
      <td>${departureTime}</td>
      <td>
        ${ticket.seat_number ? 
          `<span class="badge bg-secondary">${ticket.seat_number}</span>` : 
          '<span class="text-muted">Not assigned</span>'
        }
      </td>
      <td>
        <span class="badge ${statusBadgeClass}" title="${cancellationReason ? `Reason: ${cancellationReason}` : ''}">
          ${statusText}
        </span>
        ${status === 'cancelled' && cancelledDate ? `<br><small class="text-muted">Cancelled: ${cancelledDate}</small>` : ''}
      </td>
      <td>
        <span class="${status === 'cancelled' ? 'text-muted text-decoration-line-through' : 'text-success fw-bold'}">
          ${price}
        </span>
        ${status === 'cancelled' ? '<br><small class="text-danger">Refund due</small>' : ''}
      </td>
      <td>
        <small class="text-muted">
          ${formatDate(ticket.created_at)}
        </small>
      </td>
    `;

    tableBody.appendChild(row);
  });
  
  console.log("🎫 Ticket display completed successfully");
}

// Format date helper (if not already defined)
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format price helper (if not already defined)
function formatPrice(price) {
  return `₺${parseFloat(price).toFixed(2)}`;
}
