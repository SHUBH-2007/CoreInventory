const express = require("express");
const router = express.Router();
const db = require("../db/database");
const authMiddleware = require("../middleware/authMiddleware");


// CREATE PRODUCT
router.post("/", authMiddleware, (req, res) => {

  const { product_name, sku, category, unit_of_measure } = req.body;

  if (!product_name || !unit_of_measure) {
    return res.status(400).json({
      error: "product_name and unit_of_measure are required"
    });
  }

  const query = `
  INSERT INTO products
  (product_name, sku, category, unit_of_measure)
  VALUES (?, ?, ?, ?)
  `;

  db.run(query, [product_name, sku, category, unit_of_measure], function (err) {

    if (err) {

      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({
          error: "SKU already exists"
        });
      }

      return res.status(500).json({ error: err.message });
    }

    const productId = this.lastID;

    // Initialize stock at default location (id = 1)
    db.run(
      `INSERT INTO product_locations (product_id, location_id, quantity)
       VALUES (?, 1, 0)`,
      [productId],
      (err) => {

        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: "Product created successfully",
          product_id: productId
        });

      }
    );

  });

});


// GET ALL PRODUCTS
router.get("/", (req, res) => {

  const query = `
  SELECT *
  FROM products
  ORDER BY created_at DESC
  `;

  db.all(query, [], (err, rows) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);

  });

});


// GET PRODUCT STOCK BY LOCATION
router.get("/:id/locations", (req, res) => {

  const productId = req.params.id;

  const query = `
  SELECT
    p.product_name,
    l.location_name,
    pl.quantity
  FROM product_locations pl
  JOIN products p ON pl.product_id = p.id
  JOIN locations l ON pl.location_id = l.id
  WHERE pl.product_id = ?
  `;

  db.all(query, [productId], (err, rows) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);

  });

});

module.exports = router;