const express = require("express");
const router = express.Router();
const db = require("../db/database");
const authMiddleware = require("../middleware/authMiddleware");


// CREATE LOCATION
router.post("/", authMiddleware, (req, res) => {

  const { location_name } = req.body;

  if (!location_name) {
    return res.status(400).json({
      error: "Location name is required"
    });
  }

  db.run(
    `INSERT INTO locations (location_name) VALUES (?)`,
    [location_name],
    function (err) {

      if (err) {

        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({
            error: "Location already exists"
          });
        }

        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "Location created successfully",
        location_id: this.lastID
      });

    }
  );

});


// GET ALL LOCATIONS
router.get("/", (req, res) => {

  db.all(
    `SELECT * FROM locations ORDER BY location_name ASC`,
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);

    }
  );

});

module.exports = router;