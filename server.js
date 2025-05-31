const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/happyflights";
    console.log(`Connecting to MongoDB: ${uri}`);
    
    // MongoDB driver 4.0.0+ artık bu opsiyonları otomatik kullanıyor
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("Full error:", error);
    // Exit process with failure for critical errors
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// Import routes
const flightRoutes = require("./routes/flights");
const ticketRoutes = require("./routes/tickets");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");
const cityRoutes = require("./routes/cities");
const pageRoutes = require("./routes/pages");

// Use routes
app.use("/api/flights", flightRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cities", cityRoutes);
app.use("/", pageRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
