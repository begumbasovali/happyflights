const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const Flight = require("../models/Flight");
const { v4: uuidv4 } = require("uuid");
const { authMiddleware } = require("../middleware/auth");
const { sendTicketConfirmation } = require("../utils/email");

// POST create a new ticket (book a flight)
router.post("/", async (req, res) => {
  try {
    console.log("🎫 New ticket booking request:", req.body);
    
    const {
      passenger_name,
      passenger_surname,
      passenger_email,
      flight_id,
      seat_number,
    } = req.body;

    // Check if flight exists and has available seats
    const flight = await Flight.findOne({ flight_id });
    console.log("✈️ Flight found:", flight ? `${flight.flight_id} (${flight.seats_available}/${flight.seats_total} seats)` : "NOT FOUND");

    if (!flight) {
      console.log("❌ Flight not found");
      return res.status(404).json({ message: "Flight not found" });
    }

    console.log(`📊 Current seats before booking: ${flight.seats_available}`);
    
    if (flight.seats_available <= 0) {
      console.log("❌ No available seats");
      return res
        .status(409)
        .json({ message: "No available seats for this flight" });
    }

    // Generate a unique ticket ID
    const ticket_id = uuidv4();
    console.log("🆔 Generated ticket ID:", ticket_id);

    // Create new ticket
    const newTicket = new Ticket({
      ticket_id,
      passenger_name,
      passenger_surname,
      passenger_email,
      flight_id,
      seat_number,
    });

    console.log("💾 Saving new ticket...");
    await newTicket.save();
    console.log("✅ Ticket saved successfully");

    // Update flight's available seats
    console.log(`🔄 Reducing available seats from ${flight.seats_available} to ${flight.seats_available - 1}`);
    flight.seats_available -= 1;
    
    console.log("💾 Saving updated flight...");
    await flight.save();
    console.log("✅ Flight updated successfully");
    
    // Verify the update
    const updatedFlight = await Flight.findOne({ flight_id });
    console.log(`✅ Verification - Updated flight seats: ${updatedFlight.seats_available}/${updatedFlight.seats_total}`);

    // Send ticket confirmation email
    try {
      const emailResult = await sendTicketConfirmation(newTicket, flight);
      console.log("📧 Email confirmation result:", emailResult);
    } catch (emailError) {
      console.error("📧 Error sending confirmation email:", emailError);
      // Don't fail the booking if email sending fails
    }

    console.log("🎉 Ticket booking completed successfully");
    res.status(201).json(newTicket);
  } catch (err) {
    console.error("❌ Error in ticket booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET tickets by email (with proper URL encoding)
router.get("/by-email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);

    // Find tickets by email
    const tickets = await Ticket.find({ passenger_email: decodedEmail }).sort({ created_at: -1 });

    // Get flight details for each ticket
    const ticketsWithFlightDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const flight = await Flight.findOne({ flight_id: ticket.flight_id });
        return {
          ...ticket.toObject(),
          flight: flight ? flight.toObject() : null,
          email: ticket.passenger_email,
          passenger_name: `${ticket.passenger_name} ${ticket.passenger_surname}`,
          price: flight ? flight.price : 0,
          status: ticket.status || 'confirmed'
        };
      })
    );

    res.json(ticketsWithFlightDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET tickets by email (legacy route - for backward compatibility)
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find tickets by email
    const tickets = await Ticket.find({ passenger_email: email });

    // Get flight details for each ticket
    const ticketsWithFlightDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const flight = await Flight.findOne({ flight_id: ticket.flight_id });
        return {
          ...ticket.toObject(),
          flight_details: flight ? flight : null,
        };
      })
    );

    res.json(ticketsWithFlightDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET a specific ticket
router.get("/ticket/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticket_id: req.params.id });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const flight = await Flight.findOne({ flight_id: ticket.flight_id });

    res.json({
      ...ticket.toObject(),
      flight_details: flight ? flight : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
