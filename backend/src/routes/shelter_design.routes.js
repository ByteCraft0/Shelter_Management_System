const express = require("express");

const {
    getShelterDesigns,
    getShelterDesignById,
    createShelterDesign,
    deleteShelterDesign
} = require("../controllers/shelter_design.controller");

const router = express.Router();

router.get("/", getShelterDesigns);

router.get("/:id", getShelterDesignById);

router.post("/", createShelterDesign);

router.delete("/:id", deleteShelterDesign);

module.exports = router;