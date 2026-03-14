const express = require("express");
const { body, validationResult } = require("express-validator");

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

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    res.json({
      message: "Validation passed",
    });
  },
);

module.exports = router;
