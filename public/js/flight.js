// flight.js - For the flight details and booking page

document.addEventListener("DOMContentLoaded", function () {
  // Get the flight ID from the hidden input
  const flightId = document.getElementById("flight-id").value;

  // Load flight details
  loadFlightDetails(flightId);

  // Set up booking form
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", bookFlight);
  }
});

// Load flight details from API
function loadFlightDetails(flightId) {
  fetch(`/api/flights/${flightId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Flight not found");
      }
      return response.json();
    })
    .then((flight) => {
      displayFlightDetails(flight);
      populateSeatOptions(flight);
    })
    .catch((error) => {
      console.error("Error loading flight details:", error);
      document.getElementById("flight-details-container").innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> Flight not found or an error occurred.
        </div>
      `;
    });
}

// Display flight details
function displayFlightDetails(flight) {
  const departureDate = new Date(flight.departure_time);
  const arrivalDate = new Date(flight.arrival_time);

  const detailsContainer = document.getElementById("flight-details-container");

  detailsContainer.innerHTML = `
    <div class="mb-4">
      <h4 class="mb-3">Flight ${flight.flight_id}</h4>
      <div class="row">
        <div class="col-md-6">
          <p><strong>Date:</strong> ${departureDate.toLocaleDateString()}</p>
        </div>
        <div class="col-md-6 text-md-end">
          <p><strong>Available Seats:</strong> ${flight.seats_available}/${
    flight.seats_total
  }</p>
        </div>
      </div>
    </div>
    
    <div class="flight-route mb-4">
      <div class="flight-route-point text-center">
        <div class="flight-time">${departureDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</div>
        <div class="flight-city">${flight.from_city}</div>
      </div>
      <div class="flight-route-point text-center">
        <div class="flight-time">${arrivalDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</div>
        <div class="flight-city">${flight.to_city}</div>
      </div>
    </div>
    
    <div class="row mb-4">
      <div class="col-md-6">
        <p><strong>Duration:</strong> ${getFlightDuration(
          flight.departure_time,
          flight.arrival_time
        )}</p>
      </div>
      <div class="col-md-6 text-md-end">
        <p class="flight-price"><strong>Price:</strong> ${formatPrice(
          flight.price
        )}</p>
      </div>
    </div>
    
    <div class="alert alert-info">
      <i class="fas fa-info-circle"></i> Please fill out the booking form to secure your seat on this flight.
    </div>
  `;
}

// Populate seat options - this is now handled by seat-selector.js
function populateSeatOptions(flight) {
  if (flight.seats_available <= 0) {
    document.getElementById("booking-form").innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle"></i> Sorry, this flight is fully booked.
      </div>
    `;
  }
  // Seat selection logic is now in seat-selector.js
}

// Book the flight
function bookFlight(e) {
  e.preventDefault();
  
  console.log("📝 Book flight form submitted");

  const flightId = document.getElementById("flight-id").value;
  const passengerName = document.getElementById("passenger-name").value;
  const passengerSurname = document.getElementById("passenger-surname").value;
  const passengerEmail = document.getElementById("passenger-email").value;
  
  // Check if seat-number input exists, if not, use null
  const seatNumberInput = document.getElementById("seat-number");
  const seatNumber = seatNumberInput ? seatNumberInput.value : null;
  
  console.log("📝 Form data:", {
    flightId, 
    passengerName, 
    passengerSurname, 
    passengerEmail, 
    seatNumber
  });

  // Basic validation
  if (!passengerName || !passengerSurname || !passengerEmail) {
    alert("Please fill in all required fields");
    return;
  }

  const bookingData = {
    flight_id: flightId,
    passenger_name: passengerName,
    passenger_surname: passengerSurname,
    passenger_email: passengerEmail,
    seat_number: seatNumber || null,
  };

  console.log("📝 Booking data prepared:", bookingData);

  // Check if flight has available seats
  fetch(`/api/flights/${flightId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Flight not found");
      }
      return response.json();
    })
    .then((flight) => {
      console.log("✈️ Flight availability check:", flight.seats_available);
      
      if (flight.seats_available <= 0) {
        throw new Error("No available seats for this flight");
      }

      // Save booking data to session storage for payment page
      sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
      console.log("💾 Booking data saved to sessionStorage");

      // Redirect to payment page
      console.log("🔄 Redirecting to payment page...");
      window.location.href = "/payment";
    })
    .catch((error) => {
      console.error("❌ Error checking flight availability:", error);

      // Add error alert
      const formElement = document.getElementById("booking-form");
      const alertDiv = document.createElement("div");
      alertDiv.className = "alert alert-danger mt-3";
      alertDiv.role = "alert";
      alertDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${
        error.message || "Error processing your request. Please try again."
      }`;

      // Remove any existing alerts
      const existingAlert = formElement.querySelector(".alert");
      if (existingAlert) {
        existingAlert.remove();
      }

      formElement.appendChild(alertDiv);
    });
}
