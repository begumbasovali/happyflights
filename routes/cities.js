const express = require("express");
const router = express.Router();
const City = require("../models/City");
const { adminAuth } = require("../middleware/auth");

// GET all cities
router.get("/", async (req, res) => {
  try {
    const cities = await City.find().sort({ city_name: 1 });
    res.json(cities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new city (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const { city_id, city_name } = req.body;

    // Check if city already exists
    const existingCity = await City.findOne({
      $or: [{ city_id }, { city_name }],
    });

    if (existingCity) {
      return res.status(409).json({ message: "City already exists" });
    }

    const newCity = new City({
      city_id,
      city_name,
    });

    await newCity.save();

    res.status(201).json(newCity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
