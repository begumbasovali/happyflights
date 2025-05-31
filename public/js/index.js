// index.js - For the home page with flight search

document.addEventListener("DOMContentLoaded", function () {
  // Load cities for dropdowns
  loadCities();

  // Load all available flights on page load
  loadAllAvailableFlights();

  // Set min date for date picker to today
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  // Set up flight search form
  const searchForm = document.getElementById("flight-search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", searchFlights);
  }
});

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
  const fromCitySelect = document.getElementById("from-city");
  const toCitySelect = document.getElementById("to-city");

  if (fromCitySelect && toCitySelect) {
    cities.forEach((city) => {
      const fromOption = document.createElement("option");
      fromOption.value = city.city_name;
      fromOption.textContent = city.city_name;

      const toOption = document.createElement("option");
      toOption.value = city.city_name;
      toOption.textContent = city.city_name;

      fromCitySelect.appendChild(fromOption);
      toCitySelect.appendChild(toOption);
    });
  }
}

// Load all available flights
function loadAllAvailableFlights() {
  fetch("/api/flights")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load flights");
      }
      return response.json();
    })
    .then((flights) => {
      // Filter only available flights (seats_available > 0)
      const availableFlights = flights.filter(flight => flight.seats_available > 0);
      displayFlightResults(availableFlights, "All Available Flights");
    })
    .catch((error) => {
      console.error("Error loading flights:", error);
      displayError("Failed to load flights. Please refresh the page.");
    });
}

// Search flights
function searchFlights(e) {
  e.preventDefault();

  const fromCity = document.getElementById("from-city").value;
  const toCity = document.getElementById("to-city").value;
  const date = document.getElementById("date").value;

  // Validate from and to are different
  if (fromCity === toCity) {
    alert("Departure and arrival cities cannot be the same");
    return;
  }

  // Build query string
  const queryParams = new URLSearchParams({
    from_city: fromCity,
    to_city: toCity,
    date: date,
  }).toString();

  // Fetch flights
  fetch(`/api/flights?${queryParams}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to search flights");
      }
      return response.json();
    })
    .then((flights) => {
      // Format date properly for search title (no time)
      const searchDate = new Date(date + 'T00:00:00').toLocaleDateString('tr-TR');
      const searchTitle = `Search Results: ${fromCity} → ${toCity} (${searchDate})`;
      displayFlightResults(flights, searchTitle);
    })
    .catch((error) => {
      console.error("Error searching flights:", error);
      displayError("Failed to search flights. Please try again.");
    });
}

// Display flight results
function displayFlightResults(flights, title = "Available Flights") {
  const resultsContainer = document.getElementById("flight-results");
  const noFlightsMessage = document.getElementById("no-flights-message");
  
  // Debug: Log the flights data
  console.log("Flight data received:", flights);
  if (flights.length > 0) {
    console.log("First flight structure:", flights[0]);
  }
  
  // Check if elements exist
  if (!resultsContainer) {
    console.error("Flight results container not found");
    return;
  }
  
  if (!noFlightsMessage) {
    console.error("No flights message element not found");
    return;
  }
  
  // Update the section title
  const sectionTitle = document.querySelector('.flight-results h2');
  if (sectionTitle) {
    sectionTitle.textContent = title;
  }

  // Clear previous results
  resultsContainer.innerHTML = "";

  if (flights.length === 0) {
    noFlightsMessage.classList.remove("d-none");
    if (title.includes("Search Results")) {
      noFlightsMessage.innerHTML = `
        <div class="alert alert-info">
          <i class="fas fa-info-circle"></i> No flights found for your search criteria.
          <button class="btn btn-link p-0 ms-2" onclick="loadAllAvailableFlights()">
            <i class="fas fa-arrow-left"></i> Show all available flights
          </button>
        </div>
      `;
    } else {
      // Reset to original message for general "no flights" case
      noFlightsMessage.innerHTML = `
        <div class="alert alert-info">
          <i class="fas fa-info-circle"></i> No flights found for your search criteria. Please try different dates or cities.
        </div>
      `;
    }
    return;
  }

  noFlightsMessage.classList.add("d-none");

  // Add clear search button if this is a search result
  if (title.includes("Search Results")) {
    const clearSearchBtn = document.createElement("div");
    clearSearchBtn.className = "col-12 mb-3";
    clearSearchBtn.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <span class="text-muted">${flights.length} flight(s) found</span>
        <button class="btn btn-outline-secondary btn-sm" onclick="clearSearch()">
          <i class="fas fa-times"></i> Clear Search
        </button>
      </div>
    `;
    resultsContainer.appendChild(clearSearchBtn);
  } else {
    // Show total available flights for all flights view
    const flightCounter = document.createElement("div");
    flightCounter.className = "col-12 mb-3";
    flightCounter.innerHTML = `
      <div class="text-center">
        <span class="badge bg-primary fs-6">${flights.length} available flight(s)</span>
      </div>
    `;
    resultsContainer.appendChild(flightCounter);
  }

  flights.forEach((flight, index) => {
    console.log(`Flight ${index}:`, {
      flight_id: flight.flight_id,
      from_city: flight.from_city,
      to_city: flight.to_city,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time
    });

    const departureDate = new Date(flight.departure_time);
    const arrivalDate = new Date(flight.arrival_time);

    // Ensure from_city and to_city exist, provide fallbacks
    const fromCity = flight.from_city || flight.from || 'Unknown';
    const toCity = flight.to_city || flight.to || 'Unknown';

    const flightCard = document.createElement("div");
    flightCard.className = "col-md-6 col-lg-4";
    flightCard.innerHTML = `
      <div class="card flight-card mb-4 shadow-sm">
        <div class="card-header" style="background: linear-gradient(135deg, rgba(0, 86, 179, 0.95), rgba(0, 61, 130, 1)); backdrop-filter: blur(15px); border: none; border-radius: 16px 16px 0 0;">
          <div class="d-flex justify-content-between align-items-center text-white">
            <h5 class="mb-0 fw-bold">${flight.flight_id}</h5>
            <span class="badge" style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(250, 250, 250, 0.95)); color: #333; backdrop-filter: blur(8px); border: none;">${
              flight.seats_available
            } seats left</span>
          </div>
        </div>
        <div class="card-body" style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(252, 252, 252, 0.9)); backdrop-filter: blur(15px); border: none;">
          <div class="flight-route">
            <div class="flight-route-point text-center">
              <div class="flight-time fw-bold text-primary">${departureDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}</div>
              <div class="flight-city fw-semibold">${fromCity}</div>
            </div>
            <div class="flight-route-point text-center">
              <div class="flight-time fw-bold text-success">${arrivalDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}</div>
              <div class="flight-city fw-semibold">${toCity}</div>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div>
              <p class="mb-1 text-muted"><i class="fas fa-calendar text-warning"></i> ${departureDate.toLocaleDateString()}</p>
              <p class="mb-0 text-muted"><i class="fas fa-clock text-info"></i> ${getFlightDuration(
                flight.departure_time,
                flight.arrival_time
              )}</p>
            </div>
            <div class="text-end">
              <div class="flight-price fs-4 fw-bold text-primary">${formatPrice(flight.price)}</div>
            </div>
          </div>
        </div>
        <div class="card-footer" style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(250, 250, 250, 0.85)); backdrop-filter: blur(10px); border: none; border-radius: 0 0 16px 16px;">
          <a href="/flight/${
            flight.flight_id
          }" class="btn btn-primary w-100 fw-semibold">
            <i class="fas fa-plane"></i> Select Flight
          </a>
        </div>
      </div>
    `;

    resultsContainer.appendChild(flightCard);
  });
}

// Clear search and show all flights
function clearSearch() {
  // Reset form
  document.getElementById("flight-search-form").reset();
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
  
  // Load all available flights
  loadAllAvailableFlights();
}

// Display error message
function displayError(message) {
  const resultsContainer = document.getElementById("flight-results");
  resultsContainer.innerHTML = `
    <div class="col-12">
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle"></i> ${message}
      </div>
    </div>
  `;
}

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR");
}

function formatPrice(price) {
  return `₺${parseFloat(price).toFixed(2)}`;
}

function getFlightDuration(departureTime, arrivalTime) {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  const diffMs = arrival - departure;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m`;
  } else {
    return `${diffMins}m`;
  }
}
