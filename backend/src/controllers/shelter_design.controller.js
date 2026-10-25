const pool = require("../config/db");

// GET ALL SHELTER DESIGNS
const getShelterDesigns = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                sd.id,
                sd.name,
                sd.climate_id,
                cp.name AS climate_name,
                cp.location AS climate_location,
                sd.length,
                sd.width,
                sd.height,
                sd.orientation,
                sd.wall_thickness,
                sd.roof_thickness,
                sd.floor_thickness,
                sd.wall_material_id,
                wm.name AS wall_material,
                sd.roof_material_id,
                rm.name AS roof_material,
                sd.floor_material_id,
                fm.name AS floor_material,
                sd.created_at
            FROM shelter_designs sd
            LEFT JOIN climate_profiles cp
                ON sd.climate_id = cp.id
            LEFT JOIN materials wm
                ON sd.wall_material_id = wm.id
            LEFT JOIN materials rm
                ON sd.roof_material_id = rm.id
            LEFT JOIN materials fm
                ON sd.floor_material_id = fm.id
            ORDER BY sd.id DESC`
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error("Get shelter designs error:", error);

        res.status(500).json({
            message: "Failed to fetch shelter designs"
        });
    }
};


// GET ONE SHELTER DESIGN
const getShelterDesignById = async (req, res) => {
    try {
        const designId = req.params.id;

        const [rows] = await pool.query(
            `SELECT
                sd.id,
                sd.name,
                sd.climate_id,
                cp.name AS climate_name,
                cp.location AS climate_location,
                sd.length,
                sd.width,
                sd.height,
                sd.orientation,
                sd.wall_thickness,
                sd.roof_thickness,
                sd.floor_thickness,
                sd.wall_material_id,
                wm.name AS wall_material,
                sd.roof_material_id,
                rm.name AS roof_material,
                sd.floor_material_id,
                fm.name AS floor_material,
                sd.created_at
            FROM shelter_designs sd
            LEFT JOIN climate_profiles cp
                ON sd.climate_id = cp.id
            LEFT JOIN materials wm
                ON sd.wall_material_id = wm.id
            LEFT JOIN materials rm
                ON sd.roof_material_id = rm.id
            LEFT JOIN materials fm
                ON sd.floor_material_id = fm.id
            WHERE sd.id = ?`,
            [designId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Shelter design not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get shelter design error:", error);

        res.status(500).json({
            message: "Failed to fetch shelter design"
        });
    }
};


// CREATE SHELTER DESIGN
const createShelterDesign = async (req, res) => {
    try {

        const {
            name,
            climate_id,
            length,
            width,
            height,
            orientation,
            wall_thickness,
            roof_thickness,
            floor_thickness,
            wall_material_id,
            roof_material_id,
            floor_material_id
        } = req.body;


        // BASIC VALIDATION
        if (
            !name ||
            climate_id === undefined ||
            length === undefined ||
            width === undefined ||
            height === undefined ||
            wall_thickness === undefined ||
            roof_thickness === undefined ||
            floor_thickness === undefined ||
            wall_material_id === undefined ||
            roof_material_id === undefined ||
            floor_material_id === undefined
        ) {
            return res.status(400).json({
                message:
                    "Name, climate, dimensions, thicknesses and materials are required"
            });
        }


        // CONVERT VALUES TO NUMBERS
        const climateId = Number(climate_id);

        const lengthValue = Number(length);
        const widthValue = Number(width);
        const heightValue = Number(height);

        const orientationValue =
            orientation === undefined
                ? 0
                : Number(orientation);

        const wallThickness = Number(wall_thickness);
        const roofThickness = Number(roof_thickness);
        const floorThickness = Number(floor_thickness);

        const wallMaterialId = Number(wall_material_id);
        const roofMaterialId = Number(roof_material_id);
        const floorMaterialId = Number(floor_material_id);


        // CHECK NUMBERS
        if (
            !Number.isInteger(climateId) ||
            !Number.isFinite(lengthValue) ||
            !Number.isFinite(widthValue) ||
            !Number.isFinite(heightValue) ||
            !Number.isFinite(orientationValue) ||
            !Number.isFinite(wallThickness) ||
            !Number.isFinite(roofThickness) ||
            !Number.isFinite(floorThickness) ||
            !Number.isInteger(wallMaterialId) ||
            !Number.isInteger(roofMaterialId) ||
            !Number.isInteger(floorMaterialId)
        ) {
            return res.status(400).json({
                message: "Invalid numeric value supplied"
            });
        }


        // CHECK POSITIVE VALUES
        if (
            lengthValue <= 0 ||
            widthValue <= 0 ||
            heightValue <= 0 ||
            wallThickness <= 0 ||
            roofThickness <= 0 ||
            floorThickness <= 0
        ) {
            return res.status(400).json({
                message:
                    "Dimensions and thicknesses must be greater than zero"
            });
        }


        // CHECK ORIENTATION
        if (
            orientationValue < 0 ||
            orientationValue >= 360
        ) {
            return res.status(400).json({
                message:
                    "Orientation must be between 0 and 359 degrees"
            });
        }


        // CHECK CLIMATE
        const [climateRows] = await pool.query(
            `SELECT id
             FROM climate_profiles
             WHERE id = ?`,
            [climateId]
        );

        if (climateRows.length === 0) {
            return res.status(400).json({
                message:
                    "Selected climate profile does not exist"
            });
        }


        // CHECK WALL MATERIAL
        const [wallRows] = await pool.query(
            `SELECT id
             FROM materials
             WHERE id = ?`,
            [wallMaterialId]
        );

        if (wallRows.length === 0) {
            return res.status(400).json({
                message:
                    "Selected wall material does not exist"
            });
        }


        // CHECK ROOF MATERIAL
        const [roofRows] = await pool.query(
            `SELECT id
             FROM materials
             WHERE id = ?`,
            [roofMaterialId]
        );

        if (roofRows.length === 0) {
            return res.status(400).json({
                message:
                    "Selected roof material does not exist"
            });
        }


        // CHECK FLOOR MATERIAL
        const [floorRows] = await pool.query(
            `SELECT id
             FROM materials
             WHERE id = ?`,
            [floorMaterialId]
        );

        if (floorRows.length === 0) {
            return res.status(400).json({
                message:
                    "Selected floor material does not exist"
            });
        }


        // INSERT DESIGN
        const [result] = await pool.query(
            `INSERT INTO shelter_designs
            (
                name,
                climate_id,
                length,
                width,
                height,
                orientation,
                wall_thickness,
                roof_thickness,
                floor_thickness,
                wall_material_id,
                roof_material_id,
                floor_material_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                climateId,
                lengthValue,
                widthValue,
                heightValue,
                orientationValue,
                wallThickness,
                roofThickness,
                floorThickness,
                wallMaterialId,
                roofMaterialId,
                floorMaterialId
            ]
        );


        // SUCCESS RESPONSE
        res.status(201).json({
            message:
                "Shelter design created successfully",

            design: {
                id: result.insertId,
                name,
                climate_id: climateId,
                length: lengthValue,
                width: widthValue,
                height: heightValue,
                orientation: orientationValue,
                wall_thickness: wallThickness,
                roof_thickness: roofThickness,
                floor_thickness: floorThickness,
                wall_material_id: wallMaterialId,
                roof_material_id: roofMaterialId,
                floor_material_id: floorMaterialId
            }
        });

    } catch (error) {

        console.error(
            "Create shelter design error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create shelter design"
        });
    }
};


// DELETE SHELTER DESIGN
const deleteShelterDesign = async (req, res) => {
    try {

        const designId = req.params.id;

        const [result] = await pool.query(
            `DELETE FROM shelter_designs
             WHERE id = ?`,
            [designId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message:
                    "Shelter design not found"
            });
        }

        res.status(200).json({
            message:
                "Shelter design deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete shelter design error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to delete shelter design"
        });
    }
};


module.exports = {
    getShelterDesigns,
    getShelterDesignById,
    createShelterDesign,
    deleteShelterDesign
};