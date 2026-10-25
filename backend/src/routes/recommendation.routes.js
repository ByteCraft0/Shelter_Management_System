const express = require("express");

const {
    suggestDesigns
} = require("../controllers/recommendation.controller");

const router = express.Router();

// Main recommendation endpoint
router.post("/", suggestDesigns);

// Alternative endpoint
router.post("/suggest", suggestDesigns);

module.exports = router;