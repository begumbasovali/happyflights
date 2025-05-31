// seat-selector.js - Seat selection functionality for flight booking

document.addEventListener("DOMContentLoaded", function () {
  const seatSelectContainer = document.getElementById(
    "seat-selection-container"
  );

  if (seatSelectContainer) {
    // Check if we have flight data
    const flightId = document.getElementById("flight-id").value;
    if (flightId) {
      loadFlightSeats(flightId);
    }
  }
});

// Load and render the seat map
function loadFlightSeats(flightId) {
  fetch(`/api/flights/${flightId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Flight not found");
      }
      return response.json();
    })
    .then((flight) => {
      renderSeatMap(flight);
    })
    .catch((error) => {
      console.error("Error loading seat data:", error);
      document.getElementById("seat-selection-container").innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> Could not load seat map. Please try again.
        </div>
      `;
    });
}

// Render the interactive seat map
function renderSeatMap(flight) {
  const seatsTotal = flight.seats_total;
  const seatsAvailable = flight.seats_available;
  const bookedSeats = seatsTotal - seatsAvailable;

  const container = document.getElementById("seat-selection-container");

  // Create a simple airplane layout
  // For simplicity, assuming 6 seats per row (3-3 configuration)
  const rows = Math.ceil(seatsTotal / 6);

  let html = `
    <h5 class="mb-3">Select Your Seat <small class="text-muted">(Optional)</small></h5>
    <div class="mb-3">
      <div class="seat-map-container">
        <div class="seat-map-header d-flex justify-content-between mb-2">
          <div class="text-start">Window</div>
          <div class="text-center">Aisle</div>
          <div class="text-end">Window</div>
        </div>
        <div class="airplane-body">
  `;

  // Generate random booked seats for demo
  const bookedSeatIndices = new Set();
  while (bookedSeatIndices.size < bookedSeats) {
    const randomIndex = Math.floor(Math.random() * seatsTotal) + 1;
    bookedSeatIndices.add(randomIndex);
  }

  // Generate seat grid
  let seatIndex = 1;
  for (let row = 1; row <= rows; row++) {
    html += `<div class="seat-row d-flex justify-content-between align-items-center mb-2">`;
    html += `<div class="row-number me-2">${row}</div>`;

    // Left side (A, B, C)
    for (let i = 0; i < 3; i++) {
      const seatLetter = String.fromCharCode(65 + i); // A, B, C
      const seatId = `${row}${seatLetter}`;

      if (seatIndex <= seatsTotal) {
        const isBooked = bookedSeatIndices.has(seatIndex);
        html += `
          <div class="seat ${isBooked ? "seat-booked" : "seat-available"}" 
               data-seat="${seatId}" 
               ${
                 isBooked
                   ? 'data-bs-toggle="tooltip" title="Already booked"'
                   : ""
               }>
            <i class="fas fa-chair"></i>
            <span class="seat-label">${seatLetter}</span>
          </div>
        `;
      } else {
        html += `<div class="seat seat-placeholder"></div>`;
      }

      seatIndex++;
    }

    // Aisle
    html += `<div class="aisle"></div>`;

    // Right side (D, E, F)
    for (let i = 0; i < 3; i++) {
      const seatLetter = String.fromCharCode(68 + i); // D, E, F
      const seatId = `${row}${seatLetter}`;

      if (seatIndex <= seatsTotal) {
        const isBooked = bookedSeatIndices.has(seatIndex);
        html += `
          <div class="seat ${isBooked ? "seat-booked" : "seat-available"}" 
               data-seat="${seatId}" 
               ${
                 isBooked
                   ? 'data-bs-toggle="tooltip" title="Already booked"'
                   : ""
               }>
            <i class="fas fa-chair"></i>
            <span class="seat-label">${seatLetter}</span>
          </div>
        `;
      } else {
        html += `<div class="seat seat-placeholder"></div>`;
      }

      seatIndex++;
    }

    html += `</div>`;

    // Stop if we've displayed all seats
    if (seatIndex > seatsTotal) {
      break;
    }
  }

  html += `
        </div>
        <div class="seat-map-footer mt-4">
          <div class="d-flex align-items-center justify-content-center">
            <div class="me-4">
              <div class="seat-sample seat-available"></div> Available
            </div>
            <div class="me-4">
              <div class="seat-sample seat-booked"></div> Booked
            </div>
            <div>
              <div class="seat-sample seat-selected"></div> Selected
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mb-3">
      <label for="seat-number" class="form-label">Selected Seat</label>
      <input type="text" class="form-control" id="seat-number" readonly>
      <div class="form-text">Click on a seat to select it, or leave empty for automatic assignment</div>
    </div>
  `;

  container.innerHTML = html;

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Add event listeners to seats
  const availableSeats = container.querySelectorAll(".seat-available");
  availableSeats.forEach((seat) => {
    seat.addEventListener("click", function () {
      // Remove previous selection
      const previousSelected = container.querySelector(".seat-selected");
      if (previousSelected) {
        previousSelected.classList.remove("seat-selected");
        previousSelected.classList.add("seat-available");
      }

      // Add new selection
      this.classList.remove("seat-available");
      this.classList.add("seat-selected");

      // Update input field
      document.getElementById("seat-number").value =
        this.getAttribute("data-seat");
    });
  });
}
