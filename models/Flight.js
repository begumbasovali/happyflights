const mongoose = require("mongoose");

const FlightSchema = new mongoose.Schema({
  flight_id: {
    type: String,
    required: true,
    unique: true,
  },
  from_city: {
    type: String,
    required: true,
  },
  to_city: {
    type: String,
    required: true,
  },
  departure_time: {
    type: Date,
    required: true,
  },
  arrival_time: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  seats_total: {
    type: Number,
    required: true,
  },
  seats_available: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Flight", FlightSchema);
