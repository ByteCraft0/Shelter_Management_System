const pool = require("../config/db");

// GET ALL OPENINGS
const getOpenings = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                o.id,
                o.shelter_design_id,
                sd.name AS shelter_design_name,
                o.opening_type,
                o.area,
                o.count,
                o.orientation,
                o.u_value,
                o.created_at
            FROM openings o
            LEFT JOIN shelter_designs sd
                ON o.shelter_design_id = sd.id
            ORDER BY o.id DESC`
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error("Get openings error:", error);

        res.status(500).json({
            message: "Failed to fetch openings"
        });
    }
};


// GET OPENINGS FOR ONE SHELTER DESIGN
const getOpeningsByDesign = async (req, res) => {
    try {
        const designId = req.params.designId;

        const [designRows] = await pool.query(
            `SELECT id, name
             FROM shelter_designs
             WHERE id = ?`,
            [designId]
        );

        if (designRows.length === 0) {
            return res.status(404).json({
                message: "Shelter design not found"
            });
        }

        const [rows] = await pool.query(
            `SELECT *
             FROM openings
             WHERE shelter_design_id = ?
             ORDER BY id ASC`,
            [designId]
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error(
            "Get openings by design error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch openings for shelter design"
        });
    }
};


// GET ONE OPENING
const getOpeningById = async (req, res) => {
    try {
        const openingId = req.params.id;

        const [rows] = await pool.query(
            `SELECT
                o.id,
                o.shelter_design_id,
                sd.name AS shelter_design_name,
                o.opening_type,
                o.area,
                o.count,
                o.orientation,
                o.u_value,
                o.created_at
            FROM openings o
            LEFT JOIN shelter_designs sd
                ON o.shelter_design_id = sd.id
            WHERE o.id = ?`,
            [openingId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Opening not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get opening error:", error);

        res.status(500).json({
            message: "Failed to fetch opening"
        });
    }
};


// CREATE OPENING
const createOpening = async (req, res) => {
    try {
        const {
            shelter_design_id,
            opening_type,
            area,
            count,
            orientation,
            u_value
        } = req.body;

        if (
            shelter_design_id === undefined ||
            !opening_type ||
            area === undefined
        ) {
            return res.status(400).json({
                message:
                    "Shelter design, opening type and area are required"
            });
        }

        const designId = Number(shelter_design_id);
        const areaValue = Number(area);

        const countValue =
            count === undefined
                ? 1
                : Number(count);

        const orientationValue =
            orientation === undefined
                ? 0
                : Number(orientation);

        const uValue =
            u_value === undefined ||
            u_value === null ||
            u_value === ""
                ? null
                : Number(u_value);

        if (!Number.isInteger(designId)) {
            return res.status(400).json({
                message:
                    "Shelter design ID must be an integer"
            });
        }

        if (
            opening_type !== "window" &&
            opening_type !== "door"
        ) {
            return res.status(400).json({
                message:
                    "Opening type must be either window or door"
            });
        }

        if (
            !Number.isFinite(areaValue) ||
            areaValue <= 0
        ) {
            return res.status(400).json({
                message:
                    "Opening area must be greater than zero"
            });
        }

        if (
            !Number.isInteger(countValue) ||
            countValue <= 0
        ) {
            return res.status(400).json({
                message:
                    "Opening count must be a positive integer"
            });
        }

        if (
            !Number.isFinite(orientationValue) ||
            orientationValue < 0 ||
            orientationValue >= 360
        ) {
            return res.status(400).json({
                message:
                    "Orientation must be between 0 and 359 degrees"
            });
        }

        if (
            uValue !== null &&
            (
                !Number.isFinite(uValue) ||
                uValue < 0
            )
        ) {
            return res.status(400).json({
                message:
                    "U-value must be zero or greater"
            });
        }

        const [designRows] = await pool.query(
            `SELECT id
             FROM shelter_designs
             WHERE id = ?`,
            [designId]
        );

        if (designRows.length === 0) {
            return res.status(400).json({
                message:
                    "Selected shelter design does not exist"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO openings
            (
                shelter_design_id,
                opening_type,
                area,
                count,
                orientation,
                u_value
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                designId,
                opening_type,
                areaValue,
                countValue,
                orientationValue,
                uValue
            ]
        );

        res.status(201).json({
            message:
                "Opening created successfully",

            opening: {
                id: result.insertId,
                shelter_design_id: designId,
                opening_type,
                area: areaValue,
                count: countValue,
                orientation: orientationValue,
                u_value: uValue
            }
        });

    } catch (error) {
        console.error(
            "Create opening error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create opening"
        });
    }
};


// DELETE OPENING
const deleteOpening = async (req, res) => {
    try {
        const openingId = req.params.id;

        const [result] = await pool.query(
            `DELETE FROM openings
             WHERE id = ?`,
            [openingId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Opening not found"
            });
        }

        res.status(200).json({
            message:
                "Opening deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete opening error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to delete opening"
        });
    }
};


module.exports = {
    getOpenings,
    getOpeningsByDesign,
    getOpeningById,
    createOpening,
    deleteOpening
};