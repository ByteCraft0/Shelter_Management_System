const pool = require("../config/db");


// GET ALL MATERIALS
const getMaterials = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT *
             FROM materials
             ORDER BY id ASC`
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error("Get materials error:", error);

        res.status(500).json({
            message: "Failed to fetch materials"
        });
    }
};


// GET ONE MATERIAL
const getMaterialById = async (req, res) => {
    try {
        const materialId = req.params.id;

        const [rows] = await pool.query(
            `SELECT *
             FROM materials
             WHERE id = ?`,
            [materialId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get material error:", error);

        res.status(500).json({
            message: "Failed to fetch material"
        });
    }
};


// CREATE MATERIAL
const createMaterial = async (req, res) => {
    try {
        const {
            name,
            thermal_conductivity,
            density,
            specific_heat,
            description
        } = req.body;

        if (
            !name ||
            thermal_conductivity === undefined ||
            density === undefined ||
            specific_heat === undefined
        ) {
            return res.status(400).json({
                message:
                    "Name, thermal conductivity, density and specific heat are required"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO materials
            (
                name,
                thermal_conductivity,
                density,
                specific_heat,
                description
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                thermal_conductivity,
                density,
                specific_heat,
                description || null
            ]
        );

        res.status(201).json({
            message: "Material created successfully",

            material: {
                id: result.insertId,
                name,
                thermal_conductivity,
                density,
                specific_heat,
                description: description || null
            }
        });

    } catch (error) {
        console.error("Create material error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Material with this name already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create material"
        });
    }
};


module.exports = {
    getMaterials,
    getMaterialById,
    createMaterial
};