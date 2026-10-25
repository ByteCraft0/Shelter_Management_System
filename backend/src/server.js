const express = require("express");
const cors = require("cors");
require("dotenv").config();

const shelterRoutes = require("./routes/shelter.routes");
const climateRoutes = require("./routes/climate.routes");
const materialRoutes = require("./routes/material.routes");
const shelterDesignRoutes = require("./routes/shelter_design.routes");
const openingRoutes = require("./routes/opening.routes");
const simulationRoutes = require("./routes/simulation.routes");
const recommendationRoutes = require("./routes/recommendation.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Shelter Thermal Simulation Backend is running!"
    });
});

app.use("/api/shelters", shelterRoutes);
app.use("/api/climate", climateRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/designs", shelterDesignRoutes);
app.use("/api/openings", openingRoutes);
app.use("/api/simulations", simulationRoutes);

// Recommendation system
app.use(
    "/api/recommendations",
    recommendationRoutes
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});