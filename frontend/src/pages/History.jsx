import { useEffect, useState } from "react";
import "../App.css";

const API_BASE = "http://localhost:5000/api";

function History({ onBack }) {
    const [simulations, setSimulations] = useState([]);
    const [selectedSimulation, setSelectedSimulation] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const [error, setError] = useState("");

    // ========================================================
    // LOAD ALL SIMULATIONS
    // ========================================================

    async function loadSimulations() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE}/simulations`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load simulation history"
                );
            }

            const data = await response.json();

            setSimulations(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to load simulation history"
            );

        } finally {

            setLoading(false);
        }
    }

    // ========================================================
    // LOAD ONE SIMULATION
    // ========================================================

    async function viewDetails(id) {
        try {

            setDetailsLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE}/simulations/${id}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load simulation details"
                );
            }

            const data =
                await response.json();

            console.log(
                "Simulation details:",
                data
            );

            setSelectedSimulation(data);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to load simulation details"
            );

        } finally {

            setDetailsLoading(false);
        }
    }

    // ========================================================
    // CLOSE DETAILS
    // ========================================================

    function closeDetails() {
        setSelectedSimulation(null);
    }

    // ========================================================
    // FORMAT DATE
    // ========================================================

    function formatDate(dateValue) {

        if (!dateValue) {
            return "--";
        }

        const date =
            new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "--";
        }

        return date.toLocaleString();
    }

    // ========================================================
    // FORMAT NUMBER
    // ========================================================

    function formatNumber(value, decimals = 2) {

        if (
            value === null ||
            value === undefined ||
            value === "" ||
            Number.isNaN(Number(value))
        ) {
            return "--";
        }

        return Number(value).toFixed(decimals);
    }

    // ========================================================
    // LOAD HISTORY ON PAGE OPEN
    // ========================================================

    useEffect(() => {
        loadSimulations();
    }, []);

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <div className="page-container">

                <div className="page-header">

                    <button
                        className="secondary-button"
                        onClick={onBack}
                    >
                        ← Back
                    </button>

                    <div>
                        <h1>Simulation History</h1>

                        <p>
                            View previously completed
                            thermal simulations.
                        </p>
                    </div>

                </div>

                <div className="loading-box">
                    Loading simulation history...
                </div>

            </div>
        );
    }

    // ========================================================
    // MAIN PAGE
    // ========================================================

    return (
        <div className="page-container">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="page-header">

                <button
                    className="secondary-button"
                    onClick={onBack}
                >
                    ← Back
                </button>

                <div>

                    <h1>
                        Simulation History
                    </h1>

                    <p>
                        Review previously completed
                        thermal simulations and their
                        results.
                    </p>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* ==================================================
                SUMMARY CARD
            ================================================== */}

            <div className="history-summary-grid">

                <div className="history-summary-card">

                    <div className="history-summary-label">
                        Total Simulations
                    </div>

                    <div className="history-summary-value">
                        {simulations.length}
                    </div>

                </div>

                <div className="history-summary-card">

                    <div className="history-summary-label">
                        Latest Simulation
                    </div>

                    <div className="history-summary-value">
                        {simulations.length > 0
                            ? `#${simulations[0].id}`
                            : "--"}
                    </div>

                </div>

            </div>


            {/* ==================================================
                SIMULATION TABLE
            ================================================== */}

            <div className="history-card">

                <div className="history-card-header">

                    <div>

                        <h2>
                            Saved Simulations
                        </h2>

                        <p>
                            Select a simulation to
                            view complete details.
                        </p>

                    </div>

                    <button
                        className="secondary-button"
                        onClick={loadSimulations}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {simulations.length === 0 ? (

                    <div className="empty-history">

                        <h3>
                            No simulations found
                        </h3>

                        <p>
                            Run a thermal simulation
                            first to see it here.
                        </p>

                    </div>

                ) : (

                    <div className="history-table-wrapper">

                        <table className="history-table">

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Design
                                    </th>

                                    <th>
                                        Climate
                                    </th>

                                    <th>
                                        Duration
                                    </th>

                                    <th>
                                        Avg Temp
                                    </th>

                                    <th>
                                        Min Temp
                                    </th>

                                    <th>
                                        Max Temp
                                    </th>

                                    <th>
                                        Solar Gain
                                    </th>

                                    <th>
                                        Heat Loss
                                    </th>

                                    <th>
                                        Comfort
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {simulations.map(
                                    (simulation) => (

                                        <tr
                                            key={
                                                simulation.id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    #{simulation.id}
                                                </strong>
                                            </td>


                                            <td>
                                                {simulation.shelter_design_name ||
                                                    `Design #${simulation.shelter_design_id}`}
                                            </td>


                                            <td>
                                                {simulation.climate_name ||
                                                    "--"}
                                            </td>


                                            <td>
                                                {simulation.simulation_hours ||
                                                    "--"}{" "}
                                                h
                                            </td>


                                            <td>
                                                {formatNumber(
                                                    simulation.average_indoor_temperature
                                                )}{" "}
                                                °C
                                            </td>


                                            <td>
                                                {formatNumber(
                                                    simulation.minimum_indoor_temperature
                                                )}{" "}
                                                °C
                                            </td>


                                            <td>
                                                {formatNumber(
                                                    simulation.maximum_indoor_temperature
                                                )}{" "}
                                                °C
                                            </td>


                                            <td>
                                                {formatNumber(
                                                    simulation.total_solar_gain
                                                )}
                                            </td>


                                            <td>
                                                {formatNumber(
                                                    simulation.total_heat_loss
                                                )}
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        Number(
                                                            simulation.thermal_comfort_score
                                                        ) >= 80
                                                            ? "comfort-good"
                                                            : Number(
                                                                  simulation.thermal_comfort_score
                                                              ) >= 50
                                                            ? "comfort-medium"
                                                            : "comfort-low"
                                                    }
                                                >
                                                    {formatNumber(
                                                        simulation.thermal_comfort_score
                                                    )}
                                                </span>

                                            </td>


                                            <td>

                                                <button
                                                    className="view-details-button"
                                                    onClick={() =>
                                                        viewDetails(
                                                            simulation.id
                                                        )
                                                    }
                                                >
                                                    View Details
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ==================================================
                DETAILS
            ================================================== */}

            {selectedSimulation && (

                <div className="history-details-card">

                    <div className="history-details-header">

                        <div>

                            <h2>
                                SIMULATION #
                                {
                                    selectedSimulation.simulation_id
                                }
                            </h2>

                            <p>
                                Completed on{" "}
                                {formatDate(
                                    selectedSimulation.created_at
                                )}
                            </p>

                        </div>


                        <button
                            className="close-details-button"
                            onClick={closeDetails}
                        >
                            ✕ Close
                        </button>

                    </div>


                    {/* ==================================================
                        SHELTER + CLIMATE
                    ================================================== */}

                    <div className="history-detail-grid">


                        {/* SHELTER DESIGN */}

                        <div className="history-detail-section">

                            <h3>
                                Shelter Design
                            </h3>

                            <div className="detail-list">

                                <div>
                                    <span>
                                        Name
                                    </span>

                                    <strong>
                                        {
                                            selectedSimulation
                                                .shelter_design
                                                ?.name ||
                                            "--"
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Dimensions
                                    </span>

                                    <strong>

                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .shelter_design
                                                    ?.length
                                            )
                                        }{" "}
                                        ×{" "}

                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .shelter_design
                                                    ?.width
                                            )
                                        }{" "}
                                        ×{" "}

                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .shelter_design
                                                    ?.height
                                            )
                                        }{" "}
                                        m

                                    </strong>

                                </div>


                                <div>
                                    <span>
                                        Orientation
                                    </span>

                                    <strong>
                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .shelter_design
                                                    ?.orientation
                                            )
                                        }°
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Wall Thickness
                                    </span>

                                    <strong>
                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .shelter_design
                                                    ?.wall_thickness,
                                                3
                                            )
                                        }{" "}
                                        m
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Roof Thickness
                                    </span>

                                    <strong>
                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .shelter_design
                                                    ?.roof_thickness,
                                                3
                                            )
                                        }{" "}
                                        m
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Floor Thickness
                                    </span>

                                    <strong>
                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .shelter_design
                                                    ?.floor_thickness,
                                                3
                                            )
                                        }{" "}
                                        m
                                    </strong>
                                </div>

                            </div>

                        </div>


                        {/* CLIMATE */}

                        <div className="history-detail-section">

                            <h3>
                                Climate
                            </h3>

                            <div className="detail-list">

                                <div>
                                    <span>
                                        Climate Profile
                                    </span>

                                    <strong>
                                        {
                                            selectedSimulation
                                                .climate
                                                ?.name ||
                                            "--"
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Location
                                    </span>

                                    <strong>
                                        {
                                            selectedSimulation
                                                .climate
                                                ?.location ||
                                            "--"
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Outdoor Temperature
                                    </span>

                                    <strong>
                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .climate
                                                    ?.outdoor_temperature
                                            )
                                        }{" "}
                                        °C
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Solar Radiation
                                    </span>

                                    <strong>
                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .climate
                                                    ?.solar_radiation
                                            )
                                        }{" "}
                                        W/m²
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Wind Speed
                                    </span>

                                    <strong>
                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .climate
                                                    ?.wind_speed
                                            )
                                        }{" "}
                                        m/s
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Humidity
                                    </span>

                                    <strong>
                                        {
                                            formatNumber(
                                                selectedSimulation
                                                    .climate
                                                    ?.humidity
                                            )
                                        }%
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        SIMULATION INFORMATION
                    ================================================== */}

                    <div className="history-detail-section full-width">

                        <h3>
                            Simulation
                        </h3>

                        <div className="detail-list">

                            <div>
                                <span>
                                    Simulation Duration
                                </span>

                                <strong>
                                    {
                                        selectedSimulation
                                            .simulation
                                            ?.duration_hours ||
                                        "--"
                                    }{" "}
                                    hours
                                </strong>
                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        RESULT METRICS
                    ================================================== */}

                    <div className="history-result-metrics">

                        <div className="history-result-card">

                            <span>
                                Average Indoor Temperature
                            </span>

                            <strong>
                                {
                                    formatNumber(
                                        selectedSimulation
                                            .summary
                                            ?.average_indoor_temperature
                                    )
                                }
                                °C
                            </strong>

                        </div>


                        <div className="history-result-card">

                            <span>
                                Minimum Temperature
                            </span>

                            <strong>
                                {
                                    formatNumber(
                                        selectedSimulation
                                            .summary
                                            ?.minimum_indoor_temperature
                                    )
                                }
                                °C
                            </strong>

                        </div>


                        <div className="history-result-card">

                            <span>
                                Maximum Temperature
                            </span>

                            <strong>
                                {
                                    formatNumber(
                                        selectedSimulation
                                            .summary
                                            ?.maximum_indoor_temperature
                                    )
                                }
                                °C
                            </strong>

                        </div>


                        <div className="history-result-card">

                            <span>
                                Solar Gain
                            </span>

                            <strong>
                                {
                                    formatNumber(
                                        selectedSimulation
                                            .summary
                                            ?.total_solar_gain
                                    )
                                }
                            </strong>

                        </div>


                        <div className="history-result-card">

                            <span>
                                Total Heat Loss
                            </span>

                            <strong>
                                {
                                    formatNumber(
                                        selectedSimulation
                                            .summary
                                            ?.total_heat_loss
                                    )
                                }
                            </strong>

                        </div>


                        <div className="history-result-card">

                            <span>
                                Thermal Comfort Score
                            </span>

                            <strong>
                                {
                                    formatNumber(
                                        selectedSimulation
                                            .summary
                                            ?.thermal_comfort_score
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    {/* ==================================================
                        OPENINGS
                    ================================================== */}

                    <div className="history-detail-section full-width">

                        <h3>
                            Openings
                        </h3>


                        {selectedSimulation.openings?.length > 0 ? (

                            <div className="history-table-wrapper">

                                <table className="history-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Type
                                            </th>

                                            <th>
                                                Area
                                            </th>

                                            <th>
                                                Count
                                            </th>

                                            <th>
                                                Orientation
                                            </th>

                                            <th>
                                                U-Value
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {selectedSimulation.openings.map(
                                            (opening) => (

                                                <tr
                                                    key={
                                                        opening.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            opening.opening_type
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            formatNumber(
                                                                opening.area
                                                            )
                                                        }{" "}
                                                        m²
                                                    </td>

                                                    <td>
                                                        {
                                                            opening.count
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            formatNumber(
                                                                opening.orientation
                                                            )
                                                        }°
                                                    </td>

                                                    <td>
                                                        {
                                                            formatNumber(
                                                                opening.u_value,
                                                                3
                                                            )
                                                        }
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        ) : (

                            <p className="muted-text">
                                No openings were added to
                                this shelter design.
                            </p>

                        )}

                    </div>


                </div>

            )}


            {/* ==================================================
                DETAILS LOADING
            ================================================== */}

            {detailsLoading && (

                <div className="loading-box">

                    Loading simulation details...

                </div>

            )}

        </div>
    );
}

export default History;