const express = require("express");
const router = express.Router();
const db = require("../db/database");
const authMiddleware = require("../middleware/authMiddleware");


// STOCK IN
router.post("/in", authMiddleware, (req, res) => {

  const { product_id, location_id, quantity, note } = req.body;

  if (!product_id || !location_id || !quantity) {
    return res.status(400).json({
      error: "product_id, location_id and quantity are required"
    });
  }

  db.serialize(() => {

    // ensure location record exists
    db.run(
      `INSERT OR IGNORE INTO product_locations (product_id, location_id, quantity)
       VALUES (?, ?, 0)`,
      [product_id, location_id]
    );

    // update location quantity
    db.run(
      `UPDATE product_locations
       SET quantity = quantity + ?
       WHERE product_id = ? AND location_id = ?`,
      [quantity, product_id, location_id]
    );

    // update total product quantity
    db.run(
      `UPDATE products
       SET quantity = quantity + ?
       WHERE id = ?`,
      [quantity, product_id]
    );

    // log transaction
    db.run(
      `INSERT INTO stock_transactions
       (product_id, type, quantity, to_location, note)
       VALUES (?, 'IN', ?, ?, ?)`,
      [product_id, quantity, location_id, note]
    );

    res.json({
      message: "Stock added successfully"
    });

  });

});


// STOCK OUT
router.post("/out", authMiddleware, (req, res) => {

  const { product_id, location_id, quantity, note } = req.body;

  if (!product_id || !location_id || !quantity) {
    return res.status(400).json({
      error: "product_id, location_id and quantity required"
    });
  }

  db.get(
    `SELECT quantity 
     FROM product_locations
     WHERE product_id=? AND location_id=?`,
    [product_id, location_id],
    (err, row) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({
          error: "Stock not found at this location"
        });
      }

      if (row.quantity < quantity) {
        return res.status(400).json({
          error: "Not enough stock at this location"
        });
      }

      db.serialize(() => {

        db.run(
          `UPDATE product_locations
           SET quantity = quantity - ?
           WHERE product_id=? AND location_id=?`,
          [quantity, product_id, location_id]
        );

        db.run(
          `UPDATE products
           SET quantity = quantity - ?
           WHERE id=?`,
          [quantity, product_id]
        );

        db.run(
          `INSERT INTO stock_transactions
           (product_id, type, quantity, from_location, note)
           VALUES (?, 'OUT', ?, ?, ?)`,
          [product_id, quantity, location_id, note]
        );

        res.json({
          message: "Stock removed successfully"
        });

      });

    }
  );

});


// INTERNAL TRANSFER
router.post("/transfer", authMiddleware, (req, res) => {

  const { product_id, from_location, to_location, quantity, note } = req.body;

  if (!product_id || !from_location || !to_location || !quantity) {
    return res.status(400).json({
      error: "product_id, from_location, to_location, quantity required"
    });
  }

  if (from_location === to_location) {
    return res.status(400).json({
      error: "Cannot transfer to the same location"
    });
  }

  db.get(
    `SELECT quantity
     FROM product_locations
     WHERE product_id=? AND location_id=?`,
    [product_id, from_location],
    (err, row) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row || row.quantity < quantity) {
        return res.status(400).json({
          error: "Not enough stock in source location"
        });
      }

      db.serialize(() => {

        // ensure destination exists
        db.run(
          `INSERT OR IGNORE INTO product_locations (product_id, location_id, quantity)
           VALUES (?, ?, 0)`,
          [product_id, to_location]
        );

        // subtract from source
        db.run(
          `UPDATE product_locations
           SET quantity = quantity - ?
           WHERE product_id=? AND location_id=?`,
          [quantity, product_id, from_location]
        );

        // add to destination
        db.run(
          `UPDATE product_locations
           SET quantity = quantity + ?
           WHERE product_id=? AND location_id=?`,
          [quantity, product_id, to_location]
        );

        // log transfer
        db.run(
          `INSERT INTO stock_transactions
           (product_id, type, quantity, from_location, to_location, note)
           VALUES (?, 'TRANSFER', ?, ?, ?, ?)`,
          [product_id, quantity, from_location, to_location, note]
        );

        res.json({
          message: "Stock transferred successfully"
        });

      });

    }
  );

});


// GET ALL TRANSACTIONS
router.get("/transactions", authMiddleware, (req, res) => {

  const query = `
  SELECT 
    st.id,
    p.product_name,
    st.type,
    st.quantity,
    l1.location_name AS from_location,
    l2.location_name AS to_location,
    st.note,
    st.created_at
  FROM stock_transactions st
  JOIN products p ON st.product_id = p.id
  LEFT JOIN locations l1 ON st.from_location = l1.id
  LEFT JOIN locations l2 ON st.to_location = l2.id
  ORDER BY st.created_at DESC
  `;

  db.all(query, [], (err, rows) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);

  });

});

module.exports = router;