const pool = require("../config/db");

const {
    generateDesignRecommendations
} = require("../services/designRecommendation");

// ============================================================
// SUGGEST 5 DESIGNS
// ============================================================

async function suggestDesigns(req, res) {

    try {

        const {
            outdoor_temperature,
            solar_radiation,
            wind_speed,
            humidity,
            simulation_hours
        } = req.body;

        // ----------------------------------------------------
        // Validate climate input
        // ----------------------------------------------------

        const temperature =
            Number(outdoor_temperature);

        const solar =
            Number(solar_radiation);

        const wind =
            Number(wind_speed);

        const humidityValue =
            Number(humidity);

        if (!Number.isFinite(temperature)) {

            return res.status(400).json({
                message:
                    "Valid outdoor_temperature is required"
            });
        }

        if (
            !Number.isFinite(solar) ||
            solar < 0
        ) {

            return res.status(400).json({
                message:
                    "Valid solar_radiation is required"
            });
        }

        if (
            !Number.isFinite(wind) ||
            wind < 0
        ) {

            return res.status(400).json({
                message:
                    "Valid wind_speed is required"
            });
        }

        if (
            !Number.isFinite(humidityValue) ||
            humidityValue < 0 ||
            humidityValue > 100
        ) {

            return res.status(400).json({
                message:
                    "Humidity must be between 0 and 100"
            });
        }

        // ----------------------------------------------------
        // Simulation duration
        // ----------------------------------------------------

        const simulationHours =
            Number(simulation_hours || 24);

        if (
            ![24, 48, 72]
                .includes(simulationHours)
        ) {

            return res.status(400).json({
                message:
                    "simulation_hours must be 24, 48, or 72"
            });
        }

        // ----------------------------------------------------
        // Build temporary climate object
        // ----------------------------------------------------

        const climate = {

            id: null,

            name:
                "User Defined Climate",

            location:
                "User Input",

            outdoor_temperature:
                temperature,

            solar_radiation:
                solar,

            wind_speed:
                wind,

            humidity:
                humidityValue
        };

        // ----------------------------------------------------
        // Get available materials
        // ----------------------------------------------------

        const [materials] =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    thermal_conductivity,
                    density,
                    specific_heat,
                    description
                FROM materials
                ORDER BY id ASC
                `
            );

        if (
            materials.length === 0
        ) {

            return res.status(400).json({
                message:
                    "No materials are available in the database"
            });
        }

        // ----------------------------------------------------
        // Generate recommendations
        // ----------------------------------------------------

        const recommendations =
            generateDesignRecommendations({

                climate,

                materials,

                simulationHours
            });

        // ----------------------------------------------------
        // Return result
        // ----------------------------------------------------

        res.json({

            message:
                "Five shelter designs generated successfully",

            climate: {

                outdoor_temperature:
                    temperature,

                solar_radiation:
                    solar,

                wind_speed:
                    wind,

                humidity:
                    humidityValue
            },

            simulation: {

                duration_hours:
                    simulationHours
            },

            recommendation_count:
                recommendations.length,

            recommendations

        });

    } catch (error) {

        console.error(
            "Design recommendation error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to generate shelter design recommendations",

            error:
                error.message

        });
    }
}

module.exports = {
    suggestDesigns
};