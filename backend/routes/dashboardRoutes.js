const express = require("express");
const router = express.Router();
const db = require("../db/database");
const authMiddleware = require("../middleware/authMiddleware");


// DASHBOARD STATS
router.get("/stats", authMiddleware, (req, res) => {

  const stats = {};

  db.get(`SELECT COUNT(*) AS total_products FROM products`, (err, row) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    stats.total_products = row?.total_products || 0;

    db.get(`SELECT COUNT(*) AS total_locations FROM locations`, (err, row) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      stats.total_locations = row?.total_locations || 0;

      db.get(`SELECT SUM(quantity) AS total_stock FROM products`, (err, row) => {

        if (err) {
          return res.status(500).json({ error: err.message });
        }

        stats.total_stock = row?.total_stock || 0;

        db.get(
          `SELECT COUNT(*) AS low_stock_items
           FROM products
           WHERE quantity <= low_stock_limit`,
          (err, row) => {

            if (err) {
              return res.status(500).json({ error: err.message });
            }

            stats.low_stock_items = row?.low_stock_items || 0;

            res.json(stats);

          }
        );

      });

    });

  });

});

module.exports = router;