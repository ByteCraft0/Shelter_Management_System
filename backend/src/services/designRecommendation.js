// ============================================================
// CLIMATE-BASED SHELTER DESIGN RECOMMENDATION ENGINE
// ============================================================

const calculateThermalSimulation =
    require("./thermalSimulation");

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function round(value, decimals = 2) {
    return Number(Number(value).toFixed(decimals));
}

function clamp(value, min, max) {
    return Math.min(
        Math.max(value, min),
        max
    );
}

// ============================================================
// ANALYZE CLIMATE
// ============================================================

function getClimateFactors(climate) {

    const temperature =
        Number(climate.outdoor_temperature);

    const solar =
        Number(climate.solar_radiation);

    const wind =
        Number(climate.wind_speed);

    const humidity =
        Number(climate.humidity);

    return {

        temperature,

        solar,

        wind,

        humidity,

        coldLevel:
            clamp(
                (18 - temperature) / 18,
                0,
                1
            ),

        heatLevel:
            clamp(
                (temperature - 27) / 20,
                0,
                1
            ),

        windLevel:
            clamp(
                wind / 10,
                0,
                1
            ),

        solarLevel:
            clamp(
                solar / 1000,
                0,
                1
            ),

        humidityLevel:
            clamp(
                humidity / 100,
                0,
                1
            )
    };
}

// ============================================================
// SELECT MATERIALS
// ============================================================

function selectMaterials(
    materials,
    strategy,
    factors
) {

    if (
        !materials ||
        materials.length === 0
    ) {
        throw new Error(
            "No materials are available"
        );
    }

    const sortedByConductivity =
        [...materials].sort(
            (a, b) =>
                Number(a.thermal_conductivity) -
                Number(b.thermal_conductivity)
        );

    const sortedByDensity =
        [...materials].sort(
            (a, b) =>
                Number(b.density) -
                Number(a.density)
        );

    const insulationMaterial =
        sortedByConductivity[0];

    const lowConductivityMaterial =
        sortedByConductivity[
            Math.min(
                1,
                sortedByConductivity.length - 1
            )
        ];

    const thermalMassMaterial =
        sortedByDensity[0];

    const mediumMaterial =
        sortedByConductivity[
            Math.floor(
                sortedByConductivity.length / 2
            )
        ];

    // --------------------------------------------------------
    // HIGH INSULATION
    // --------------------------------------------------------

    if (strategy === "high_insulation") {

        return {

            wall:
                insulationMaterial,

            roof:
                insulationMaterial,

            floor:
                lowConductivityMaterial
        };
    }

    // --------------------------------------------------------
    // THERMAL MASS
    // --------------------------------------------------------

    if (strategy === "thermal_mass") {

        return {

            wall:
                thermalMassMaterial,

            roof:
                lowConductivityMaterial,

            floor:
                thermalMassMaterial
        };
    }

    // --------------------------------------------------------
    // SOLAR GAIN
    // --------------------------------------------------------

    if (strategy === "solar_gain") {

        if (factors.coldLevel > 0.4) {

            return {

                wall:
                    mediumMaterial,

                roof:
                    lowConductivityMaterial,

                floor:
                    thermalMassMaterial
            };
        }

        return {

            wall:
                lowConductivityMaterial,

            roof:
                mediumMaterial,

            floor:
                thermalMassMaterial
        };
    }

    // --------------------------------------------------------
    // LOW HEAT LOSS
    // --------------------------------------------------------

    if (strategy === "low_heat_loss") {

        return {

            wall:
                insulationMaterial,

            roof:
                insulationMaterial,

            floor:
                insulationMaterial
        };
    }

    // --------------------------------------------------------
    // BALANCED
    // --------------------------------------------------------

    return {

        wall:
            mediumMaterial,

        roof:
            lowConductivityMaterial,

        floor:
            thermalMassMaterial
    };
}

// ============================================================
// GENERATE DESIGN PARAMETERS
// ============================================================

function generateDesignParameters(
    strategy,
    factors
) {

    const coldPressure =
        factors.coldLevel +
        factors.windLevel * 0.5;

    let length = 6;
    let width = 4;
    let height = 3;

    let wallThickness = 0.20;
    let roofThickness = 0.15;
    let floorThickness = 0.15;

    let orientation = 0;

    // --------------------------------------------------------
    // HIGH INSULATION
    // --------------------------------------------------------

    if (
        strategy === "high_insulation"
    ) {

        wallThickness =
            round(
                0.20 +
                0.20 * coldPressure
            );

        roofThickness =
            round(
                0.15 +
                0.15 * coldPressure
            );

        floorThickness =
            round(
                0.15 +
                0.10 * coldPressure
            );

        orientation =
            factors.coldLevel > 0.5
                ? 0
                : 45;
    }

    // --------------------------------------------------------
    // THERMAL MASS
    // --------------------------------------------------------

    else if (
        strategy === "thermal_mass"
    ) {

        wallThickness =
            round(
                0.25 +
                0.15 *
                factors.coldLevel
            );

        roofThickness = 0.20;

        floorThickness = 0.20;

        orientation = 0;
    }

    // --------------------------------------------------------
    // SOLAR GAIN
    // --------------------------------------------------------

    else if (
        strategy === "solar_gain"
    ) {

        wallThickness =
            round(
                0.18 +
                0.10 *
                factors.coldLevel
            );

        roofThickness = 0.15;

        floorThickness = 0.15;

        orientation =
            factors.coldLevel > 0.5
                ? 0
                : 180;
    }

    // --------------------------------------------------------
    // LOW HEAT LOSS
    // --------------------------------------------------------

    else if (
        strategy === "low_heat_loss"
    ) {

        wallThickness =
            round(
                0.25 +
                0.20 *
                coldPressure
            );

        roofThickness =
            round(
                0.20 +
                0.15 *
                coldPressure
            );

        floorThickness =
            round(
                0.18 +
                0.12 *
                coldPressure
            );

        orientation = 0;
    }

    // --------------------------------------------------------
    // BALANCED
    // --------------------------------------------------------

    else {

        wallThickness =
            round(
                0.20 +
                0.12 *
                factors.coldLevel
            );

        roofThickness =
            round(
                0.15 +
                0.08 *
                factors.coldLevel
            );

        floorThickness =
            round(
                0.15 +
                0.05 *
                factors.coldLevel
            );

        orientation = 0;
    }

    return {

        length,

        width,

        height,

        orientation,

        wallThickness,

        roofThickness,

        floorThickness
    };
}

// ============================================================
// STRATEGY INFORMATION
// ============================================================

function getStrategyInformation(
    strategy
) {

    const information = {

        high_insulation: {

            name:
                "High Insulation",

            description:
                "Uses low-conductivity materials and increased insulation thickness to reduce heat transfer."
        },

        thermal_mass: {

            name:
                "Thermal Mass",

            description:
                "Uses high-density materials and greater wall mass to help moderate indoor temperature changes."
        },

        solar_gain: {

            name:
                "Solar Gain",

            description:
                "Uses the available solar radiation as an important passive heat source."
        },

        balanced: {

            name:
                "Balanced Design",

            description:
                "Balances insulation, thermal mass and geometry for a general-purpose passive shelter."
        },

        low_heat_loss: {

            name:
                "Low Heat Loss",

            description:
                "Prioritizes minimizing heat transfer through walls, roof and floor."
        }
    };

    return information[strategy];
}

// ============================================================
// CREATE ONE CANDIDATE
// ============================================================

function createCandidate(
    strategy,
    climate,
    materials,
    simulationHours
) {

    const factors =
        getClimateFactors(
            climate
        );

    const selectedMaterials =
        selectMaterials(
            materials,
            strategy,
            factors
        );

    const parameters =
        generateDesignParameters(
            strategy,
            factors
        );

    const design = {

        id: null,

        name:
            getStrategyInformation(
                strategy
            ).name,

        length:
            parameters.length,

        width:
            parameters.width,

        height:
            parameters.height,

        orientation:
            parameters.orientation,

        wall_thickness:
            parameters.wallThickness,

        roof_thickness:
            parameters.roofThickness,

        floor_thickness:
            parameters.floorThickness
    };

    // Recommendations do not create
    // database opening records.

    const openings = [];

    const materialsForSimulation = {

        wall:
            selectedMaterials.wall,

        roof:
            selectedMaterials.roof,

        floor:
            selectedMaterials.floor
    };

    const simulation =
        calculateThermalSimulation({

            climate,

            design,

            materials:
                materialsForSimulation,

            openings,

            simulationHours
        });

    return {

        strategy,

        name:
            getStrategyInformation(
                strategy
            ).name,

        description:
            getStrategyInformation(
                strategy
            ).description,

        climate_basis: {

            outdoor_temperature:
                Number(
                    climate.outdoor_temperature
                ),

            solar_radiation:
                Number(
                    climate.solar_radiation
                ),

            wind_speed:
                Number(
                    climate.wind_speed
                ),

            humidity:
                Number(
                    climate.humidity
                )
        },

        specifications: {

            length:
                parameters.length,

            width:
                parameters.width,

            height:
                parameters.height,

            orientation:
                parameters.orientation,

            wall_thickness:
                parameters.wallThickness,

            roof_thickness:
                parameters.roofThickness,

            floor_thickness:
                parameters.floorThickness
        },

        materials: {

            wall: {

                id:
                    selectedMaterials.wall.id,

                name:
                    selectedMaterials.wall.name,

                thermal_conductivity:
                    Number(
                        selectedMaterials.wall
                            .thermal_conductivity
                    ),

                density:
                    Number(
                        selectedMaterials.wall
                            .density
                    ),

                specific_heat:
                    Number(
                        selectedMaterials.wall
                            .specific_heat
                    )
            },

            roof: {

                id:
                    selectedMaterials.roof.id,

                name:
                    selectedMaterials.roof.name,

                thermal_conductivity:
                    Number(
                        selectedMaterials.roof
                            .thermal_conductivity
                    ),

                density:
                    Number(
                        selectedMaterials.roof
                            .density
                    ),

                specific_heat:
                    Number(
                        selectedMaterials.roof
                            .specific_heat
                    )
            },

            floor: {

                id:
                    selectedMaterials.floor.id,

                name:
                    selectedMaterials.floor.name,

                thermal_conductivity:
                    Number(
                        selectedMaterials.floor
                            .thermal_conductivity
                    ),

                density:
                    Number(
                        selectedMaterials.floor
                            .density
                    ),

                specific_heat:
                    Number(
                        selectedMaterials.floor
                            .specific_heat
                    )
            }
        },

        predicted_performance: {

            average_indoor_temperature:
                simulation.summary
                    .average_indoor_temperature,

            minimum_indoor_temperature:
                simulation.summary
                    .minimum_indoor_temperature,

            maximum_indoor_temperature:
                simulation.summary
                    .maximum_indoor_temperature,

            total_solar_gain:
                simulation.summary
                    .total_solar_gain,

            total_heat_loss:
                simulation.summary
                    .total_heat_loss,

            thermal_comfort_score:
                simulation.summary
                    .thermal_comfort_score
        },

        simulation_hours:
            simulationHours
    };
}

// ============================================================
// MAIN FUNCTION
// ============================================================

function generateDesignRecommendations({
    climate,
    materials,
    simulationHours = 24
}) {

    if (!climate) {

        throw new Error(
            "Climate data is required"
        );
    }

    if (
        !materials ||
        materials.length === 0
    ) {

        throw new Error(
            "At least one material is required"
        );
    }

    const strategies = [

        "high_insulation",

        "thermal_mass",

        "solar_gain",

        "balanced",

        "low_heat_loss"
    ];

    const recommendations =
        strategies.map(
            strategy =>
                createCandidate(
                    strategy,
                    climate,
                    materials,
                    simulationHours
                )
        );

    recommendations.sort(
        (a, b) => {

            const comfortDifference =
                b.predicted_performance
                    .thermal_comfort_score -
                a.predicted_performance
                    .thermal_comfort_score;

            if (
                Math.abs(
                    comfortDifference
                ) > 0.01
            ) {

                return comfortDifference;
            }

            return (
                a.predicted_performance
                    .total_heat_loss -
                b.predicted_performance
                    .total_heat_loss
            );
        }
    );

    recommendations.forEach(
        (recommendation, index) => {

            recommendation.rank =
                index + 1;
        }
    );

    return recommendations;
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    generateDesignRecommendations
};