const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  ticket_id: {
    type: String,
    required: true,
    unique: true,
  },
  passenger_name: {
    type: String,
    required: true,
  },
  passenger_surname: {
    type: String,
    required: true,
  },
  passenger_email: {
    type: String,
    required: true,
  },
  flight_id: {
    type: String,
    required: true,
  },
  // Store flight details with the ticket for cancelled flights
  flight_from: {
    type: String,
    // optional - will be populated from flight data
  },
  flight_to: {
    type: String,
    // optional - will be populated from flight data
  },
  flight_departure_time: {
    type: Date,
    // optional - will be populated from flight data
  },
  flight_arrival_time: {
    type: Date,
    // optional - will be populated from flight data
  },
  flight_price: {
    type: Number,
    // optional - will be populated from flight data
  },
  seat_number: {
    type: String,
    // optional
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  cancellation_reason: {
    type: String,
    // optional - reason for cancellation
  },
  cancelled_at: {
    type: Date,
    // optional - when ticket was cancelled
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ticket", TicketSchema);
