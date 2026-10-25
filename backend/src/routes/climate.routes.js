const express = require("express");

const {
    getClimateProfiles,
    getClimateProfileById,
    createClimateProfile
} = require("../controllers/climate.controller");

const router = express.Router();


// GET ALL CLIMATE PROFILES
router.get("/", getClimateProfiles);


// GET ONE CLIMATE PROFILE
router.get("/:id", getClimateProfileById);


// CREATE CLIMATE PROFILE
router.post("/", createClimateProfile);


module.exports = router;