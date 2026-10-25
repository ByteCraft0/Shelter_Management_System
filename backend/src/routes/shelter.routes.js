const express = require("express");

const {
    createShelter,
    getShelters,
    updateCapacity
} = require("../controllers/shelter.controller");

const router = express.Router();


// GET all shelters
router.get("/", getShelters);


// CREATE shelter
router.post("/", createShelter);


// UPDATE shelter capacity
router.patch("/:id/capacity", updateCapacity);


module.exports = router;