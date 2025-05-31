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
        
        // Prepare flight details - use stored ticket data if flight doesn't exist
        let flightDetails = null;
        if (flight) {
          flightDetails = {
            from_city: flight.from_city || flight.from,
            to_city: flight.to_city || flight.to,
            departure_time: flight.departure_time,
            arrival_time: flight.arrival_time,
            price: flight.price
          };
        } else if (ticket.flight_from && ticket.flight_to) {
          // Use flight details stored in ticket
          flightDetails = {
            from_city: ticket.flight_from,
            to_city: ticket.flight_to,
            departure_time: ticket.flight_departure_time,
            arrival_time: ticket.flight_arrival_time,
            price: ticket.flight_price
          };
        }
        
        return {
          _id: ticket._id,
          ticket_id: ticket.ticket_id,
          passenger_name: ticket.passenger_name,
          passenger_surname: ticket.passenger_surname,
          passenger_email: ticket.passenger_email,
          flight_id: ticket.flight_id,
          seat_number: ticket.seat_number,
          status: ticket.status || 'confirmed',
          cancellation_reason: ticket.cancellation_reason,
          cancelled_at: ticket.cancelled_at,
          created_at: ticket.created_at,
          // Include ticket stored flight details for fallback
          flight_from: ticket.flight_from,
          flight_to: ticket.flight_to,
          flight_departure_time: ticket.flight_departure_time,
          flight_arrival_time: ticket.flight_arrival_time,
          flight_price: ticket.flight_price,
          flight_details: flightDetails
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

// POST update existing tickets with flight details (admin only)
router.post("/update-tickets", adminAuth, async (req, res) => {
  try {
    console.log("🔧 Admin requesting ticket update migration");
    console.log("🔧 User info:", req.user);
    
    // Find all tickets that don't have flight details stored
    const tickets = await Ticket.find({
      $or: [
        { flight_from: { $exists: false } },
        { flight_from: null },
        { flight_from: '' }
      ]
    });
    
    console.log(`📋 Found ${tickets.length} tickets to update`);
    
    if (tickets.length === 0) {
      return res.json({
        success: true,
        message: "No tickets need updating",
        updated: 0,
        failed: 0,
        results: []
      });
    }
    
    let updatedCount = 0;
    let failedCount = 0;
    const results = [];
    
    for (let ticket of tickets) {
      console.log(`🎫 Processing ticket: ${ticket.ticket_id} (Flight: ${ticket.flight_id})`);
      
      try {
        // Try to find the corresponding flight
        const flight = await Flight.findOne({ flight_id: ticket.flight_id });
        
        if (flight) {
          console.log(`✈️ Found flight details for ${ticket.flight_id}:`, {
            from: flight.from || flight.from_city,
            to: flight.to || flight.to_city,
            price: flight.price
          });
          
          // Update ticket with flight details
          const updateResult = await Ticket.updateOne(
            { _id: ticket._id },
            {
              $set: {
                flight_from: flight.from || flight.from_city || 'Unknown',
                flight_to: flight.to || flight.to_city || 'Unknown', 
                flight_departure_time: flight.departure_time,
                flight_arrival_time: flight.arrival_time,
                flight_price: flight.price
              }
            }
          );
          
          console.log(`💾 Update result for ${ticket.ticket_id}:`, updateResult);
          
          if (updateResult.modifiedCount > 0) {
            console.log(`✅ Successfully updated ticket ${ticket.ticket_id}`);
            updatedCount++;
            results.push({
              ticket_id: ticket.ticket_id,
              flight_id: ticket.flight_id,
              status: 'updated',
              from: flight.from || flight.from_city,
              to: flight.to || flight.to_city
            });
          } else {
            console.log(`⚠️ No changes made to ticket ${ticket.ticket_id}`);
            results.push({
              ticket_id: ticket.ticket_id,
              flight_id: ticket.flight_id,
              status: 'no_changes'
            });
          }
        } else {
          console.log(`❌ Flight ${ticket.flight_id} not found for ticket ${ticket.ticket_id}`);
          failedCount++;
          results.push({
            ticket_id: ticket.ticket_id,
            flight_id: ticket.flight_id,
            status: 'flight_not_found'
          });
        }
      } catch (ticketError) {
        console.error(`❌ Error processing ticket ${ticket.ticket_id}:`, ticketError);
        failedCount++;
        results.push({
          ticket_id: ticket.ticket_id,
          flight_id: ticket.flight_id,
          status: 'error',
          error: ticketError.message
        });
      }
    }
    
    console.log(`🎉 Migration completed - Updated: ${updatedCount}, Failed: ${failedCount}`);
    
    res.json({
      success: true,
      message: `Migration completed successfully`,
      updated: updatedCount,
      failed: failedCount,
      total: tickets.length,
      results: results
    });
    
  } catch (err) {
    console.error("❌ Error in migration endpoint:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ 
      success: false,
      message: "Server error during migration",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;
