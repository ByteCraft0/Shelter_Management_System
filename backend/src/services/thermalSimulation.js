// ============================================
// THERMAL SIMULATION ENGINE
// ============================================
//
// This is a simplified physics-based model.
// It estimates indoor temperature, solar gain,
// conduction, convection, and opening losses.
//
// It is NOT an engineering-grade thermal solver.
//
// ============================================

function calculateThermalSimulation({
    climate,
    design,
    materials,
    openings = [],
    simulationHours = 24
}) {

    // --------------------------------------------
    // 1. BASIC VALIDATION
    // --------------------------------------------

    if (!climate) {
        throw new Error("Climate data is required");
    }

    if (!design) {
        throw new Error("Shelter design data is required");
    }

    if (!materials) {
        throw new Error("Material data is required");
    }

    if (
        !Number.isInteger(simulationHours) ||
        simulationHours <= 0
    ) {
        throw new Error(
            "Simulation hours must be a positive integer"
        );
    }

    // --------------------------------------------
    // 2. SHELTER DIMENSIONS
    // --------------------------------------------

    const length = Number(design.length);
    const width = Number(design.width);
    const height = Number(design.height);

    const wallThickness = Number(
        design.wall_thickness
    );

    const roofThickness = Number(
        design.roof_thickness
    );

    const floorThickness = Number(
        design.floor_thickness
    );

    if (
        length <= 0 ||
        width <= 0 ||
        height <= 0
    ) {
        throw new Error(
            "Shelter dimensions must be greater than zero"
        );
    }

    // --------------------------------------------
    // 3. SHELTER SURFACE AREAS
    // --------------------------------------------

    const floorArea =
        length * width;

    const roofArea =
        floorArea;

    const wallArea =
        2 * (length + width) * height;

    const totalEnvelopeArea =
        wallArea +
        roofArea +
        floorArea;

    const volume =
        length *
        width *
        height;

    // --------------------------------------------
    // 4. MATERIAL PROPERTIES
    // --------------------------------------------

    const wallMaterial =
        materials.wall;

    const roofMaterial =
        materials.roof;

    const floorMaterial =
        materials.floor;

    if (
        !wallMaterial ||
        !roofMaterial ||
        !floorMaterial
    ) {
        throw new Error(
            "Wall, roof and floor materials are required"
        );
    }

    const wallConductivity =
        Number(
            wallMaterial.thermal_conductivity
        );

    const roofConductivity =
        Number(
            roofMaterial.thermal_conductivity
        );

    const floorConductivity =
        Number(
            floorMaterial.thermal_conductivity
        );

    const wallDensity =
        Number(
            wallMaterial.density
        );

    const wallSpecificHeat =
        Number(
            wallMaterial.specific_heat
        );

    // --------------------------------------------
    // 5. CLIMATE DATA
    // --------------------------------------------

    const outdoorTemperature =
        Number(
            climate.outdoor_temperature
        );

    const solarRadiation =
        Number(
            climate.solar_radiation
        );

    const windSpeed =
        Number(
            climate.wind_speed
        );

    const humidity =
        Number(
            climate.humidity
        );

    // --------------------------------------------
    // 6. BASIC THERMAL CONSTANTS
    // --------------------------------------------

    // Indoor convection coefficient
    const indoorHeatTransfer =
        2.5;

    // Outdoor convection coefficient
    // Increased slightly with wind speed
    const outdoorHeatTransfer =
        5 + 3 * windSpeed;

    // Approximate solar absorption
    const solarAbsorption =
        0.7;

    // Approximate effective thermal mass
    const thermalMass =
        Math.max(
            1,
            wallDensity *
            wallSpecificHeat *
            wallThickness *
            wallArea *
            0.15
        );

    // --------------------------------------------
    // 7. HEAT TRANSFER THROUGH WALLS
    // --------------------------------------------

    const wallResistance =
        1 /
        (
            indoorHeatTransfer +
            outdoorHeatTransfer
        ) +
        wallThickness /
        wallConductivity;

    const wallUValue =
        1 / wallResistance;

    const wallHeatTransferCoefficient =
        wallUValue *
        wallArea;

    // --------------------------------------------
    // 8. HEAT TRANSFER THROUGH ROOF
    // --------------------------------------------

    const roofResistance =
        1 /
        (
            indoorHeatTransfer +
            outdoorHeatTransfer
        ) +
        roofThickness /
        roofConductivity;

    const roofUValue =
        1 / roofResistance;

    const roofHeatTransferCoefficient =
        roofUValue *
        roofArea;

    // --------------------------------------------
    // 9. HEAT TRANSFER THROUGH FLOOR
    // --------------------------------------------

    const floorResistance =
        1 /
        (
            indoorHeatTransfer +
            outdoorHeatTransfer
        ) +
        floorThickness /
        floorConductivity;

    const floorUValue =
        1 / floorResistance;

    const floorHeatTransferCoefficient =
        floorUValue *
        floorArea;

    // --------------------------------------------
    // 10. OPENING HEAT LOSS
    // --------------------------------------------

    let openingHeatTransferCoefficient = 0;

    for (const opening of openings) {

        const area =
            Number(opening.area);

        const count =
            Number(opening.count) || 1;

        let uValue =
            Number(opening.u_value);

        // If no U-value is provided,
        // use a simple default.
        if (
            !Number.isFinite(uValue) ||
            uValue <= 0
        ) {
            uValue =
                opening.opening_type ===
                "window"
                    ? 2.5
                    : 2.0;
        }

        openingHeatTransferCoefficient +=
            area *
            count *
            uValue;
    }

    // --------------------------------------------
    // 11. TOTAL HEAT TRANSFER COEFFICIENT
    // --------------------------------------------

    const totalHeatTransferCoefficient =
        wallHeatTransferCoefficient +
        roofHeatTransferCoefficient +
        floorHeatTransferCoefficient +
        openingHeatTransferCoefficient;

    // --------------------------------------------
    // 12. INITIAL INDOOR TEMPERATURE
    // --------------------------------------------

    let indoorTemperature =
        outdoorTemperature;

    // --------------------------------------------
    // 13. SIMULATION DATA
    // --------------------------------------------

    const hourlyData = [];

    let totalSolarGain = 0;

    let totalHeatLoss = 0;

    let minimumTemperature =
        indoorTemperature;

    let maximumTemperature =
        indoorTemperature;

    // --------------------------------------------
    // 14. RUN HOURLY SIMULATION
    // --------------------------------------------

    for (
        let hour = 0;
        hour <= simulationHours;
        hour++
    ) {

        // ----------------------------------------
        // Simulated daily solar cycle
        // ----------------------------------------

        const hourOfDay =
            hour % 24;

        let currentSolarRadiation =
            0;

        // Approximate daylight period
        if (
            hourOfDay >= 6 &&
            hourOfDay <= 18
        ) {

            const solarAngle =
                Math.PI *
                (
                    (hourOfDay - 6) /
                    12
                );

            currentSolarRadiation =
                solarRadiation *
                Math.sin(solarAngle);

            currentSolarRadiation =
                Math.max(
                    0,
                    currentSolarRadiation
                );
        }

        // ----------------------------------------
        // Solar heat entering shelter
        // ----------------------------------------

        const solarGain =
            currentSolarRadiation *
            floorArea *
            solarAbsorption *
            0.15;

        // ----------------------------------------
        // Temperature difference
        // ----------------------------------------

        const temperatureDifference =
            outdoorTemperature -
            indoorTemperature;

        // ----------------------------------------
        // Heat transfer through envelope
        // ----------------------------------------

        const envelopeHeatTransfer =
            totalHeatTransferCoefficient *
            temperatureDifference;

        // ----------------------------------------
        // Net heat flow
        // ----------------------------------------

        const netHeatFlow =
            envelopeHeatTransfer +
            solarGain;

        // ----------------------------------------
        // Temperature change
        // ----------------------------------------

        const temperatureChange =
            (
                netHeatFlow *
                3600
            ) /
            thermalMass;

        indoorTemperature +=
            temperatureChange;

        // ----------------------------------------
        // Limit unrealistic numerical values
        // ----------------------------------------

        if (
            indoorTemperature > 80
        ) {
            indoorTemperature = 80;
        }

        if (
            indoorTemperature < -50
        ) {
            indoorTemperature = -50;
        }

        // ----------------------------------------
        // Heat loss
        // ----------------------------------------

        const heatLoss =
            Math.max(
                0,
                -envelopeHeatTransfer
            );

        // ----------------------------------------
        // Track totals
        // ----------------------------------------

        totalSolarGain +=
            Math.max(
                0,
                solarGain
            );

        totalHeatLoss +=
            heatLoss;

        minimumTemperature =
            Math.min(
                minimumTemperature,
                indoorTemperature
            );

        maximumTemperature =
            Math.max(
                maximumTemperature,
                indoorTemperature
            );

        // ----------------------------------------
        // Thermal comfort status
        // ----------------------------------------

        let comfortStatus =
            "Comfortable";

        if (
            indoorTemperature < 18
        ) {
            comfortStatus =
                "Cold";
        } else if (
            indoorTemperature > 27
        ) {
            comfortStatus =
                "Hot";
        }

        // ----------------------------------------
        // Save hourly result
        // ----------------------------------------

        hourlyData.push({

            hour,

            outdoor_temperature:
                Number(
                    outdoorTemperature.toFixed(2)
                ),

            solar_radiation:
                Number(
                    currentSolarRadiation.toFixed(2)
                ),

            indoor_temperature:
                Number(
                    indoorTemperature.toFixed(2)
                ),

            solar_gain:
                Number(
                    solarGain.toFixed(2)
                ),

            heat_loss:
                Number(
                    heatLoss.toFixed(2)
                ),

            comfort:
                comfortStatus
        });
    }

    // --------------------------------------------
    // 15. AVERAGE TEMPERATURE
    // --------------------------------------------

    const temperatureSum =
        hourlyData.reduce(
            (
                total,
                item
            ) =>
                total +
                item.indoor_temperature,
            0
        );

    const averageIndoorTemperature =
        temperatureSum /
        hourlyData.length;

    // --------------------------------------------
    // 16. THERMAL COMFORT SCORE
    // --------------------------------------------
    //
    // Target comfort range:
    // 18°C to 27°C
    //
    // Instead of giving a design 0 whenever it
    // falls outside the comfort range, we give
    // partial credit according to how close the
    // temperature is to the comfort range.
    //
    // 18°C - 27°C = 100 points
    //
    // Outside the range, the score decreases
    // gradually based on the distance from the
    // nearest comfort boundary.
    //
    // A temperature 18°C below the lower boundary
    // or 27°C above the upper boundary receives 0.
    // --------------------------------------------

    const comfortLowerLimit =
        18;

    const comfortUpperLimit =
        27;

    const comfortTolerance =
        18;

    let totalComfortScore = 0;

    for (
        const data of hourlyData
    ) {

        const temperature =
            data.indoor_temperature;

        let hourlyComfortScore;

        if (
            temperature >= comfortLowerLimit &&
            temperature <= comfortUpperLimit
        ) {

            // Fully comfortable
            hourlyComfortScore = 100;

        } else if (
            temperature < comfortLowerLimit
        ) {

            // Below comfort range
            const distance =
                comfortLowerLimit -
                temperature;

            hourlyComfortScore =
                Math.max(
                    0,
                    100 -
                    (
                        distance /
                        comfortTolerance
                    ) *
                    100
                );

        } else {

            // Above comfort range
            const distance =
                temperature -
                comfortUpperLimit;

            hourlyComfortScore =
                Math.max(
                    0,
                    100 -
                    (
                        distance /
                        comfortTolerance
                    ) *
                    100
                );
        }

        totalComfortScore +=
            hourlyComfortScore;
    }

    const thermalComfortScore =
        totalComfortScore /
        hourlyData.length;

    // --------------------------------------------
    // 17. RETURN COMPLETE RESULT
    // --------------------------------------------

    return {

        simulation: {

            duration_hours:
                simulationHours,

            shelter_volume_m3:
                Number(
                    volume.toFixed(2)
                ),

            floor_area_m2:
                Number(
                    floorArea.toFixed(2)
                ),

            wall_area_m2:
                Number(
                    wallArea.toFixed(2)
                ),

            total_envelope_area_m2:
                Number(
                    totalEnvelopeArea.toFixed(2)
                )
        },

        summary: {

            average_indoor_temperature:
                Number(
                    averageIndoorTemperature.toFixed(2)
                ),

            minimum_indoor_temperature:
                Number(
                    minimumTemperature.toFixed(2)
                ),

            maximum_indoor_temperature:
                Number(
                    maximumTemperature.toFixed(2)
                ),

            total_solar_gain:
                Number(
                    totalSolarGain.toFixed(2)
                ),

            total_heat_loss:
                Number(
                    totalHeatLoss.toFixed(2)
                ),

            thermal_comfort_score:
                Number(
                    thermalComfortScore.toFixed(2)
                )
        },

        heat_transfer: {

            wall_u_value:
                Number(
                    wallUValue.toFixed(4)
                ),

            roof_u_value:
                Number(
                    roofUValue.toFixed(4)
                ),

            floor_u_value:
                Number(
                    floorUValue.toFixed(4)
                ),

            opening_heat_transfer:
                Number(
                    openingHeatTransferCoefficient.toFixed(4)
                ),

            total_heat_transfer_coefficient:
                Number(
                    totalHeatTransferCoefficient.toFixed(4)
                )
        },

        hourly_data:
            hourlyData
    };
}

module.exports =
    calculateThermalSimulation;