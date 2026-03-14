const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const db = require("../db/database");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = "hackathon_secret_key";

router.post(
  "/signup",
  [
    body("user_id").notEmpty().withMessage("User ID required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, email, password } = req.body;

    // check duplicate user
    db.get(
      "SELECT * FROM users WHERE user_id = ? OR email = ?",
      [user_id, email],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (row) {
          return res.status(400).json({
            message: "User already exists",
          });
        }

        // hash password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          db.run(
            "INSERT INTO users (user_id, email, password) VALUES (?, ?, ?)",
            [user_id, email, hashedPassword],
            function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              res.json({
                message: "User registered successfully",
                userId: this.lastID,
              });
            },
          );
        });
      },
    );
  },
);

router.post(
  "/login",
  [
    body("user_id").notEmpty().withMessage("User ID required"),
    body("password").notEmpty().withMessage("Password required"),
  ],

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, password } = req.body;

    db.get("SELECT * FROM users WHERE user_id = ?", [user_id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!result) {
          return res.status(401).json({
            message: "Invalid password",
          });
        }

        const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, {
          expiresIn: "2h",
        });

        res.json({
          message: "Login successful",
          token: token,
        });
      });
    });
  },
);

module.exports = router;
