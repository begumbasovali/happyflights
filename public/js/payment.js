// payment.js - For the payment simulation screen

document.addEventListener("DOMContentLoaded", function () {
  // Get booking information from session storage
  const bookingData = JSON.parse(sessionStorage.getItem("bookingData"));

  if (!bookingData) {
    // No booking data found, redirect to home
    window.location.href = "/";
    return;
  }

  // Set hidden fields
  document.getElementById("flight-id").value = bookingData.flight_id;
  document.getElementById("passenger-name").value = bookingData.passenger_name;
  document.getElementById("passenger-surname").value =
    bookingData.passenger_surname;
  document.getElementById("passenger-email").value =
    bookingData.passenger_email;

  if (bookingData.seat_number) {
    document.getElementById("seat-number").value = bookingData.seat_number;
  }

  // Load flight details for summary
  loadFlightDetails(bookingData.flight_id);

  // Format card number input with spaces
  const cardNumberInput = document.getElementById("card-number");
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", function () {
      let cardNumber = this.value.replace(/\s/g, "");
      let formattedNumber = "";

      for (let i = 0; i < cardNumber.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedNumber += " ";
        }
        formattedNumber += cardNumber[i];
      }

      this.value = formattedNumber;
    });
  }

  // Format expiry date input with slash
  const expiryInput = document.getElementById("expiry-date");
  if (expiryInput) {
    expiryInput.addEventListener("input", function () {
      let expiry = this.value.replace(/\//g, "");

      if (expiry.length > 2) {
        this.value = expiry.slice(0, 2) + "/" + expiry.slice(2);
      }
    });
  }

  // Set up payment form
  const paymentForm = document.getElementById("payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", processPayment);
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
      displayFlightSummary(flight);
    })
    .catch((error) => {
      console.error("Error loading flight details:", error);
      document.getElementById("flight-summary").innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> Error loading flight details.
        </div>
      `;
    });
}

// Display flight summary for payment
function displayFlightSummary(flight) {
  const summaryContainer = document.getElementById("flight-summary");
  const paymentAmount = document.getElementById("payment-amount");

  if (!summaryContainer) return;

  // Get passenger details
  const bookingData = JSON.parse(sessionStorage.getItem("bookingData"));

  const departureDate = new Date(flight.departure_time);
  const arrivalDate = new Date(flight.arrival_time);

  summaryContainer.innerHTML = `
    <h5 class="mb-3">Flight Summary</h5>
    <div class="card bg-light mb-3">
      <div class="card-body">
        <h6 class="card-title">Flight ${flight.flight_id}</h6>
        <div class="row">
          <div class="col-md-6">
            <p class="mb-1"><strong>From:</strong> ${flight.from_city}</p>
            <p class="mb-1"><strong>To:</strong> ${flight.to_city}</p>
            <p class="mb-1"><strong>Date:</strong> ${departureDate.toLocaleDateString()}</p>
            <p class="mb-1"><strong>Time:</strong> ${departureDate.toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" }
            )}</p>
          </div>
          <div class="col-md-6">
            <p class="mb-1"><strong>Passenger:</strong> ${
              bookingData.passenger_name
            } ${bookingData.passenger_surname}</p>
            <p class="mb-1"><strong>Seat:</strong> ${
              bookingData.seat_number || "Automatic assignment"
            }</p>
          </div>
        </div>
        <div class="text-end mt-2">
          <h5 class="mb-0 flight-price">${formatPrice(flight.price)}</h5>
        </div>
      </div>
    </div>
  `;

  // Set payment amount
  if (paymentAmount) {
    paymentAmount.textContent = `(${formatPrice(flight.price)})`;
  }
}

// Format price for display
function formatPrice(price) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
}

// Process payment (simulated)
function processPayment(e) {
  e.preventDefault();

  const paymentStatus = document.getElementById("payment-status");
  paymentStatus.innerHTML = `
    <div class="alert alert-info">
      <div class="d-flex align-items-center">
        <div class="spinner-border spinner-border-sm me-2" role="status">
          <span class="visually-hidden">Processing...</span>
        </div>
        Processing your payment...
      </div>
    </div>
  `;

  // Disable form elements during "processing"
  const formElements = document.querySelectorAll(
    "#payment-form input, #payment-form button"
  );
  formElements.forEach((el) => (el.disabled = true));

  // Simulate payment processing (3 seconds)
  setTimeout(() => {
    // Get booking data
    const bookingData = JSON.parse(sessionStorage.getItem("bookingData"));

    // Create ticket in the backend
    fetch("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 409) {
            return response.json().then((data) => {
              throw new Error(
                data.message || "No available seats for this flight"
              );
            });
          }
          throw new Error("Failed to book flight");
        }
        return response.json();
      })
      .then((ticket) => {
        // Show success message
        paymentStatus.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-check-circle"></i> Payment successful! Redirecting to your ticket...
        </div>
      `;

        // Clear booking data from session storage
        sessionStorage.removeItem("bookingData");

        // Redirect to confirmation page
        setTimeout(() => {
          window.location.href = `/confirmation/${ticket.ticket_id}`;
        }, 2000);
      })
      .catch((error) => {
        console.error("Error booking flight:", error);

        // Show error message
        paymentStatus.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> ${
            error.message || "Payment failed. Please try again."
          }
        </div>
      `;

        // Re-enable form elements
        formElements.forEach((el) => (el.disabled = false));
      });
  }, 3000);
}
