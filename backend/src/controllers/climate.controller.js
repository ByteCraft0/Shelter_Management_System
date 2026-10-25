const pool = require("../config/db");

// GET ALL CLIMATE PROFILES
const getClimateProfiles = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT *
             FROM climate_profiles
             ORDER BY id DESC`
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error("Get climate profiles error:", error);

        res.status(500).json({
            message: "Failed to fetch climate profiles"
        });
    }
};


// GET ONE CLIMATE PROFILE
const getClimateProfileById = async (req, res) => {
    try {
        const climateId = req.params.id;

        const [rows] = await pool.query(
            `SELECT *
             FROM climate_profiles
             WHERE id = ?`,
            [climateId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Climate profile not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get climate profile error:", error);

        res.status(500).json({
            message: "Failed to fetch climate profile"
        });
    }
};


// CREATE CLIMATE PROFILE
const createClimateProfile = async (req, res) => {
    try {
        const {
            name,
            location,
            outdoor_temperature,
            solar_radiation,
            wind_speed,
            humidity
        } = req.body;


        // VALIDATION
        if (
            !name ||
            !location ||
            outdoor_temperature === undefined ||
            solar_radiation === undefined ||
            wind_speed === undefined ||
            humidity === undefined
        ) {
            return res.status(400).json({
                message:
                    "Name, location, outdoor temperature, solar radiation, wind speed and humidity are required"
            });
        }


        const [result] = await pool.query(
            `INSERT INTO climate_profiles
            (
                name,
                location,
                outdoor_temperature,
                solar_radiation,
                wind_speed,
                humidity
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name,
                location,
                outdoor_temperature,
                solar_radiation,
                wind_speed,
                humidity
            ]
        );


        res.status(201).json({
            message: "Climate profile created successfully",

            climate: {
                id: result.insertId,
                name,
                location,
                outdoor_temperature,
                solar_radiation,
                wind_speed,
                humidity
            }
        });

    } catch (error) {
        console.error("Create climate profile error:", error);

        res.status(500).json({
            message: "Failed to create climate profile"
        });
    }
};


module.exports = {
    getClimateProfiles,
    getClimateProfileById,
    createClimateProfile
};