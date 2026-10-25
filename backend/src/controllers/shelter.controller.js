const pool = require("../config/db");

// ==========================================
// CREATE SHELTER
// ==========================================

const createShelter = async (req, res) => {
    try {
        const {
            name,
            address,
            city,
            latitude,
            longitude,
            total_capacity
        } = req.body;

        if (!name || !address || !city || !total_capacity) {
            return res.status(400).json({
                message: "Name, address, city and total capacity are required"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO shelters
            (
                name,
                address,
                city,
                latitude,
                longitude,
                total_capacity,
                available_capacity
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                address,
                city,
                latitude || null,
                longitude || null,
                total_capacity,
                total_capacity
            ]
        );

        res.status(201).json({
            message: "Shelter created successfully",

            shelter: {
                id: result.insertId,
                name,
                address,
                city,
                latitude: latitude || null,
                longitude: longitude || null,
                total_capacity,
                available_capacity: total_capacity,
                status: "active"
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create shelter"
        });
    }
};


// ==========================================
// GET ALL SHELTERS
// ==========================================

const getShelters = async (req, res) => {
    try {

        const [rows] = await pool.query(
            "SELECT * FROM shelters ORDER BY id DESC"
        );

        res.status(200).json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch shelters"
        });
    }
};


// ==========================================
// UPDATE SHELTER CAPACITY
// ==========================================

const updateCapacity = async (req, res) => {

    try {

        const shelterId = req.params.id;

        const {
            people_change
        } = req.body;

        if (
            people_change === undefined ||
            people_change === null
        ) {
            return res.status(400).json({
                message: "people_change is required"
            });
        }

        const change = Number(people_change);

        if (!Number.isInteger(change) || change === 0) {
            return res.status(400).json({
                message: "people_change must be a non-zero integer"
            });
        }


        // Get current shelter
        const [rows] = await pool.query(
            "SELECT * FROM shelters WHERE id = ?",
            [shelterId]
        );


        if (rows.length === 0) {

            return res.status(404).json({
                message: "Shelter not found"
            });

        }


        const shelter = rows[0];


        // Positive value = people enter
        // Negative value = people leave

        const newAvailableCapacity =
            shelter.available_capacity - change;


        // Prevent capacity from going below zero

        if (newAvailableCapacity < 0) {

            return res.status(400).json({
                message: "Not enough available capacity"
            });

        }


        // Prevent capacity from exceeding total capacity

        if (
            newAvailableCapacity >
            shelter.total_capacity
        ) {

            return res.status(400).json({
                message: "Available capacity cannot exceed total capacity"
            });

        }


        // Determine shelter status

        let status = "active";

        if (newAvailableCapacity === 0) {
            status = "full";
        }


        // Update database

        await pool.query(
            `UPDATE shelters
             SET available_capacity = ?,
                 status = ?
             WHERE id = ?`,
            [
                newAvailableCapacity,
                status,
                shelterId
            ]
        );


        res.status(200).json({

            message: "Shelter capacity updated successfully",

            shelter: {
                id: shelter.id,
                name: shelter.name,
                total_capacity: shelter.total_capacity,
                available_capacity:
                    newAvailableCapacity,
                status
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update shelter capacity"
        });

    }
};


module.exports = {
    createShelter,
    getShelters,
    updateCapacity
};