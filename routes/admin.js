const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Ticket = require("../models/Ticket");
const Flight = require("../models/Flight");
const bcrypt = require("bcrypt");
const { adminAuth } = require("../middleware/auth");

// POST admin login
router.post("/login", async (req, res) => {
  try {
    console.log("Admin login request received:", req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if admin exists
    console.log("Looking for admin with username:", username);
    const admin = await Admin.findOne({ username });

    if (!admin) {
      console.log("Admin not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Admin found, checking password...");
    // Check password
    const isMatch = await admin.comparePassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Login successful, creating token...");
    // Create JWT token
    const payload = {
      id: admin.id,
      username: admin.username,
      isAdmin: true,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1d" },
      (err, token) => {
        if (err) {
          console.error("JWT sign error:", err);
          throw err;
        }
        console.log("Token created successfully");
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET admin profile
router.get("/me", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all ticket bookings (admin only)
router.get("/tickets", adminAuth, async (req, res) => {
  try {
    console.log("Admin requesting all ticket bookings");
    
    // Get all tickets with flight details
    const tickets = await Ticket.find({}).sort({ created_at: -1 });
    
    // Populate flight details for each ticket
    const ticketsWithFlightDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const flight = await Flight.findOne({ flight_id: ticket.flight_id });
        return {
          _id: ticket._id,
          ticket_id: ticket.ticket_id,
          passenger_name: ticket.passenger_name,
          passenger_surname: ticket.passenger_surname,
          passenger_email: ticket.passenger_email,
          flight_id: ticket.flight_id,
          seat_number: ticket.seat_number,
          created_at: ticket.created_at,
          flight_details: flight ? {
            from_city: flight.from_city,
            to_city: flight.to_city,
            departure_time: flight.departure_time,
            arrival_time: flight.arrival_time,
            price: flight.price
          } : null
        };
      })
    );
    
    console.log(`Found ${ticketsWithFlightDetails.length} ticket bookings`);
    res.json(ticketsWithFlightDetails);
  } catch (err) {
    console.error("Error fetching ticket bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
