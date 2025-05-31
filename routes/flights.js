const express = require("express");
const router = express.Router();
const Flight = require("../models/Flight");
const { adminAuth } = require("../middleware/auth");

// GET all flights
router.get("/", async (req, res) => {
  try {
    let query = {};

    // Always filter out past flights (only show future flights)
    const now = new Date();
    query.departure_time = { $gte: now };

    // Filter by from_city, to_city, and date if provided
    if (req.query.from_city) query.from_city = req.query.from_city;
    if (req.query.to_city) query.to_city = req.query.to_city;
    if (req.query.date) {
      const searchDate = new Date(req.query.date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Update the departure_time filter to combine with the future flights filter
      query.departure_time = {
        $gte: searchDate > now ? searchDate : now,
        $lt: nextDay,
      };
    }

    const flights = await Flight.find(query);
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all flights including past ones (admin only)
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    let query = {};

    // Filter by from_city, to_city, and date if provided (no time restriction for admin)
    if (req.query.from_city) query.from_city = req.query.from_city;
    if (req.query.to_city) query.to_city = req.query.to_city;
    if (req.query.date) {
      const searchDate = new Date(req.query.date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.departure_time = {
        $gte: searchDate,
        $lt: nextDay,
      };
    }

    const flights = await Flight.find(query).sort({ departure_time: -1 }); // Sort by newest first
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET a specific flight
router.get("/:id", async (req, res) => {
  try {
    const flight = await Flight.findOne({ flight_id: req.params.id });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json(flight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new flight (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const {
      flight_id,
      from_city,
      to_city,
      departure_time,
      arrival_time,
      price,
      seats_total,
    } = req.body;

    // Check if flight_id already exists
    const existingFlight = await Flight.findOne({ flight_id });
    if (existingFlight) {
      return res.status(409).json({ message: "Flight ID already exists" });
    }

    // Validate departure and arrival times
    const depTime = new Date(departure_time);
    const arrTime = new Date(arrival_time);

    if (depTime >= arrTime) {
      return res
        .status(409)
        .json({ message: "Arrival time must be after departure time" });
    }

    // Rule 2: Check for exact departure time conflicts from same city
    // No two flights from the same city can depart at the exact same time
    const departureConflicts = await Flight.find({
      flight_id: { $ne: flight_id },
      from_city,
      departure_time: depTime,
    });

    if (departureConflicts.length > 0) {
      const conflictTime = depTime.toLocaleString('tr-TR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
      return res
        .status(409)
        .json({
          message: `Another flight already departs from ${from_city} at ${conflictTime}. Please choose a different departure time.`,
        });
    }

    // Rule 3: Check for exact arrival time conflicts to same city  
    // No two flights can arrive at the same city at the exact same time
    const arrivalConflicts = await Flight.find({
      flight_id: { $ne: flight_id },
      to_city,
      arrival_time: arrTime,
    });

    if (arrivalConflicts.length > 0) {
      const conflictTime = arrTime.toLocaleString('tr-TR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
      return res
        .status(409)
        .json({
          message: `Another flight already arrives at ${to_city} at ${conflictTime}. Please choose a different arrival time.`,
        });
    }

    const newFlight = new Flight({
      flight_id,
      from_city,
      to_city,
      departure_time,
      arrival_time,
      price,
      seats_total,
      seats_available: seats_total,
    });

    await newFlight.save();

    res.status(201).json(newFlight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a flight (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const {
      from_city,
      to_city,
      departure_time,
      arrival_time,
      price,
      seats_total,
    } = req.body;

    // Find the flight
    const flight = await Flight.findOne({ flight_id: req.params.id });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // Calculate new seats_available
    let newSeatsAvailable = seats_total;
    if (seats_total !== flight.seats_total) {
      const seatsDifference = seats_total - flight.seats_total;
      newSeatsAvailable = flight.seats_available + seatsDifference;

      if (newSeatsAvailable < 0) {
        return res.status(409).json({
          message: "Cannot reduce total seats below the number of booked seats",
        });
      }
    }

    // Validate departure and arrival times
    const depTime = new Date(departure_time);
    const arrTime = new Date(arrival_time);

    if (depTime >= arrTime) {
      return res
        .status(409)
        .json({ message: "Arrival time must be after departure time" });
    }

    // Rule 2: Check for exact departure time conflicts from same city
    // No two flights from the same city can depart at the exact same time
    const departureConflicts = await Flight.find({
      flight_id: { $ne: req.params.id },
      from_city,
      departure_time: depTime,
    });

    if (departureConflicts.length > 0) {
      const conflictTime = depTime.toLocaleString('tr-TR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
      return res
        .status(409)
        .json({
          message: `Another flight already departs from ${from_city} at ${conflictTime}. Please choose a different departure time.`,
        });
    }

    // Rule 3: Check for exact arrival time conflicts to same city  
    // No two flights can arrive at the same city at the exact same time
    const arrivalConflicts = await Flight.find({
      flight_id: { $ne: req.params.id },
      to_city,
      arrival_time: arrTime,
    });

    if (arrivalConflicts.length > 0) {
      const conflictTime = arrTime.toLocaleString('tr-TR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
      return res
        .status(409)
        .json({
          message: `Another flight already arrives at ${to_city} at ${conflictTime}. Please choose a different arrival time.`,
        });
    }

    // Update flight
    flight.from_city = from_city;
    flight.to_city = to_city;
    flight.departure_time = departure_time;
    flight.arrival_time = arrival_time;
    flight.price = price;
    flight.seats_total = seats_total;
    flight.seats_available = newSeatsAvailable;

    await flight.save();

    res.json(flight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a flight (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const flight = await Flight.findOne({ flight_id: req.params.id });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // Check if this is a past flight
    const now = new Date();
    const departureTime = new Date(flight.departure_time);
    
    if (departureTime < now) {
      return res.status(409).json({ 
        message: "Cannot cancel past flights. This flight has already departed or was scheduled in the past.",
        flightDeparture: departureTime.toLocaleString('tr-TR'),
        currentTime: now.toLocaleString('tr-TR')
      });
    }

    const bookedSeats = flight.seats_total - flight.seats_available;

    // If flight has bookings, require force parameter for cancellation
    if (bookedSeats > 0) {
      const forceCancel = req.query.force === 'true';
      
      if (!forceCancel) {
        return res.status(409).json({ 
          message: `This flight has ${bookedSeats} booked seats. To cancel this flight and notify passengers, add ?force=true to the request.`,
          bookedSeats: bookedSeats,
          requiresForce: true
        });
      }

      // Cancel all tickets for this flight
      const Ticket = require("../models/Ticket");
      const cancelResult = await Ticket.updateMany(
        { flight_id: req.params.id, status: 'confirmed' },
        { 
          status: 'cancelled',
          cancellation_reason: 'Flight cancelled by airline',
          cancelled_at: new Date()
        }
      );

      console.log(`⚠️  FLIGHT CANCELLATION: ${flight.flight_id} cancelled with ${bookedSeats} affected passengers`);
      console.log(`📋 Updated ${cancelResult.modifiedCount} tickets to cancelled status`);
      
      // Delete the flight
      await Flight.deleteOne({ flight_id: req.params.id });
      
      return res.json({ 
        message: "Flight cancelled successfully", 
        affectedPassengers: bookedSeats,
        cancelledTickets: cancelResult.modifiedCount,
        warning: "All passenger tickets have been marked as cancelled"
      });
    }

    // No bookings - safe to delete
    await Flight.deleteOne({ flight_id: req.params.id });
    res.json({ message: "Flight deleted successfully" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
