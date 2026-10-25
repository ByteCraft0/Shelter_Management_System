import { useEffect, useState } from "react";

import "../App.css";

const API_BASE = "http://localhost:5000/api";

/* ============================================================
   THERMAL LINE CHART
============================================================ */

function ThermalLineChart({
    title,
    data,
    firstKey,
    secondKey,
    firstLabel,
    secondLabel,
    firstUnit = "",
    secondUnit = ""
}) {
    if (!data || data.length === 0) {
        return null;
    }

    const width = 900;
    const height = 330;
    const paddingLeft = 60;
    const paddingRight = 25;
    const paddingTop = 30;
    const paddingBottom = 45;

    const plotWidth =
        width - paddingLeft - paddingRight;

    const plotHeight =
        height - paddingTop - paddingBottom;

    const values = data.flatMap((row) => {
        const first = Number(row[firstKey]);
        const second = secondKey
            ? Number(row[secondKey])
            : null;

        return [
            Number.isFinite(first) ? first : null,
            Number.isFinite(second) ? second : null
        ].filter((value) => value !== null);
    });

    if (values.length === 0) {
        return null;
    }

    let minValue = Math.min(...values);
    let maxValue = Math.max(...values);

    if (minValue === maxValue) {
        minValue -= 1;
        maxValue += 1;
    }

    const range = maxValue - minValue;

    minValue -= range * 0.1;
    maxValue += range * 0.1;

    function getX(index) {
        if (data.length === 1) {
            return paddingLeft + plotWidth / 2;
        }

        return (
            paddingLeft +
            (index / (data.length - 1)) * plotWidth
        );
    }

    function getY(value) {
        return (
            paddingTop +
            ((maxValue - value) /
                (maxValue - minValue)) *
                plotHeight
        );
    }

    function createPath(key) {
        return data
            .map((row, index) => {
                const value = Number(row[key]);

                if (!Number.isFinite(value)) {
                    return null;
                }

                const x = getX(index);
                const y = getY(value);

                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .filter(Boolean)
            .join(" ");
    }

    const firstPath = createPath(firstKey);

    const secondPath = secondKey
        ? createPath(secondKey)
        : null;

    const gridLines = 5;

    return (
        <div className="chart-card">

            <div className="chart-header">
                <div>

                    <h3>{title}</h3>

                    <div className="chart-legend">

                        <span className="legend-item">
                            <span className="legend-line first"></span>
                            {firstLabel}
                        </span>

                        {secondKey && (
                            <span className="legend-item">
                                <span className="legend-line second"></span>
                                {secondLabel}
                            </span>
                        )}

                    </div>

                </div>
            </div>

            <div className="chart-wrapper">

                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="thermal-chart"
                    role="img"
                    aria-label={title}
                >

                    {Array.from(
                        { length: gridLines },
                        (_, index) => {

                            const y =
                                paddingTop +
                                (index /
                                    (gridLines - 1)) *
                                    plotHeight;

                            const value =
                                maxValue -
                                (index /
                                    (gridLines - 1)) *
                                    (maxValue - minValue);

                            return (
                                <g key={index}>

                                    <line
                                        x1={paddingLeft}
                                        y1={y}
                                        x2={
                                            width -
                                            paddingRight
                                        }
                                        y2={y}
                                        className="grid-line"
                                    />

                                    <text
                                        x={
                                            paddingLeft -
                                            10
                                        }
                                        y={y + 4}
                                        textAnchor="end"
                                        className="axis-label"
                                    >
                                        {value.toFixed(1)}
                                    </text>

                                </g>
                            );
                        }
                    )}

                    <line
                        x1={paddingLeft}
                        y1={paddingTop}
                        x2={paddingLeft}
                        y2={
                            height -
                            paddingBottom
                        }
                        className="axis-line"
                    />

                    <line
                        x1={paddingLeft}
                        y1={
                            height -
                            paddingBottom
                        }
                        x2={
                            width -
                            paddingRight
                        }
                        y2={
                            height -
                            paddingBottom
                        }
                        className="axis-line"
                    />

                    {data.map((row, index) => {

                        const showLabel =
                            index === 0 ||
                            index ===
                                data.length - 1 ||
                            index %
                                Math.max(
                                    1,
                                    Math.floor(
                                        data.length / 6
                                    )
                                ) === 0;

                        if (!showLabel) {
                            return null;
                        }

                        return (
                            <text
                                key={`x-${index}`}
                                x={getX(index)}
                                y={height - 18}
                                textAnchor="middle"
                                className="axis-label"
                            >
                                {row.hour}
                            </text>
                        );
                    })}

                    <path
                        d={firstPath}
                        className="chart-line first-line"
                        fill="none"
                    />

                    {secondPath && (
                        <path
                            d={secondPath}
                            className="chart-line second-line"
                            fill="none"
                        />
                    )}

                    {data.map((row, index) => {

                        const value =
                            Number(row[firstKey]);

                        if (!Number.isFinite(value)) {
                            return null;
                        }

                        return (
                            <circle
                                key={`first-${index}`}
                                cx={getX(index)}
                                cy={getY(value)}
                                r="2.5"
                                className="chart-point first-point"
                            />
                        );
                    })}

                    {secondKey &&
                        data.map((row, index) => {

                            const value =
                                Number(row[secondKey]);

                            if (
                                !Number.isFinite(value)
                            ) {
                                return null;
                            }

                            return (
                                <circle
                                    key={`second-${index}`}
                                    cx={getX(index)}
                                    cy={getY(value)}
                                    r="2.5"
                                    className="chart-point second-point"
                                />
                            );
                        })}

                </svg>

            </div>

            <div className="chart-unit">
                Values shown in{" "}
                {firstUnit ||
                    secondUnit ||
                    "simulation units"}
                .
            </div>

        </div>
    );
}

/* ============================================================
   THERMAL COMFORT CHART
============================================================ */

function ThermalComfortChart({ data }) {

    if (!data || data.length === 0) {
        return null;
    }

    const width = 900;
    const height = 330;
    const paddingLeft = 60;
    const paddingRight = 25;
    const paddingTop = 30;
    const paddingBottom = 45;

    const plotWidth =
        width - paddingLeft - paddingRight;

    const plotHeight =
        height - paddingTop - paddingBottom;

    const indoorValues = data
        .map((row) =>
            Number(row.indoor_temperature)
        )
        .filter(Number.isFinite);

    if (indoorValues.length === 0) {
        return null;
    }

    let minValue = Math.min(
        ...indoorValues,
        18
    );

    let maxValue = Math.max(
        ...indoorValues,
        27
    );

    const range = Math.max(
        maxValue - minValue,
        10
    );

    minValue -= range * 0.1;
    maxValue += range * 0.1;

    function getX(index) {
        if (data.length === 1) {
            return paddingLeft + plotWidth / 2;
        }

        return (
            paddingLeft +
            (index / (data.length - 1)) *
                plotWidth
        );
    }

    function getY(value) {
        return (
            paddingTop +
            ((maxValue - value) /
                (maxValue - minValue)) *
                plotHeight
        );
    }

    const indoorPath = data
        .map((row, index) => {

            const value =
                Number(
                    row.indoor_temperature
                );

            if (!Number.isFinite(value)) {
                return null;
            }

            return `${
                index === 0 ? "M" : "L"
            } ${getX(index)} ${getY(value)}`;
        })
        .filter(Boolean)
        .join(" ");

    const comfortTop = getY(27);
    const comfortBottom = getY(18);

    return (
        <div className="chart-card">

            <div className="chart-header">

                <div>

                    <h3>
                        Thermal Comfort Range
                    </h3>

                    <div className="chart-legend">

                        <span className="legend-item">
                            <span className="legend-line comfort"></span>
                            Indoor Temperature
                        </span>

                        <span className="comfort-label">
                            Target range: 18°C – 27°C
                        </span>

                    </div>

                </div>

            </div>

            <div className="chart-wrapper">

                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="thermal-chart"
                    role="img"
                    aria-label="Thermal comfort chart"
                >

                    <rect
                        x={paddingLeft}
                        y={comfortTop}
                        width={plotWidth}
                        height={
                            comfortBottom -
                            comfortTop
                        }
                        className="comfort-zone"
                    />

                    <line
                        x1={paddingLeft}
                        y1={comfortTop}
                        x2={
                            width -
                            paddingRight
                        }
                        y2={comfortTop}
                        className="comfort-boundary"
                    />

                    <line
                        x1={paddingLeft}
                        y1={comfortBottom}
                        x2={
                            width -
                            paddingRight
                        }
                        y2={comfortBottom}
                        className="comfort-boundary"
                    />

                    <text
                        x={paddingLeft - 10}
                        y={comfortTop + 4}
                        textAnchor="end"
                        className="axis-label"
                    >
                        27
                    </text>

                    <text
                        x={paddingLeft - 10}
                        y={comfortBottom + 4}
                        textAnchor="end"
                        className="axis-label"
                    >
                        18
                    </text>

                    <line
                        x1={paddingLeft}
                        y1={paddingTop}
                        x2={paddingLeft}
                        y2={
                            height -
                            paddingBottom
                        }
                        className="axis-line"
                    />

                    <line
                        x1={paddingLeft}
                        y1={
                            height -
                            paddingBottom
                        }
                        x2={
                            width -
                            paddingRight
                        }
                        y2={
                            height -
                            paddingBottom
                        }
                        className="axis-line"
                    />

                    {data.map((row, index) => {

                        const showLabel =
                            index === 0 ||
                            index ===
                                data.length - 1 ||
                            index %
                                Math.max(
                                    1,
                                    Math.floor(
                                        data.length / 6
                                    )
                                ) === 0;

                        if (!showLabel) {
                            return null;
                        }

                        return (
                            <text
                                key={index}
                                x={getX(index)}
                                y={height - 18}
                                textAnchor="middle"
                                className="axis-label"
                            >
                                {row.hour}
                            </text>
                        );
                    })}

                    <path
                        d={indoorPath}
                        className="chart-line comfort-line"
                        fill="none"
                    />

                    {data.map((row, index) => {

                        const value =
                            Number(
                                row.indoor_temperature
                            );

                        if (!Number.isFinite(value)) {
                            return null;
                        }

                        return (
                            <circle
                                key={index}
                                cx={getX(index)}
                                cy={getY(value)}
                                r="2.5"
                                className="chart-point comfort-point"
                            />
                        );
                    })}

                </svg>

            </div>

            <div className="comfort-explanation">
                The highlighted band represents the
                prototype's current target comfort range
                of 18°C–27°C.
            </div>

        </div>
    );
}

/* ============================================================
   MAIN SIMULATION PAGE
============================================================ */

function App() {

    const [climateProfiles, setClimateProfiles] =
        useState([]);

    const [materials, setMaterials] =
        useState([]);

    const [designs, setDesigns] =
        useState([]);

    const [climateMode, setClimateMode] =
        useState("preset");

    const [selectedClimateId, setSelectedClimateId] =
        useState("");

    const [selectedDesignId, setSelectedDesignId] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [savingClimate, setSavingClimate] =
        useState(false);

    const [savingDesign, setSavingDesign] =
        useState(false);

    const [savingOpening, setSavingOpening] =
        useState(false);

    const [runningSimulation, setRunningSimulation] =
        useState(false);

    /* ========================================================
       RECOMMENDATION STATE
    ======================================================== */

    const [recommendations, setRecommendations] =
        useState([]);

    const [loadingRecommendations, setLoadingRecommendations] =
        useState(false);

    const [showRecommendations, setShowRecommendations] =
        useState(false);

    const [selectedRecommendation, setSelectedRecommendation] =
        useState(null);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [customClimate, setCustomClimate] =
        useState({
            name: "",
            location: "",
            outdoor_temperature: 5,
            solar_radiation: 650,
            wind_speed: 4,
            humidity: 35
        });

    const [design, setDesign] =
        useState({
            name: "Ladakh Passive Shelter",
            length: 10,
            width: 6,
            height: 3,
            orientation: 0,
            wall_thickness: 0.3,
            roof_thickness: 0.2,
            floor_thickness: 0.15,
            wall_material_id: "",
            roof_material_id: "",
            floor_material_id: ""
        });

    const [simulationHours, setSimulationHours] =
        useState(24);

    const [openingData, setOpeningData] =
        useState({
            opening_type: "window",
            area: 1.5,
            count: 2,
            orientation: 0,
            u_value: 2.5
        });

    const [openings, setOpenings] =
        useState([]);

    const [simulationResult, setSimulationResult] =
        useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    /* ========================================================
       LOAD INITIAL DATA
    ======================================================== */

    async function loadInitialData() {

        try {

            setLoading(true);
            setError("");

            const [
                climateResponse,
                materialResponse,
                designResponse
            ] = await Promise.all([
                fetch(`${API_BASE}/climate`),
                fetch(`${API_BASE}/materials`),
                fetch(`${API_BASE}/designs`)
            ]);

            if (!climateResponse.ok) {
                throw new Error(
                    "Failed to load climate profiles"
                );
            }

            if (!materialResponse.ok) {
                throw new Error(
                    "Failed to load materials"
                );
            }

            if (!designResponse.ok) {
                throw new Error(
                    "Failed to load shelter designs"
                );
            }

            const climateData =
                await climateResponse.json();

            const materialData =
                await materialResponse.json();

            const designData =
                await designResponse.json();

            setClimateProfiles(climateData);
            setMaterials(materialData);
            setDesigns(designData);

            if (climateData.length > 0) {

                setSelectedClimateId(
                    String(climateData[0].id)
                );
            }

            if (materialData.length > 0) {

                setDesign((previous) => ({
                    ...previous,

                    wall_material_id:
                        String(
                            materialData[1]?.id ||
                            materialData[0].id
                        ),

                    roof_material_id:
                        String(
                            materialData[3]?.id ||
                            materialData[0].id
                        ),

                    floor_material_id:
                        String(
                            materialData[1]?.id ||
                            materialData[0].id
                        )
                }));
            }

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);
        }
    }

    /* ========================================================
       CLIMATE
    ======================================================== */

    function getSelectedClimate() {

        if (climateMode === "custom") {
            return customClimate;
        }

        return climateProfiles.find(
            (profile) =>
                String(profile.id) ===
                String(selectedClimateId)
        );
    }

    function handleCustomClimateChange(event) {

        const { name, value } =
            event.target;

        setCustomClimate((previous) => ({
            ...previous,
            [name]: value
        }));

        setShowRecommendations(false);
        setRecommendations([]);
        setSelectedRecommendation(null);
    }

    function handleDesignChange(event) {

        const { name, value } =
            event.target;

        setDesign((previous) => ({
            ...previous,
            [name]: value
        }));

        setSimulationResult(null);
    }

    function handleOpeningChange(event) {

        const { name, value } =
            event.target;

        setOpeningData((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function selectClimateMode(mode) {

        setClimateMode(mode);
        setMessage("");
        setError("");
        setRecommendations([]);
        setShowRecommendations(false);
        setSelectedRecommendation(null);

        if (
            mode === "preset" &&
            climateProfiles.length > 0
        ) {

            setSelectedClimateId(
                String(climateProfiles[0].id)
            );
        }
    }

    /* ========================================================
       OPTIONAL — GENERATE 5 DESIGN RECOMMENDATIONS
    ======================================================== */

    async function suggestDesigns() {

        try {

            setLoadingRecommendations(true);
            setMessage("");
            setError("");

            const climate =
                getSelectedClimate();

            if (!climate) {
                throw new Error(
                    "Please select or enter a climate profile first."
                );
            }

            const payload = {
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
                    ),

                simulation_hours:
                    Number(simulationHours)
            };

            if (
                !Number.isFinite(
                    payload.outdoor_temperature
                ) ||
                !Number.isFinite(
                    payload.solar_radiation
                ) ||
                !Number.isFinite(
                    payload.wind_speed
                ) ||
                !Number.isFinite(
                    payload.humidity
                )
            ) {

                throw new Error(
                    "Please enter valid climate values before generating recommendations."
                );
            }

            const response =
                await fetch(
                    `${API_BASE}/recommendations`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(payload)
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to generate shelter design recommendations."
                );
            }

            const generated =
                Array.isArray(
                    data.recommendations
                )
                    ? data.recommendations
                    : [];

            if (generated.length === 0) {

                throw new Error(
                    "The system did not return any design recommendations."
                );
            }

            setRecommendations(
                generated
            );

            setShowRecommendations(true);
            setSelectedRecommendation(null);

            setMessage(
                `${generated.length} climate-based shelter designs generated successfully.`
            );

        } catch (err) {

            setError(err.message);
            setRecommendations([]);
            setShowRecommendations(false);

        } finally {

            setLoadingRecommendations(false);
        }
    }

    /* ========================================================
       MATERIAL ID HELPER
    ======================================================== */

    function resolveMaterialId(
        materialValue,
        fallback = ""
    ) {

        if (
            materialValue === null ||
            materialValue === undefined
        ) {
            return fallback;
        }

        if (
            typeof materialValue === "object"
        ) {

            if (
                materialValue.id !==
                undefined &&
                materialValue.id !== null
            ) {

                return String(
                    materialValue.id
                );
            }

            if (materialValue.name) {

                const found =
                    materials.find(
                        (material) =>
                            String(
                                material.name
                            ).toLowerCase() ===
                            String(
                                materialValue.name
                            ).toLowerCase()
                    );

                if (found) {
                    return String(found.id);
                }
            }
        }

        const numericValue =
            Number(materialValue);

        if (
            Number.isFinite(
                numericValue
            ) &&
            numericValue > 0
        ) {

            const found =
                materials.find(
                    (material) =>
                        Number(material.id) ===
                        numericValue
                );

            if (found) {
                return String(
                    found.id
                );
            }
        }

        const found =
            materials.find(
                (material) =>
                    String(
                        material.name
                    ).toLowerCase() ===
                    String(
                        materialValue
                    ).toLowerCase()
            );

        if (found) {
            return String(found.id);
        }

        return fallback;
    }

    /* ========================================================
       RECOMMENDATION HELPERS
    ======================================================== */

    function getRecommendationDesign(
        recommendation
    ) {

        return (
            recommendation.design ||
            recommendation.shelter_design ||
            recommendation.configuration ||
            recommendation
        );
    }

    function getRecommendationPerformance(
        recommendation
    ) {

        return (
            recommendation.predicted_performance ||
            recommendation.performance ||
            recommendation.simulation?.summary ||
            recommendation.summary ||
            {}
        );
    }

    function getRecommendationMaterials(
        recommendation
    ) {

        return (
            recommendation.materials ||
            {}
        );
    }

    function getRecommendationOpenings(
        recommendation
    ) {

        return Array.isArray(
            recommendation.openings
        )
            ? recommendation.openings
            : [];
    }

    /* ========================================================
       USE RECOMMENDED DESIGN
    ======================================================== */

    function useRecommendedDesign(
        recommendation
    ) {

        if (!recommendation) {
            return;
        }

        const recommendedDesign =
            getRecommendationDesign(
                recommendation
            );

        const recommendedMaterials =
            getRecommendationMaterials(
                recommendation
            );

        const wallMaterialId =
            resolveMaterialId(
                recommendedDesign.wall_material_id ??
                recommendedMaterials.wall ??
                recommendedDesign.wall_material ??
                "",
                design.wall_material_id
            );

        const roofMaterialId =
            resolveMaterialId(
                recommendedDesign.roof_material_id ??
                recommendedMaterials.roof ??
                recommendedDesign.roof_material ??
                "",
                design.roof_material_id
            );

        const floorMaterialId =
            resolveMaterialId(
                recommendedDesign.floor_material_id ??
                recommendedMaterials.floor ??
                recommendedDesign.floor_material ??
                "",
                design.floor_material_id
            );

        setDesign((previous) => ({
            ...previous,

            name:
                recommendedDesign.name ||
                recommendation.name ||
                "Recommended Shelter",

            length:
                recommendedDesign.length ??
                previous.length,

            width:
                recommendedDesign.width ??
                previous.width,

            height:
                recommendedDesign.height ??
                previous.height,

            orientation:
                recommendedDesign.orientation ??
                previous.orientation,

            wall_thickness:
                recommendedDesign.wall_thickness ??
                previous.wall_thickness,

            roof_thickness:
                recommendedDesign.roof_thickness ??
                previous.roof_thickness,

            floor_thickness:
                recommendedDesign.floor_thickness ??
                previous.floor_thickness,

            wall_material_id:
                wallMaterialId,

            roof_material_id:
                roofMaterialId,

            floor_material_id:
                floorMaterialId
        }));

        const recommendedOpenings =
            getRecommendationOpenings(
                recommendation
            );

        if (
            recommendedOpenings.length >
            0
        ) {

            const firstOpening =
                recommendedOpenings[0];

            setOpeningData({
                opening_type:
                    firstOpening.opening_type ||
                    "window",

                area:
                    firstOpening.area ??
                    1.5,

                count:
                    firstOpening.count ??
                    1,

                orientation:
                    firstOpening.orientation ??
                    0,

                u_value:
                    firstOpening.u_value ??
                    2.5
            });

        } else {

            setOpeningData({
                opening_type: "window",
                area: 1.5,
                count: 2,
                orientation: 0,
                u_value: 2.5
            });
        }

        /*
         * The recommendation is not saved yet.
         * Therefore we clear the currently selected
         * database design so that the user must
         * explicitly save the suggested design.
         */

        setSelectedDesignId("");
        setOpenings([]);
        setSimulationResult(null);

        setSelectedRecommendation(
            recommendation
        );

        setMessage(
            `"${recommendation.name || "Recommended design"}" has been loaded into the design form. Review the values and save the shelter design when ready.`
        );

        window.scrollTo({
            top:
                document.body.scrollHeight *
                0.25,
            behavior: "smooth"
        });
    }

    /* ========================================================
       SAVE CUSTOM CLIMATE
    ======================================================== */

    async function saveCustomClimate() {

        try {

            setSavingClimate(true);
            setMessage("");
            setError("");

            if (!customClimate.name.trim()) {

                throw new Error(
                    "Please enter a climate profile name."
                );
            }

            if (
                !customClimate.location.trim()
            ) {

                throw new Error(
                    "Please enter the location."
                );
            }

            const payload = {

                name:
                    customClimate.name.trim(),

                location:
                    customClimate.location.trim(),

                outdoor_temperature:
                    Number(
                        customClimate.outdoor_temperature
                    ),

                solar_radiation:
                    Number(
                        customClimate.solar_radiation
                    ),

                wind_speed:
                    Number(
                        customClimate.wind_speed
                    ),

                humidity:
                    Number(
                        customClimate.humidity
                    )
            };

            if (
                !Number.isFinite(
                    payload.outdoor_temperature
                ) ||
                !Number.isFinite(
                    payload.solar_radiation
                ) ||
                !Number.isFinite(
                    payload.wind_speed
                ) ||
                !Number.isFinite(
                    payload.humidity
                )
            ) {

                throw new Error(
                    "Please enter valid numerical climate values."
                );
            }

            if (
                payload.humidity < 0 ||
                payload.humidity > 100
            ) {

                throw new Error(
                    "Humidity must be between 0 and 100%."
                );
            }

            if (
                payload.solar_radiation < 0
            ) {

                throw new Error(
                    "Solar radiation cannot be negative."
                );
            }

            if (payload.wind_speed < 0) {

                throw new Error(
                    "Wind speed cannot be negative."
                );
            }

            const response =
                await fetch(
                    `${API_BASE}/climate`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to save custom climate."
                );
            }

            const newClimate =
                data.climate ||
                data;

            setClimateProfiles(
                (previous) => [
                    ...previous,
                    newClimate
                ]
            );

            setSelectedClimateId(
                String(newClimate.id)
            );

            setClimateMode("preset");

            setRecommendations([]);
            setShowRecommendations(false);

            setMessage(
                `Custom climate "${payload.name}" saved successfully.`
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setSavingClimate(false);
        }
    }

    /* ========================================================
       SAVE DESIGN
    ======================================================== */

    async function saveDesign() {

        try {

            setSavingDesign(true);
            setMessage("");
            setError("");
            setSimulationResult(null);

            const climate =
                getSelectedClimate();

            if (!climate) {

                throw new Error(
                    "Please select or create a climate profile first."
                );
            }

            if (!design.name.trim()) {

                throw new Error(
                    "Please enter a shelter design name."
                );
            }

            if (!design.wall_material_id) {

                throw new Error(
                    "Please select a wall material."
                );
            }

            if (!design.roof_material_id) {

                throw new Error(
                    "Please select a roof material."
                );
            }

            if (!design.floor_material_id) {

                throw new Error(
                    "Please select a floor material."
                );
            }

            const payload = {

                name:
                    design.name.trim(),

                climate_id:
                    Number(climate.id),

                length:
                    Number(design.length),

                width:
                    Number(design.width),

                height:
                    Number(design.height),

                orientation:
                    Number(design.orientation),

                wall_thickness:
                    Number(
                        design.wall_thickness
                    ),

                roof_thickness:
                    Number(
                        design.roof_thickness
                    ),

                floor_thickness:
                    Number(
                        design.floor_thickness
                    ),

                wall_material_id:
                    Number(
                        design.wall_material_id
                    ),

                roof_material_id:
                    Number(
                        design.roof_material_id
                    ),

                floor_material_id:
                    Number(
                        design.floor_material_id
                    )
            };

            const response =
                await fetch(
                    `${API_BASE}/designs`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to save shelter design."
                );
            }

            const newDesign =
                data.design ||
                data;

            setDesigns(
                (previous) => [
                    ...previous,
                    newDesign
                ]
            );

            setSelectedDesignId(
                String(newDesign.id)
            );

            setMessage(
                `Shelter design "${payload.name}" saved successfully.`
            );

            await loadOpenings(
                newDesign.id
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setSavingDesign(false);
        }
    }

    /* ========================================================
       OPENINGS
    ======================================================== */

    async function loadOpenings(
        designId
    ) {

        try {

            const response =
                await fetch(
                    `${API_BASE}/openings/design/${designId}`
                );

            if (!response.ok) {

                throw new Error(
                    "Failed to load openings."
                );
            }

            const data =
                await response.json();

            setOpenings(data);

        } catch (err) {

            setError(err.message);
        }
    }

    async function saveOpening() {

        try {

            setSavingOpening(true);
            setMessage("");
            setError("");

            if (!selectedDesignId) {

                throw new Error(
                    "Please save the shelter design before adding openings."
                );
            }

            const payload = {

                shelter_design_id:
                    Number(
                        selectedDesignId
                    ),

                opening_type:
                    openingData.opening_type,

                area:
                    Number(
                        openingData.area
                    ),

                count:
                    Number(
                        openingData.count
                    ),

                orientation:
                    Number(
                        openingData.orientation
                    ),

                u_value:
                    Number(
                        openingData.u_value
                    )
            };

            if (payload.area <= 0) {

                throw new Error(
                    "Opening area must be greater than 0."
                );
            }

            if (payload.count <= 0) {

                throw new Error(
                    "Opening count must be greater than 0."
                );
            }

            if (payload.u_value <= 0) {

                throw new Error(
                    "U-value must be greater than 0."
                );
            }

            const response =
                await fetch(
                    `${API_BASE}/openings`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to add opening."
                );
            }

            setMessage(
                `${
                    payload.opening_type ===
                    "window"
                        ? "Window"
                        : "Door"
                } added successfully.`
            );

            setOpeningData({
                opening_type:
                    payload.opening_type,

                area:
                    payload.opening_type ===
                    "window"
                        ? 1.5
                        : 2,

                count: 1,

                orientation: 0,

                u_value:
                    payload.opening_type ===
                    "window"
                        ? 2.5
                        : 2.0
            });

            await loadOpenings(
                selectedDesignId
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setSavingOpening(false);
        }
    }

    async function deleteOpening(id) {

        try {

            setMessage("");
            setError("");

            const response =
                await fetch(
                    `${API_BASE}/openings/${id}`,
                    {
                        method: "DELETE"
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to delete opening."
                );
            }

            setMessage(
                "Opening deleted successfully."
            );

            await loadOpenings(
                selectedDesignId
            );

        } catch (err) {

            setError(err.message);
        }
    }

    /* ========================================================
       RUN SIMULATION
    ======================================================== */

    async function runSimulation() {

        try {

            setRunningSimulation(true);
            setMessage("");
            setError("");
            setSimulationResult(null);

            if (!selectedDesignId) {

                throw new Error(
                    "Please save the shelter design before running the simulation."
                );
            }

            const response =
                await fetch(
                    `${API_BASE}/simulations/run`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                shelter_design_id:
                                    Number(
                                        selectedDesignId
                                    ),

                                simulation_hours:
                                    Number(
                                        simulationHours
                                    )
                            })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Simulation failed."
                );
            }

            setSimulationResult(data);

            setMessage(
                "Thermal simulation completed successfully."
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setRunningSimulation(false);
        }
    }

    /* ========================================================
       HELPERS
    ======================================================== */

    function formatNumber(
        value,
        decimals = 2
    ) {

        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "-";
        }

        return number.toFixed(
            decimals
        );
    }

    const selectedClimate =
        getSelectedClimate();

    const totalOpeningArea =
        openings.reduce(
            (total, opening) =>
                total +
                Number(
                    opening.area || 0
                ) *
                    Number(
                        opening.count || 0
                    ),
            0
        );

    const hourlyData =
        simulationResult?.hourly_data ||
        [];

    /* ========================================================
       LOADING SCREEN
    ======================================================== */

    if (loading) {

        return (
            <div className="loading-screen">

                <div className="loading-card">

                    <div className="loading-spinner"></div>

                    <h2>
                        Loading Thermal Simulation
                    </h2>

                    <p>
                        Connecting to your
                        shelter database...
                    </p>

                </div>

            </div>
        );
    }

    /* ========================================================
       PAGE
    ======================================================== */

    return (
        <div className="app">

            {/* HEADER */}

            <header className="top-header">

                <div>

                    <p className="eyebrow">
                        SIH 2026 • SIH26051
                    </p>

                    <h1>
                        Shelter Thermal Simulation
                    </h1>

                    <p className="header-description">
                        Design, simulate and compare
                        passive shelters for local
                        climatic conditions.
                    </p>

                </div>

                <div className="header-status">

                    <span className="status-dot"></span>

                    Backend Connected

                </div>

            </header>

            <main className="dashboard">

                {/* GLOBAL MESSAGES */}

                {message && (
                    <div className="success-message">
                        <span>✓</span>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <span>!</span>
                        {error}
                    </div>
                )}

                {/* =================================================
                    STEP 1 — CLIMATE
                ================================================= */}

                <section className="configuration-card">

                    <div className="section-title">

                        <div className="step-number">
                            1
                        </div>

                        <div>

                            <h2>
                                Climate / Ambient
                                Conditions
                            </h2>

                            <p>
                                Enter the environmental
                                conditions used by the
                                thermal model.
                            </p>

                        </div>

                    </div>

                    <div className="climate-mode-buttons">

                        <button
                            className={
                                climateMode ===
                                "preset"
                                    ? "mode-button active"
                                    : "mode-button"
                            }
                            onClick={() =>
                                selectClimateMode(
                                    "preset"
                                )
                            }
                        >
                            Use Saved Climate
                        </button>

                        <button
                            className={
                                climateMode ===
                                "custom"
                                    ? "mode-button active"
                                    : "mode-button"
                            }
                            onClick={() =>
                                selectClimateMode(
                                    "custom"
                                )
                            }
                        >
                            Enter Custom Climate
                        </button>

                    </div>

                    {/* SAVED CLIMATE */}

                    {climateMode === "preset" && (
                        <div className="climate-input-grid">

                            <div className="input-group full-width">

                                <label>
                                    Climate Profile
                                </label>

                                <select
                                    value={
                                        selectedClimateId
                                    }
                                    onChange={(event) => {

                                        setSelectedClimateId(
                                            event.target.value
                                        );

                                        setRecommendations(
                                            []
                                        );

                                        setShowRecommendations(
                                            false
                                        );

                                        setSelectedRecommendation(
                                            null
                                        );

                                        setMessage("");
                                    }}
                                >

                                    {climateProfiles.length ===
                                        0 && (
                                        <option value="">
                                            No climate
                                            profiles
                                            available
                                        </option>
                                    )}

                                    {climateProfiles.map(
                                        (profile) => (
                                            <option
                                                key={
                                                    profile.id
                                                }
                                                value={
                                                    profile.id
                                                }
                                            >
                                                {
                                                    profile.name
                                                }{" "}
                                                —{" "}
                                                {
                                                    profile.location
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </div>
                    )}

                    {/* CUSTOM CLIMATE */}

                    {climateMode === "custom" && (
                        <>

                            <div className="custom-climate-note">

                                <strong>
                                    Custom Climate
                                    Input
                                </strong>

                                <p>
                                    Enter your own
                                    measured or
                                    collected
                                    environmental
                                    data.
                                </p>

                            </div>

                            <div className="input-grid">

                                <div className="input-group">

                                    <label>
                                        Climate Profile
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            customClimate.name
                                        }
                                        onChange={
                                            handleCustomClimateChange
                                        }
                                        placeholder="e.g. Ladakh Winter Data"
                                    />

                                </div>

                                <div className="input-group">

                                    <label>
                                        Location
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={
                                            customClimate.location
                                        }
                                        onChange={
                                            handleCustomClimateChange
                                        }
                                        placeholder="e.g. Leh, Ladakh"
                                    />

                                </div>

                                <div className="input-group">

                                    <label>
                                        Outdoor
                                        Temperature
                                        (°C)
                                    </label>

                                    <input
                                        type="number"
                                        step="0.1"
                                        name="outdoor_temperature"
                                        value={
                                            customClimate.outdoor_temperature
                                        }
                                        onChange={
                                            handleCustomClimateChange
                                        }
                                    />

                                </div>

                                <div className="input-group">

                                    <label>
                                        Solar
                                        Radiation
                                        (W/m²)
                                    </label>

                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        name="solar_radiation"
                                        value={
                                            customClimate.solar_radiation
                                        }
                                        onChange={
                                            handleCustomClimateChange
                                        }
                                    />

                                </div>

                                <div className="input-group">

                                    <label>
                                        Wind Speed
                                        (m/s)
                                    </label>

                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        name="wind_speed"
                                        value={
                                            customClimate.wind_speed
                                        }
                                        onChange={
                                            handleCustomClimateChange
                                        }
                                    />

                                </div>

                                <div className="input-group">

                                    <label>
                                        Relative
                                        Humidity (%)
                                    </label>

                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        name="humidity"
                                        value={
                                            customClimate.humidity
                                        }
                                        onChange={
                                            handleCustomClimateChange
                                        }
                                    />

                                </div>

                            </div>

                            <button
                                className="primary-button"
                                onClick={
                                    saveCustomClimate
                                }
                                disabled={
                                    savingClimate
                                }
                            >
                                {savingClimate
                                    ? "Saving Climate..."
                                    : "Save Custom Climate"}
                            </button>

                        </>
                    )}

                    {/* ACTIVE CLIMATE */}

                    {selectedClimate && (
                        <div className="climate-preview">

                            <div className="preview-header">

                                <div>

                                    <span className="preview-label">
                                        ACTIVE CLIMATE
                                    </span>

                                    <h3>
                                        {
                                            selectedClimate.name
                                        }
                                    </h3>

                                    <p>
                                        {
                                            selectedClimate.location
                                        }
                                    </p>

                                </div>

                            </div>

                            <div className="metric-grid">

                                <div className="metric-box">

                                    <span>
                                        Outdoor
                                        Temperature
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            selectedClimate.outdoor_temperature
                                        )}
                                        °C
                                    </strong>

                                </div>

                                <div className="metric-box">

                                    <span>
                                        Solar
                                        Radiation
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            selectedClimate.solar_radiation,
                                            0
                                        )}{" "}
                                        W/m²
                                    </strong>

                                </div>

                                <div className="metric-box">

                                    <span>
                                        Wind Speed
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            selectedClimate.wind_speed
                                        )}{" "}
                                        m/s
                                    </strong>

                                </div>

                                <div className="metric-box">

                                    <span>
                                        Humidity
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            selectedClimate.humidity
                                        )}
                                        %
                                    </strong>

                                </div>

                            </div>

                            {/* RECOMMENDATION ASSISTANT */}

                            <div className="recommendation-helper">

                                <div>

                                    <span className="preview-label">
                                        OPTIONAL DESIGN ASSISTANT
                                    </span>

                                    <h3>
                                        Need help choosing
                                        a shelter design?
                                    </h3>

                                    <p>
                                        Analyze the active
                                        climate and generate
                                        five possible shelter
                                        configurations with
                                        specifications and
                                        prototype performance
                                        predictions.
                                    </p>

                                </div>

                                <button
                                    className="recommendation-button"
                                    onClick={
                                        suggestDesigns
                                    }
                                    disabled={
                                        loadingRecommendations
                                    }
                                >
                                    {loadingRecommendations
                                        ? "Analyzing Climate..."
                                        : "Suggest 5 Designs"}
                                </button>

                            </div>

                        </div>
                    )}

                    {/* =================================================
                        FIVE RECOMMENDATIONS
                    ================================================= */}

                    {showRecommendations &&
                        recommendations.length > 0 && (

                            <div className="recommendations-section">

                                <div className="recommendations-heading">

                                    <div>

                                        <span className="preview-label">
                                            CLIMATE-BASED DESIGN
                                            SUGGESTIONS
                                        </span>

                                        <h2>
                                            Five Possible
                                            Shelter Designs
                                        </h2>

                                        <p>
                                            These are prototype
                                            design alternatives
                                            generated from the
                                            climate conditions
                                            you entered.
                                        </p>

                                    </div>

                                    <button
                                        className="close-recommendations"
                                        onClick={() => {
                                            setShowRecommendations(
                                                false
                                            );
                                        }}
                                    >
                                        Hide
                                    </button>

                                </div>

                                <div className="recommendations-grid">

                                    {recommendations.map(
                                        (
                                            recommendation,
                                            index
                                        ) => {

                                            const performance =
                                                getRecommendationPerformance(
                                                    recommendation
                                                );

                                            const recMaterials =
                                                getRecommendationMaterials(
                                                    recommendation
                                                );

                                            const recDesign =
                                                getRecommendationDesign(
                                                    recommendation
                                                );

                                            const recOpenings =
                                                getRecommendationOpenings(
                                                    recommendation
                                                );

                                            const isSelected =
                                                selectedRecommendation ===
                                                recommendation;

                                            return (
                                                <div
                                                    className={
                                                        isSelected
                                                            ? "recommendation-card selected"
                                                            : "recommendation-card"
                                                    }
                                                    key={
                                                        recommendation.id ||
                                                        recommendation.name ||
                                                        index
                                                    }
                                                >

                                                    <div className="recommendation-card-top">

                                                        <div className="recommendation-number">
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </div>

                                                        <div>

                                                            <h3>
                                                                {
                                                                    recommendation.name ||
                                                                    `Design Option ${
                                                                        index +
                                                                        1
                                                                    }`
                                                                }
                                                            </h3>

                                                            <span className="recommendation-tag">
                                                                Climate Based
                                                            </span>

                                                        </div>

                                                    </div>

                                                    {recommendation.reason && (
                                                        <p className="recommendation-reason">
                                                            {
                                                                recommendation.reason
                                                            }
                                                        </p>
                                                    )}

                                                    <div className="recommendation-specifications">

                                                        <h4>
                                                            Specifications
                                                        </h4>

                                                        <div className="recommendation-spec-grid">

                                                            <div>

                                                                <span>
                                                                    Dimensions
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        recDesign.length,
                                                                        1
                                                                    )}{" "}
                                                                    ×{" "}
                                                                    {formatNumber(
                                                                        recDesign.width,
                                                                        1
                                                                    )}{" "}
                                                                    ×{" "}
                                                                    {formatNumber(
                                                                        recDesign.height,
                                                                        1
                                                                    )}{" "}
                                                                    m
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Orientation
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        recDesign.orientation,
                                                                        0
                                                                    )}
                                                                    °
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Wall Thickness
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        recDesign.wall_thickness
                                                                    )}{" "}
                                                                    m
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Roof Thickness
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        recDesign.roof_thickness
                                                                    )}{" "}
                                                                    m
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Floor Thickness
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        recDesign.floor_thickness
                                                                    )}{" "}
                                                                    m
                                                                </strong>

                                                            </div>

                                                            {recOpenings.length >
                                                                0 && (
                                                                <div>

                                                                    <span>
                                                                        Openings
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            recOpenings.length
                                                                        }
                                                                    </strong>

                                                                </div>
                                                            )}

                                                        </div>

                                                    </div>

                                                    <div className="recommendation-materials">

                                                        <h4>
                                                            Materials
                                                        </h4>

                                                        <div className="material-list">

                                                            <div>

                                                                <span>
                                                                    Wall
                                                                </span>

                                                                <strong>
                                                                    {recMaterials.wall?.name ||
                                                                        recommendation.wall_material_name ||
                                                                        recDesign.wall_material_name ||
                                                                        "—"}
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Roof
                                                                </span>

                                                                <strong>
                                                                    {recMaterials.roof?.name ||
                                                                        recommendation.roof_material_name ||
                                                                        recDesign.roof_material_name ||
                                                                        "—"}
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Floor
                                                                </span>

                                                                <strong>
                                                                    {recMaterials.floor?.name ||
                                                                        recommendation.floor_material_name ||
                                                                        recDesign.floor_material_name ||
                                                                        "—"}
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    </div>

                                                    <div className="recommendation-performance">

                                                        <h4>
                                                            Predicted Performance
                                                        </h4>

                                                        <div className="performance-grid">

                                                            <div>

                                                                <span>
                                                                    Avg. Indoor
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        performance.average_indoor_temperature
                                                                    )}
                                                                    °C
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Min. Indoor
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        performance.minimum_indoor_temperature
                                                                    )}
                                                                    °C
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Max. Indoor
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        performance.maximum_indoor_temperature
                                                                    )}
                                                                    °C
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Heat Loss
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        performance.total_heat_loss
                                                                    )}
                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Comfort Score
                                                                </span>

                                                                <strong>
                                                                    {formatNumber(
                                                                        performance.thermal_comfort_score
                                                                    )}
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    </div>

                                                    <button
                                                        className="use-recommendation-button"
                                                        onClick={() =>
                                                            useRecommendedDesign(
                                                                recommendation
                                                            )
                                                        }
                                                    >
                                                        Use This Design
                                                    </button>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                                <div className="recommendation-disclaimer">

                                    <strong>
                                        Prototype note:
                                    </strong>{" "}

                                    These recommendations
                                    are generated using the
                                    current simplified
                                    physics-based model.
                                    They are intended for
                                    design exploration and
                                    should not be treated as
                                    engineering-certified
                                    shelter designs.

                                </div>

                            </div>
                        )}

                </section>

                {/* =================================================
                    STEP 2 — GEOMETRY
                ================================================= */}

                <section className="configuration-card">

                    <div className="section-title">

                        <div className="step-number">
                            2
                        </div>

                        <div>

                            <h2>
                                Shelter Geometry
                            </h2>

                            <p>
                                Define the physical
                                dimensions and
                                orientation.
                            </p>

                        </div>

                    </div>

                    <div className="input-grid">

                        <div className="input-group">

                            <label>
                                Shelter Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={
                                    design.name
                                }
                                onChange={
                                    handleDesignChange
                                }
                            />

                        </div>

                        <div className="input-group">

                            <label>
                                Length (m)
                            </label>

                            <input
                                type="number"
                                step="0.1"
                                name="length"
                                value={
                                    design.length
                                }
                                onChange={
                                    handleDesignChange
                                }
                            />

                        </div>

                        <div className="input-group">

                            <label>
                                Width (m)
                            </label>

                            <input
                                type="number"
                                step="0.1"
                                name="width"
                                value={
                                    design.width
                                }
                                onChange={
                                    handleDesignChange
                                }
                            />

                        </div>

                        <div className="input-group">

                            <label>
                                Height (m)
                            </label>

                            <input
                                type="number"
                                step="0.1"
                                name="height"
                                value={
                                    design.height
                                }
                                onChange={
                                    handleDesignChange
                                }
                            />

                        </div>

                        <div className="input-group">

                            <label>
                                Orientation (°)
                            </label>

                            <input
                                type="number"
                                name="orientation"
                                value={
                                    design.orientation
                                }
                                onChange={
                                    handleDesignChange
                                }
                            />

                        </div>

                    </div>

                </section>

                {/* =================================================
                    STEP 3 — MATERIALS
                ================================================= */}

                <section className="configuration-card">

                    <div className="section-title">

                        <div className="step-number">
                            3
                        </div>

                        <div>

                            <h2>
                                Material Selection
                            </h2>

                            <p>
                                Select materials and
                                their thicknesses.
                            </p>

                        </div>

                    </div>

                    <div className="input-grid">

                        <div className="input-group">

                            <label>
                                Wall Material
                            </label>

                            <select
                                name="wall_material_id"
                                value={
                                    design.wall_material_id
                                }
                                onChange={
                                    handleDesignChange
                                }
                            >

                                <option value="">
                                    Select wall
                                    material
                                </option>

                                {materials.map(
                                    (material) => (
                                        <option
                                            key={
                                                material.id
                                            }
                                            value={
                                                material.id
                                            }
                                        >
                                            {
                                                material.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        <div className="input-group">

                            <label>
                                Roof Material
                            </label>

                            <select
                                name="roof_material_id"
                                value={
                                    design.roof_material_id
                                }
                                onChange={
                                    handleDesignChange
                                }
                            >

                                <option value="">
                                    Select roof
                                    material
                                </option>

                                {materials.map(
                                    (material) => (
                                        <option
                                            key={
                                                material.id
                                            }
                                            value={
                                                material.id
                                            }
                                        >
                                            {
                                                material.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        <div className="input-group">

                            <label>
                                Floor Material
                            </label>

                            <select
                                name="floor_material_id"
                                value={
                                    design.floor_material_id
                                }
                                onChange={
                                    handleDesignChange
                                }
                            >

                                <option value="">
                                    Select floor
                                    material
                                </option>

                                {materials.map(
                                    (material) => (
                                        <option
                                            key={
                                                material.id
                                            }
                                            value={
                                                material.id
                                            }
                                        >
                                            {
                                                material.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        <div className="input-group">

                            <label>
                                Wall Thickness (m)
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                name="wall_thickness"
                                value={
                                    design.wall_thickness
                                }
                                onChange={
                                    handleDesignChange
                                }
                            />

                        </div>

                        <div className="input-group">

                            <label>
                                Roof Thickness (m)
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                name="roof_thickness"
                                value={
                                    design.roof_thickness
                                }
                                onChange={
                                    handleDesignChange
                                }
                            />

                        </div>

                        <div className="input-group">

                            <label>
                                Floor Thickness (m)
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                name="floor_thickness"
                                value={
                                    design.floor_thickness
                                }
                                onChange={
                                    handleDesignChange
                                }
                            />

                        </div>

                    </div>

                    <button
                        className="primary-button"
                        onClick={
                            saveDesign
                        }
                        disabled={
                            savingDesign
                        }
                    >
                        {savingDesign
                            ? "Saving Shelter Design..."
                            : "Save Shelter Design"}
                    </button>

                </section>

                {/* =================================================
                    STEP 4 — OPENINGS
                ================================================= */}

                <section className="configuration-card">

                    <div className="section-title">

                        <div className="step-number">
                            4
                        </div>

                        <div>

                            <h2>
                                Windows & Doors
                            </h2>

                            <p>
                                Add openings that
                                affect thermal heat
                                transfer.
                            </p>

                        </div>

                    </div>

                    {!selectedDesignId && (
                        <div className="info-box">

                            <strong>
                                Save the shelter
                                design first.
                            </strong>

                            <p>
                                Windows and doors are
                                attached to a specific
                                shelter design.
                            </p>

                        </div>
                    )}

                    {selectedDesignId && (
                        <>

                            <div className="input-grid">

                                <div className="input-group">

                                    <label>
                                        Opening Type
                                    </label>

                                    <select
                                        name="opening_type"
                                        value={
                                            openingData.opening_type
                                        }
                                        onChange={
                                            handleOpeningChange
                                        }
                                    >

                                        <option value="window">
                                            Window
                                        </option>

                                        <option value="door">
                                            Door
                                        </option>

                                    </select>

                                </div>

                                <div className="input-group">

                                    <label>
                                        Area of One
                                        Opening (m²)
                                    </label>

                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.01"
                                        name="area"
                                        value={
                                            openingData.area
                                        }
                                        onChange={
                                            handleOpeningChange
                                        }
                                    />

                                </div>

                                <div className="input-group">

                                    <label>
                                        Count
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        name="count"
                                        value={
                                            openingData.count
                                        }
                                        onChange={
                                            handleOpeningChange
                                        }
                                    />

                                </div>

                                <div className="input-group">

                                    <label>
                                        Orientation (°)
                                    </label>

                                    <input
                                        type="number"
                                        name="orientation"
                                        value={
                                            openingData.orientation
                                        }
                                        onChange={
                                            handleOpeningChange
                                        }
                                    />

                                </div>

                                <div className="input-group">

                                    <label>
                                        U-Value (W/m²K)
                                    </label>

                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.01"
                                        name="u_value"
                                        value={
                                            openingData.u_value
                                        }
                                        onChange={
                                            handleOpeningChange
                                        }
                                    />

                                </div>

                            </div>

                            <button
                                className="opening-button"
                                onClick={
                                    saveOpening
                                }
                                disabled={
                                    savingOpening
                                }
                            >
                                {savingOpening
                                    ? "Adding Opening..."
                                    : "Add Window / Door"}
                            </button>

                            <div className="opening-summary">

                                <div>

                                    <span>
                                        Total Openings
                                    </span>

                                    <strong>
                                        {
                                            openings.length
                                        }
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Total Opening
                                        Area
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            totalOpeningArea
                                        )}{" "}
                                        m²
                                    </strong>

                                </div>

                            </div>

                            {openings.length > 0 ? (

                                <div className="opening-table-container">

                                    <table className="opening-table">

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

                                                <th>
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {openings.map(
                                                (
                                                    opening
                                                ) => (
                                                    <tr
                                                        key={
                                                            opening.id
                                                        }
                                                    >

                                                        <td>
                                                            <span className="opening-type">
                                                                {
                                                                    opening.opening_type
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {
                                                                opening.area
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
                                                                opening.orientation
                                                            }
                                                            °
                                                        </td>

                                                        <td>
                                                            {
                                                                opening.u_value
                                                            }
                                                        </td>

                                                        <td>

                                                            <button
                                                                className="delete-button"
                                                                onClick={() =>
                                                                    deleteOpening(
                                                                        opening.id
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            ) : (

                                <div className="empty-openings">
                                    No windows or
                                    doors have been
                                    added yet.
                                </div>

                            )}

                        </>
                    )}

                </section>

                {/* =================================================
                    STEP 5 — SIMULATION
                ================================================= */}

                <section className="configuration-card">

                    <div className="section-title">

                        <div className="step-number">
                            5
                        </div>

                        <div>

                            <h2>
                                Thermal Simulation
                            </h2>

                            <p>
                                Predict indoor thermal
                                behaviour for the
                                selected shelter.
                            </p>

                        </div>

                    </div>

                    <div className="simulation-controls">

                        <div className="input-group">

                            <label>
                                Simulation Duration
                            </label>

                            <select
                                value={
                                    simulationHours
                                }
                                onChange={(event) =>
                                    setSimulationHours(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                            >

                                <option value={24}>
                                    24 Hours
                                </option>

                                <option value={48}>
                                    48 Hours
                                </option>

                                <option value={72}>
                                    72 Hours
                                </option>

                            </select>

                        </div>

                        <button
                            className="simulate-button"
                            onClick={
                                runSimulation
                            }
                            disabled={
                                runningSimulation ||
                                !selectedDesignId
                            }
                        >
                            {runningSimulation
                                ? "Running Simulation..."
                                : "Run Thermal Simulation"}
                        </button>

                    </div>

                </section>

                {/* =================================================
                    RESULTS
                ================================================= */}

                {simulationResult && (

                    <section className="results-card">

                        <div className="section-title">

                            <div className="result-icon">
                                ✓
                            </div>

                            <div>

                                <h2>
                                    Thermal Simulation
                                    Results
                                </h2>

                                <p>
                                    Simulation ID:{" "}
                                    {
                                        simulationResult.simulation_id
                                    }
                                </p>

                            </div>

                        </div>

                        {simulationResult.summary && (

                            <div className="result-metrics">

                                <div className="result-metric">

                                    <span>
                                        Average Indoor
                                        Temperature
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            simulationResult
                                                .summary
                                                .average_indoor_temperature
                                        )}
                                        °C
                                    </strong>

                                </div>

                                <div className="result-metric">

                                    <span>
                                        Minimum Indoor
                                        Temperature
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            simulationResult
                                                .summary
                                                .minimum_indoor_temperature
                                        )}
                                        °C
                                    </strong>

                                </div>

                                <div className="result-metric">

                                    <span>
                                        Maximum Indoor
                                        Temperature
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            simulationResult
                                                .summary
                                                .maximum_indoor_temperature
                                        )}
                                        °C
                                    </strong>

                                </div>

                                <div className="result-metric">

                                    <span>
                                        Total Solar
                                        Gain
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            simulationResult
                                                .summary
                                                .total_solar_gain
                                        )}
                                    </strong>

                                </div>

                                <div className="result-metric">

                                    <span>
                                        Total Heat Loss
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            simulationResult
                                                .summary
                                                .total_heat_loss
                                        )}
                                    </strong>

                                </div>

                                <div className="result-metric">

                                    <span>
                                        Thermal Comfort
                                        Score
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            simulationResult
                                                .summary
                                                .thermal_comfort_score
                                        )}
                                    </strong>

                                </div>

                            </div>
                        )}

                        {hourlyData.length > 0 && (

                            <div className="graphs-section">

                                <div className="graphs-heading">

                                    <span className="graphs-label">
                                        VISUAL ANALYSIS
                                    </span>

                                    <h2>
                                        Thermal Behaviour
                                    </h2>

                                    <p>
                                        Hour-by-hour response
                                        of the shelter under
                                        the selected climate
                                        and design conditions.
                                    </p>

                                </div>

                                <ThermalLineChart
                                    title="Indoor vs Outdoor Temperature"
                                    data={
                                        hourlyData
                                    }
                                    firstKey="outdoor_temperature"
                                    secondKey="indoor_temperature"
                                    firstLabel="Outdoor Temperature"
                                    secondLabel="Indoor Temperature"
                                    firstUnit="°C"
                                />

                                <ThermalLineChart
                                    title="Solar Heat Gain"
                                    data={
                                        hourlyData
                                    }
                                    firstKey="solar_gain"
                                    firstLabel="Solar Heat Gain"
                                    firstUnit="simulation units"
                                />

                                <ThermalLineChart
                                    title="Heat Loss"
                                    data={
                                        hourlyData
                                    }
                                    firstKey="heat_loss"
                                    firstLabel="Heat Loss"
                                    firstUnit="simulation units"
                                />

                                <ThermalComfortChart
                                    data={
                                        hourlyData
                                    }
                                />

                            </div>
                        )}

                        {simulationResult.hourly_data && (

                            <div className="hourly-section">

                                <h3>
                                    Hourly Thermal Response
                                </h3>

                                <div className="table-container">

                                    <table>

                                        <thead>

                                            <tr>

                                                <th>
                                                    Hour
                                                </th>

                                                <th>
                                                    Outdoor
                                                    Temp
                                                </th>

                                                <th>
                                                    Indoor
                                                    Temp
                                                </th>

                                                <th>
                                                    Solar
                                                    Gain
                                                </th>

                                                <th>
                                                    Heat Loss
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {simulationResult.hourly_data.map(
                                                (
                                                    row,
                                                    index
                                                ) => (

                                                    <tr
                                                        key={
                                                            index
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                row.hour
                                                            }
                                                        </td>

                                                        <td>
                                                            {formatNumber(
                                                                row.outdoor_temperature
                                                            )}
                                                            °C
                                                        </td>

                                                        <td>
                                                            {formatNumber(
                                                                row.indoor_temperature
                                                            )}
                                                            °C
                                                        </td>

                                                        <td>
                                                            {formatNumber(
                                                                row.solar_gain
                                                            )}
                                                        </td>

                                                        <td>
                                                            {formatNumber(
                                                                row.heat_loss
                                                            )}
                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>
                        )}

                    </section>
                )}

            </main>
        </div>
    );
}

export default App;