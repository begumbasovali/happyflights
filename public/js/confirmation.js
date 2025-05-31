// confirmation.js - For the ticket confirmation page

document.addEventListener("DOMContentLoaded", function () {
  // Get the ticket ID from the URL
  const pathParts = window.location.pathname.split("/");
  const ticketId = pathParts[pathParts.length - 1];

  // Load ticket details
  loadTicketDetails(ticketId);

  // Set up print ticket button
  const printButton = document.getElementById("print-ticket");
  if (printButton) {
    printButton.addEventListener("click", printTicket);
  }
});

// Load ticket details from API
function loadTicketDetails(ticketId) {
  fetch(`/api/tickets/ticket/${ticketId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ticket not found");
      }
      return response.json();
    })
    .then((ticket) => {
      displayTicketDetails(ticket);
    })
    .catch((error) => {
      console.error("Error loading ticket details:", error);
      document.getElementById("confirmation-details").innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> Ticket not found or an error occurred.
        </div>
      `;
    });
}

// Display ticket details
function displayTicketDetails(ticket) {
  const confirmationContainer = document.getElementById("confirmation-details");

  const flight = ticket.flight_details;
  if (!flight) {
    confirmationContainer.innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle"></i> Flight details not available for this ticket.
      </div>
    `;
    return;
  }

  const departureDate = new Date(flight.departure_time);
  const arrivalDate = new Date(flight.arrival_time);

  confirmationContainer.innerHTML = `
    <div class="text-center mb-4">
      <i class="fas fa-check-circle confirmation-success-icon"></i>
      <h3 class="mt-3">Booking Confirmed!</h3>
      <p class="lead">Your flight has been booked successfully. Here are the details of your trip:</p>
    </div>
    
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Ticket Information</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
            <p><strong>Passenger:</strong> ${ticket.passenger_name} ${
    ticket.passenger_surname
  }</p>
            <p><strong>Email:</strong> ${ticket.passenger_email}</p>
          </div>
          <div class="col-md-6">
            <p><strong>Flight:</strong> ${flight.flight_id}</p>
            <p><strong>Seat:</strong> ${
              ticket.seat_number || "Not assigned"
            }</p>
            <p><strong>Booking Date:</strong> ${new Date(
              ticket.created_at
            ).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Flight Information</h5>
      </div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-12">
            <div class="flight-route">
              <div class="flight-route-point text-center">
                <div class="flight-time">${departureDate.toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )}</div>
                <div class="flight-city">${flight.from_city}</div>
                <div class="flight-date">${departureDate.toLocaleDateString()}</div>
              </div>
              <div class="flight-route-point text-center">
                <div class="flight-time">${arrivalDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</div>
                <div class="flight-city">${flight.to_city}</div>
                <div class="flight-date">${arrivalDate.toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
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
      </div>
    </div>
    
    <div class="alert alert-info mt-4">
      <i class="fas fa-info-circle"></i> Please arrive at the airport at least 2 hours before your flight. Don't forget to bring your ID/passport.
    </div>
  `;
}

// Print ticket function
function printTicket() {
  window.print();
}
