const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post(
  "/signup",

  [
    body("user_id")
      .notEmpty()
      .withMessage("User ID is required")
      .isLength({ min: 5, max: 12 })
      .withMessage("User ID must be between 5 and 12 characters"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Valid email required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, email, password } = req.body;

    try {
      // Check duplicate user_id
      db.get(
        "SELECT * FROM users WHERE user_id = ? OR email = ?",
        [user_id, email],
        async (err, row) => {
          if (row) {
            return res.status(400).json({
              message: "User ID or Email already exists",
            });
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert user
          db.run(
            "INSERT INTO users (user_id, email, password) VALUES (?, ?, ?)",
            [user_id, email, hashedPassword],
            function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              res.json({
                message: "User registered successfully",
                user_id: user_id,
              });
            },
          );
        },
      );
    } catch (error) {
      res.status(500).json({
        message: "Server error",
      });
    }
  },
);

module.exports = router;
