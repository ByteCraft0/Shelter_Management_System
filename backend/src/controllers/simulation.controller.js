const pool = require("../config/db");
const calculateThermalSimulation = require("../services/thermalSimulation");

// ============================================================
// RUN THERMAL SIMULATION
// ============================================================

async function runSimulation(req, res) {
    try {
        const {
            shelter_design_id,
            simulation_hours
        } = req.body;

        // ----------------------------------------------------
        // Validate input
        // ----------------------------------------------------

        if (!shelter_design_id) {
            return res.status(400).json({
                message: "shelter_design_id is required"
            });
        }

        const simulationHours =
            Number(simulation_hours || 24);

        if (![24, 48, 72].includes(simulationHours)) {
            return res.status(400).json({
                message:
                    "simulation_hours must be 24, 48, or 72"
            });
        }

        // ----------------------------------------------------
        // Get shelter design
        // ----------------------------------------------------

        const [designRows] = await pool.query(
            `
            SELECT
                sd.*,

                cp.id AS climate_id,
                cp.name AS climate_name,
                cp.location AS climate_location,
                cp.outdoor_temperature,
                cp.solar_radiation,
                cp.wind_speed,
                cp.humidity

            FROM shelter_designs sd

            LEFT JOIN climate_profiles cp
                ON sd.climate_id = cp.id

            WHERE sd.id = ?
            `,
            [shelter_design_id]
        );

        if (designRows.length === 0) {
            return res.status(404).json({
                message: "Shelter design not found"
            });
        }

        const design = designRows[0];

        // ----------------------------------------------------
        // Check climate
        // ----------------------------------------------------

        if (!design.climate_id) {
            return res.status(400).json({
                message:
                    "This shelter design does not have a climate profile"
            });
        }

        const climate = {
            id: design.climate_id,
            name: design.climate_name,
            location: design.climate_location,
            outdoor_temperature:
                design.outdoor_temperature,
            solar_radiation:
                design.solar_radiation,
            wind_speed:
                design.wind_speed,
            humidity:
                design.humidity
        };

        // ----------------------------------------------------
        // Get wall material
        // ----------------------------------------------------

        const [wallRows] = await pool.query(
            `
            SELECT *
            FROM materials
            WHERE id = ?
            `,
            [design.wall_material_id]
        );

        // ----------------------------------------------------
        // Get roof material
        // ----------------------------------------------------

        const [roofRows] = await pool.query(
            `
            SELECT *
            FROM materials
            WHERE id = ?
            `,
            [design.roof_material_id]
        );

        // ----------------------------------------------------
        // Get floor material
        // ----------------------------------------------------

        const [floorRows] = await pool.query(
            `
            SELECT *
            FROM materials
            WHERE id = ?
            `,
            [design.floor_material_id]
        );

        if (
            wallRows.length === 0 ||
            roofRows.length === 0 ||
            floorRows.length === 0
        ) {
            return res.status(400).json({
                message:
                    "One or more shelter materials were not found"
            });
        }

        const materials = {
            wall: wallRows[0],
            roof: roofRows[0],
            floor: floorRows[0]
        };

        // ----------------------------------------------------
        // Get openings
        // ----------------------------------------------------

        const [openings] = await pool.query(
            `
            SELECT *
            FROM openings
            WHERE shelter_design_id = ?
            ORDER BY id ASC
            `,
            [shelter_design_id]
        );

        // ----------------------------------------------------
        // Run thermal engine
        // ----------------------------------------------------

        const result =
            calculateThermalSimulation({
                climate,
                design,
                materials,
                openings,
                simulationHours
            });

        // ----------------------------------------------------
        // Save simulation summary
        // ----------------------------------------------------

        const [insertResult] = await pool.query(
            `
            INSERT INTO simulation_results
            (
                shelter_design_id,
                simulation_hours,
                average_indoor_temperature,
                minimum_indoor_temperature,
                maximum_indoor_temperature,
                total_solar_gain,
                total_heat_loss,
                thermal_comfort_score
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                shelter_design_id,
                simulationHours,
                result.summary.average_indoor_temperature,
                result.summary.minimum_indoor_temperature,
                result.summary.maximum_indoor_temperature,
                result.summary.total_solar_gain,
                result.summary.total_heat_loss,
                result.summary.thermal_comfort_score
            ]
        );

        // ----------------------------------------------------
        // Return complete simulation response
        // ----------------------------------------------------

        res.status(201).json({
            message:
                "Thermal simulation completed successfully",

            simulation_id:
                insertResult.insertId,

            shelter_design: {
                id: design.id,
                name: design.name,
                length: design.length,
                width: design.width,
                height: design.height,
                orientation: design.orientation,
                wall_thickness:
                    design.wall_thickness,
                roof_thickness:
                    design.roof_thickness,
                floor_thickness:
                    design.floor_thickness
            },

            climate,

            materials: {
                wall: materials.wall,
                roof: materials.roof,
                floor: materials.floor
            },

            openings,

            simulation:
                result.simulation,

            summary:
                result.summary,

            heat_transfer:
                result.heat_transfer,

            hourly_data:
                result.hourly_data
        });

    } catch (error) {

        console.error(
            "Simulation error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to run thermal simulation",

            error:
                error.message
        });
    }
}


// ============================================================
// GET ALL SIMULATION RESULTS
// ============================================================

async function getSimulationResults(req, res) {
    try {

        const [rows] = await pool.query(
            `
            SELECT
                sr.id,
                sr.shelter_design_id,

                sd.name AS shelter_design_name,

                sd.climate_id,

                cp.name AS climate_name,
                cp.location AS climate_location,
                cp.outdoor_temperature,
                cp.solar_radiation,
                cp.wind_speed,
                cp.humidity,

                sr.simulation_hours,

                sr.average_indoor_temperature,
                sr.minimum_indoor_temperature,
                sr.maximum_indoor_temperature,

                sr.total_solar_gain,
                sr.total_heat_loss,
                sr.thermal_comfort_score,

                sr.created_at

            FROM simulation_results sr

            LEFT JOIN shelter_designs sd
                ON sr.shelter_design_id = sd.id

            LEFT JOIN climate_profiles cp
                ON sd.climate_id = cp.id

            ORDER BY sr.id DESC
            `
        );

        res.json(rows);

    } catch (error) {

        console.error(
            "Get simulations error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch simulation results",

            error:
                error.message
        });
    }
}


// ============================================================
// GET ONE SIMULATION RESULT BY ID
// ============================================================

async function getSimulationResultById(req, res) {
    try {

        const simulationId =
            Number(req.params.id);

        if (
            !Number.isInteger(simulationId) ||
            simulationId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid simulation ID"
            });
        }

        // ----------------------------------------------------
        // Get saved simulation + design + climate
        // ----------------------------------------------------

        const [simulationRows] =
            await pool.query(
                `
                SELECT
                    sr.*,

                    sd.name AS shelter_design_name,
                    sd.climate_id,

                    sd.length,
                    sd.width,
                    sd.height,
                    sd.orientation,

                    sd.wall_thickness,
                    sd.roof_thickness,
                    sd.floor_thickness,

                    cp.name AS climate_name,
                    cp.location AS climate_location,
                    cp.outdoor_temperature,
                    cp.solar_radiation,
                    cp.wind_speed,
                    cp.humidity

                FROM simulation_results sr

                LEFT JOIN shelter_designs sd
                    ON sr.shelter_design_id = sd.id

                LEFT JOIN climate_profiles cp
                    ON sd.climate_id = cp.id

                WHERE sr.id = ?
                `,
                [simulationId]
            );

        if (simulationRows.length === 0) {
            return res.status(404).json({
                message:
                    "Simulation result not found"
            });
        }

        const simulation =
            simulationRows[0];

        // ----------------------------------------------------
        // Get openings
        // ----------------------------------------------------

        const [openings] =
            await pool.query(
                `
                SELECT *
                FROM openings
                WHERE shelter_design_id = ?
                ORDER BY id ASC
                `,
                [simulation.shelter_design_id]
            );

        // ----------------------------------------------------
        // Build complete response
        // ----------------------------------------------------

        res.json({

            simulation_id:
                simulation.id,

            shelter_design: {
                id:
                    simulation.shelter_design_id,

                name:
                    simulation.shelter_design_name,

                climate_id:
                    simulation.climate_id,

                length:
                    simulation.length,

                width:
                    simulation.width,

                height:
                    simulation.height,

                orientation:
                    simulation.orientation,

                wall_thickness:
                    simulation.wall_thickness,

                roof_thickness:
                    simulation.roof_thickness,

                floor_thickness:
                    simulation.floor_thickness
            },

            climate: {

                id:
                    simulation.climate_id,

                name:
                    simulation.climate_name,

                location:
                    simulation.climate_location,

                outdoor_temperature:
                    simulation.outdoor_temperature,

                solar_radiation:
                    simulation.solar_radiation,

                wind_speed:
                    simulation.wind_speed,

                humidity:
                    simulation.humidity
            },

            simulation: {
                duration_hours:
                    simulation.simulation_hours
            },

            summary: {

                average_indoor_temperature:
                    simulation.average_indoor_temperature,

                minimum_indoor_temperature:
                    simulation.minimum_indoor_temperature,

                maximum_indoor_temperature:
                    simulation.maximum_indoor_temperature,

                total_solar_gain:
                    simulation.total_solar_gain,

                total_heat_loss:
                    simulation.total_heat_loss,

                thermal_comfort_score:
                    simulation.thermal_comfort_score
            },

            openings,

            created_at:
                simulation.created_at
        });

    } catch (error) {

        console.error(
            "Get simulation by ID error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch simulation result",

            error:
                error.message
        });
    }
}


// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
    runSimulation,
    getSimulationResults,
    getSimulationResultById
};