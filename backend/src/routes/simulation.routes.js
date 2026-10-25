const express = require("express");

const {
    runSimulation,
    getSimulationResults,
    getSimulationResultById
} = require("../controllers/simulation.controller");

const router = express.Router();

router.post(
    "/run",
    runSimulation
);

router.get(
    "/",
    getSimulationResults
);

router.get(
    "/:id",
    getSimulationResultById
);

module.exports = router;