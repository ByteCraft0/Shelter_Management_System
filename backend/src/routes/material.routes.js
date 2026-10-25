const express = require("express");

const {
    getMaterials,
    getMaterialById,
    createMaterial
} = require("../controllers/material.controller");

const router = express.Router();

router.get("/", getMaterials);

router.get("/:id", getMaterialById);

router.post("/", createMaterial);

module.exports = router;