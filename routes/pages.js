const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");

// Home page
router.get("/", (req, res) => {
  res.render("index");
});

// Flight details page
router.get("/flight/:id", (req, res) => {
  res.render("flight", { flightId: req.params.id });
});

// Reservation confirmation page
router.get("/confirmation/:id", (req, res) => {
  res.render("confirmation", { ticketId: req.params.id });
});

// Admin login page
router.get("/admin/login", (req, res) => {
  res.render("admin-login");
});

// Admin panel page
router.get("/admin/panel", (req, res) => {
  res.render("admin-panel");
});

// My Tickets page
router.get("/my-tickets", (req, res) => {
  res.render("my-tickets");
});

// User login page (includes registration)
router.get("/login", (req, res) => {
  res.render("login");
});

// Register redirect (since registration is integrated in login page)
router.get("/register", (req, res) => {
  res.redirect("/login");
});

// Payment page
router.get("/payment", (req, res) => {
  res.render("payment");
});

module.exports = router;
