const express = require("express");
const router = express.Router();
const db = require("../db/database");

// INVENTORY OVERVIEW
router.get("/", (req, res) => {

  const query = `
  SELECT
    p.product_name,
    l.location_name,
    pl.quantity
  FROM product_locations pl
  JOIN products p ON pl.product_id = p.id
  JOIN locations l ON pl.location_id = l.id
  ORDER BY p.product_name
  `;

  db.all(query, [], (err, rows) => {

    if (err) return res.status(500).json({ error: err.message });

    res.json(rows);

  });

});

module.exports = router;