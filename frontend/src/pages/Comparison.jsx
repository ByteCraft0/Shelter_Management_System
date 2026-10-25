import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

const emptyDesign = {
    name: "",
    climate_id: "",
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
};

const emptyOpening = {
    opening_type: "window",
    area: 1.5,
    count: 2,
    orientation: 0,
    u_value: 2.5
};

function Comparison({ onBack }) {
    const [climateProfiles, setClimateProfiles] = useState([]);
    const [materials, setMaterials] = useState([]);

    const [designA, setDesignA] = useState({
        ...emptyDesign,
        name: "Shelter Design A"
    });

    const [designB, setDesignB] = useState({
        ...emptyDesign,
        name: "Shelter Design B"
    });

    const [openingsA, setOpeningsA] = useState([]);
    const [openingsB, setOpeningsB] = useState([]);

    const [openingA, setOpeningA] = useState({
        ...emptyOpening
    });

    const [openingB, setOpeningB] = useState({
        ...emptyOpening
    });

    const [simulationHours, setSimulationHours] =
        useState(24);

    const [comparisonResult, setComparisonResult] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [runningComparison, setRunningComparison] =
        useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadInitialData();
    }, []);

    async function loadInitialData() {
        try {
            setLoading(true);
            setError("");

            const [
                climateResponse,
                materialResponse
            ] = await Promise.all([
                fetch(`${API_BASE}/climate`),
                fetch(`${API_BASE}/materials`)
            ]);

            if (!climateResponse.ok) {
                throw new Error(
                    "Failed to load climate profiles."
                );
            }

            if (!materialResponse.ok) {
                throw new Error(
                    "Failed to load materials."
                );
            }

            const climateData =
                await climateResponse.json();

            const materialData =
                await materialResponse.json();

            setClimateProfiles(climateData);
            setMaterials(materialData);

            if (climateData.length > 0) {
                setDesignA((previous) => ({
                    ...previous,
                    climate_id: climateData[0].id
                }));

                setDesignB((previous) => ({
                    ...previous,
                    climate_id: climateData[0].id
                }));
            }

            if (materialData.length > 0) {
                const defaultWall =
                    materialData[1]?.id ||
                    materialData[0].id;

                const defaultRoof =
                    materialData[3]?.id ||
                    materialData[0].id;

                const defaultFloor =
                    materialData[1]?.id ||
                    materialData[0].id;

                setDesignA((previous) => ({
                    ...previous,
                    wall_material_id: defaultWall,
                    roof_material_id: defaultRoof,
                    floor_material_id: defaultFloor
                }));

                setDesignB((previous) => ({
                    ...previous,
                    wall_material_id: defaultWall,
                    roof_material_id: defaultRoof,
                    floor_material_id: defaultFloor
                }));
            }
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                    "Failed to load comparison data."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleDesignChange(
        side,
        event
    ) {
        const { name, value } = event.target;

        if (side === "A") {
            setDesignA((previous) => ({
                ...previous,
                [name]: value
            }));
        } else {
            setDesignB((previous) => ({
                ...previous,
                [name]: value
            }));
        }

        setComparisonResult(null);
        setMessage("");
    }

    function handleOpeningChange(
        side,
        event
    ) {
        const { name, value } = event.target;

        if (side === "A") {
            setOpeningA((previous) => ({
                ...previous,
                [name]: value
            }));
        } else {
            setOpeningB((previous) => ({
                ...previous,
                [name]: value
            }));
        }

        setComparisonResult(null);
    }

    function addOpening(side) {
        if (side === "A") {
            setOpeningsA((previous) => [
                ...previous,
                {
                    ...openingA,
                    id: Date.now()
                }
            ]);

            setOpeningA({
                ...emptyOpening
            });
        } else {
            setOpeningsB((previous) => [
                ...previous,
                {
                    ...openingB,
                    id: Date.now()
                }
            ]);

            setOpeningB({
                ...emptyOpening
            });
        }

        setComparisonResult(null);
    }

    function deleteOpening(
        side,
        openingId
    ) {
        if (side === "A") {
            setOpeningsA((previous) =>
                previous.filter(
                    (opening) =>
                        opening.id !== openingId
                )
            );
        } else {
            setOpeningsB((previous) =>
                previous.filter(
                    (opening) =>
                        opening.id !== openingId
                )
            );
        }

        setComparisonResult(null);
    }

    function validateDesign(
        design,
        side
    ) {
        if (!design.name.trim()) {
            return `Enter a name for Design ${side}.`;
        }

        if (!design.climate_id) {
            return `Select a climate for Design ${side}.`;
        }

        if (
            Number(design.length) <= 0 ||
            Number(design.width) <= 0 ||
            Number(design.height) <= 0
        ) {
            return `Length, width and height for Design ${side} must be greater than 0.`;
        }

        if (
            Number(design.wall_thickness) <= 0 ||
            Number(design.roof_thickness) <= 0 ||
            Number(design.floor_thickness) <= 0
        ) {
            return `Material thicknesses for Design ${side} must be greater than 0.`;
        }

        if (
            !design.wall_material_id ||
            !design.roof_material_id ||
            !design.floor_material_id
        ) {
            return `Select all materials for Design ${side}.`;
        }

        return "";
    }

    function validateOpening(
        opening,
        side
    ) {
        if (Number(opening.area) <= 0) {
            return `Opening area for Design ${side} must be greater than 0.`;
        }

        if (Number(opening.count) <= 0) {
            return `Opening count for Design ${side} must be greater than 0.`;
        }

        if (Number(opening.u_value) < 0) {
            return `U-value for Design ${side} cannot be negative.`;
        }

        return "";
    }

    function getClimateName(id) {
        const climate =
            climateProfiles.find(
                (item) =>
                    Number(item.id) === Number(id)
            );

        return climate
            ? `${climate.name} — ${climate.location}`
            : "Select climate";
    }

    function getMaterialName(id) {
        const material =
            materials.find(
                (item) =>
                    Number(item.id) === Number(id)
            );

        return material
            ? material.name
            : "Select material";
    }

    function totalOpeningArea(openings) {
        return openings.reduce(
            (total, opening) =>
                total +
                Number(opening.area || 0) *
                    Number(opening.count || 0),
            0
        );
    }

    async function saveDesignToBackend(
        design,
        side
    ) {
        const response = await fetch(
            `${API_BASE}/designs`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: design.name,
                    climate_id:
                        Number(design.climate_id),
                    length: Number(design.length),
                    width: Number(design.width),
                    height: Number(design.height),
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
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                    `Failed to save Design ${side}.`
            );
        }

        return data;
    }

    async function saveOpeningToBackend(
        designId,
        opening,
        side
    ) {
        const response = await fetch(
            `${API_BASE}/openings`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    shelter_design_id:
                        Number(designId),
                    opening_type:
                        opening.opening_type,
                    area:
                        Number(opening.area),
                    count:
                        Number(opening.count),
                    orientation:
                        Number(opening.orientation),
                    u_value:
                        Number(opening.u_value)
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                    `Failed to save an opening for Design ${side}.`
            );
        }

        return data;
    }

    async function runDesignSimulation(
        designId
    ) {
        const response = await fetch(
            `${API_BASE}/simulations/run`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    shelter_design_id:
                        Number(designId),
                    simulation_hours:
                        Number(simulationHours)
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                    "Thermal simulation failed."
            );
        }

        return data;
    }

    async function runComparison() {
        setError("");
        setMessage("");
        setComparisonResult(null);

        const designAError =
            validateDesign(designA, "A");

        if (designAError) {
            setError(designAError);
            return;
        }

        const designBError =
            validateDesign(designB, "B");

        if (designBError) {
            setError(designBError);
            return;
        }

        if (
            Number(designA.climate_id) !==
            Number(designB.climate_id)
        ) {
            setError(
                "For a fair comparison, Design A and Design B must use the same climate profile."
            );
            return;
        }

        for (const opening of openingsA) {
            const openingError =
                validateOpening(opening, "A");

            if (openingError) {
                setError(openingError);
                return;
            }
        }

        for (const opening of openingsB) {
            const openingError =
                validateOpening(opening, "B");

            if (openingError) {
                setError(openingError);
                return;
            }
        }

        try {
            setRunningComparison(true);

            setMessage(
                "Saving Design A and running its thermal simulation..."
            );

            const savedA =
                await saveDesignToBackend(
                    designA,
                    "A"
                );

            const designAId =
                savedA.design?.id ||
                savedA.id;

            if (!designAId) {
                throw new Error(
                    "Design A was saved but no design ID was returned."
                );
            }

            for (const opening of openingsA) {
                await saveOpeningToBackend(
                    designAId,
                    opening,
                    "A"
                );
            }

            const resultA =
                await runDesignSimulation(
                    designAId
                );

            setMessage(
                "Design A completed. Saving Design B and running its thermal simulation..."
            );

            const savedB =
                await saveDesignToBackend(
                    designB,
                    "B"
                );

            const designBId =
                savedB.design?.id ||
                savedB.id;

            if (!designBId) {
                throw new Error(
                    "Design B was saved but no design ID was returned."
                );
            }

            for (const opening of openingsB) {
                await saveOpeningToBackend(
                    designBId,
                    opening,
                    "B"
                );
            }

            const resultB =
                await runDesignSimulation(
                    designBId
                );

            setComparisonResult({
                designA: resultA,
                designB: resultB
            });

            setMessage(
                "Comparison completed successfully."
            );
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                    "Comparison failed."
            );
        } finally {
            setRunningComparison(false);
        }
    }

    if (loading) {
        return (
            <div className="comparison-page">
                <div className="comparison-loading">
                    <div className="loading-spinner"></div>

                    <h2>
                        Loading comparison tools...
                    </h2>

                    <p>
                        Loading climate profiles and
                        material data.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="comparison-page">
            <div className="comparison-header">
                <button
                    className="back-button"
                    onClick={onBack}
                >
                    ← Back to Home
                </button>

                <p className="eyebrow">
                    SIH 2026 • DESIGN ANALYSIS
                </p>

                <h1>
                    Compare Shelter Designs
                </h1>

                <p>
                    Configure two shelter designs
                    simultaneously and compare their
                    thermal performance under the same
                    climatic conditions.
                </p>
            </div>

            {message && (
                <div className="comparison-success">
                    <span>✓</span>
                    {message}
                </div>
            )}

            {error && (
                <div className="comparison-message">
                    {error}
                </div>
            )}

            <div className="comparison-design-grid">
                <DesignPanel
                    side="A"
                    design={designA}
                    opening={openingA}
                    openings={openingsA}
                    climateProfiles={climateProfiles}
                    materials={materials}
                    onDesignChange={
                        handleDesignChange
                    }
                    onOpeningChange={
                        handleOpeningChange
                    }
                    onAddOpening={addOpening}
                    onDeleteOpening={
                        deleteOpening
                    }
                    getClimateName={
                        getClimateName
                    }
                    getMaterialName={
                        getMaterialName
                    }
                    totalOpeningArea={
                        totalOpeningArea
                    }
                />

                <div className="comparison-vs-column">
                    <div className="comparison-vs">
                        VS
                    </div>
                </div>

                <DesignPanel
                    side="B"
                    design={designB}
                    opening={openingB}
                    openings={openingsB}
                    climateProfiles={climateProfiles}
                    materials={materials}
                    onDesignChange={
                        handleDesignChange
                    }
                    onOpeningChange={
                        handleOpeningChange
                    }
                    onAddOpening={addOpening}
                    onDeleteOpening={
                        deleteOpening
                    }
                    getClimateName={
                        getClimateName
                    }
                    getMaterialName={
                        getMaterialName
                    }
                    totalOpeningArea={
                        totalOpeningArea
                    }
                />
            </div>

            <div className="comparison-run-section">
                <div className="comparison-duration">
                    <label>
                        Simulation Duration
                    </label>

                    <select
                        value={simulationHours}
                        onChange={(event) => {
                            setSimulationHours(
                                Number(
                                    event.target.value
                                )
                            );

                            setComparisonResult(null);
                        }}
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
                    className="comparison-run-button"
                    onClick={runComparison}
                    disabled={runningComparison}
                >
                    {runningComparison
                        ? "Running Comparison..."
                        : "Run Comparison →"}
                </button>

                <p>
                    Both designs will be evaluated using
                    the same thermal simulation engine.
                </p>
            </div>

            {comparisonResult && (
                <ComparisonResults
                    result={comparisonResult}
                />
            )}
        </div>
    );
}

function DesignPanel({
    side,
    design,
    opening,
    openings,
    climateProfiles,
    materials,
    onDesignChange,
    onOpeningChange,
    onAddOpening,
    onDeleteOpening,
    getClimateName,
    getMaterialName,
    totalOpeningArea
}) {
    return (
        <div className="design-panel">
            <div className="design-panel-header">
                <div className="design-letter">
                    {side}
                </div>

                <div>
                    <span>
                        SHELTER DESIGN
                    </span>

                    <h2>
                        Design {side}
                    </h2>
                </div>
            </div>

            <div className="comparison-section">
                <h3>
                    Climate
                </h3>

                <div className="comparison-field">
                    <label>
                        Climate Profile
                    </label>

                    <select
                        name="climate_id"
                        value={design.climate_id}
                        onChange={(event) =>
                            onDesignChange(
                                side,
                                event
                            )
                        }
                    >
                        <option value="">
                            Select climate
                        </option>

                        {climateProfiles.map(
                            (climate) => (
                                <option
                                    key={climate.id}
                                    value={climate.id}
                                >
                                    {climate.name} —{" "}
                                    {climate.location}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {design.climate_id && (
                    <div className="selected-data">
                        {getClimateName(
                            design.climate_id
                        )}
                    </div>
                )}
            </div>

            <div className="comparison-section">
                <h3>
                    Shelter Geometry
                </h3>

                <div className="comparison-field">
                    <label>
                        Shelter Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={design.name}
                        onChange={(event) =>
                            onDesignChange(
                                side,
                                event
                            )
                        }
                    />
                </div>

                <div className="comparison-input-grid">
                    <ComparisonInput
                        label="Length (m)"
                        name="length"
                        type="number"
                        step="0.1"
                        value={design.length}
                        onChange={(event) =>
                            onDesignChange(
                                side,
                                event
                            )
                        }
                    />

                    <ComparisonInput
                        label="Width (m)"
                        name="width"
                        type="number"
                        step="0.1"
                        value={design.width}
                        onChange={(event) =>
                            onDesignChange(
                                side,
                                event
                            )
                        }
                    />

                    <ComparisonInput
                        label="Height (m)"
                        name="height"
                        type="number"
                        step="0.1"
                        value={design.height}
                        onChange={(event) =>
                            onDesignChange(
                                side,
                                event
                            )
                        }
                    />

                    <ComparisonInput
                        label="Orientation (°)"
                        name="orientation"
                        type="number"
                        step="1"
                        value={design.orientation}
                        onChange={(event) =>
                            onDesignChange(
                                side,
                                event
                            )
                        }
                    />
                </div>
            </div>

            <div className="comparison-section">
                <h3>
                    Materials
                </h3>

                <ComparisonSelect
                    label="Wall Material"
                    name="wall_material_id"
                    value={
                        design.wall_material_id
                    }
                    materials={materials}
                    onChange={(event) =>
                        onDesignChange(
                            side,
                            event
                        )
                    }
                />

                <ComparisonInput
                    label="Wall Thickness (m)"
                    name="wall_thickness"
                    type="number"
                    step="0.01"
                    value={
                        design.wall_thickness
                    }
                    onChange={(event) =>
                        onDesignChange(
                            side,
                            event
                        )
                    }
                />

                <ComparisonSelect
                    label="Roof Material"
                    name="roof_material_id"
                    value={
                        design.roof_material_id
                    }
                    materials={materials}
                    onChange={(event) =>
                        onDesignChange(
                            side,
                            event
                        )
                    }
                />

                <ComparisonInput
                    label="Roof Thickness (m)"
                    name="roof_thickness"
                    type="number"
                    step="0.01"
                    value={
                        design.roof_thickness
                    }
                    onChange={(event) =>
                        onDesignChange(
                            side,
                            event
                        )
                    }
                />

                <ComparisonSelect
                    label="Floor Material"
                    name="floor_material_id"
                    value={
                        design.floor_material_id
                    }
                    materials={materials}
                    onChange={(event) =>
                        onDesignChange(
                            side,
                            event
                        )
                    }
                />

                <ComparisonInput
                    label="Floor Thickness (m)"
                    name="floor_thickness"
                    type="number"
                    step="0.01"
                    value={
                        design.floor_thickness
                    }
                    onChange={(event) =>
                        onDesignChange(
                            side,
                            event
                        )
                    }
                />
            </div>

            <div className="comparison-section">
                <div className="opening-section-header">
                    <div>
                        <h3>
                            Windows & Doors
                        </h3>

                        <p>
                            Add openings for this design.
                        </p>
                    </div>
                </div>

                <div className="comparison-input-grid">
                    <div className="comparison-field">
                        <label>
                            Type
                        </label>

                        <select
                            name="opening_type"
                            value={
                                opening.opening_type
                            }
                            onChange={(event) =>
                                onOpeningChange(
                                    side,
                                    event
                                )
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

                    <ComparisonInput
                        label="Area (m²)"
                        name="area"
                        type="number"
                        step="0.1"
                        value={opening.area}
                        onChange={(event) =>
                            onOpeningChange(
                                side,
                                event
                            )
                        }
                    />

                    <ComparisonInput
                        label="Count"
                        name="count"
                        type="number"
                        min="1"
                        step="1"
                        value={opening.count}
                        onChange={(event) =>
                            onOpeningChange(
                                side,
                                event
                            )
                        }
                    />

                    <ComparisonInput
                        label="Orientation (°)"
                        name="orientation"
                        type="number"
                        step="1"
                        value={
                            opening.orientation
                        }
                        onChange={(event) =>
                            onOpeningChange(
                                side,
                                event
                            )
                        }
                    />

                    <ComparisonInput
                        label="U-value"
                        name="u_value"
                        type="number"
                        step="0.1"
                        value={
                            opening.u_value
                        }
                        onChange={(event) =>
                            onOpeningChange(
                                side,
                                event
                            )
                        }
                    />
                </div>

                <button
                    className="comparison-add-opening"
                    onClick={() =>
                        onAddOpening(side)
                    }
                >
                    + Add Opening
                </button>

                <div className="opening-mini-summary">
                    <div>
                        <span>
                            Openings
                        </span>

                        <strong>
                            {openings.reduce(
                                (
                                    total,
                                    item
                                ) =>
                                    total +
                                    Number(
                                        item.count ||
                                            0
                                    ),
                                0
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Total Area
                        </span>

                        <strong>
                            {totalOpeningArea(
                                openings
                            ).toFixed(2)}{" "}
                            m²
                        </strong>
                    </div>
                </div>

                {openings.length > 0 && (
                    <div className="comparison-openings">
                        {openings.map(
                            (item) => (
                                <div
                                    className="comparison-opening-row"
                                    key={item.id}
                                >
                                    <div>
                                        <strong>
                                            {item.opening_type}
                                        </strong>

                                        <span>
                                            {item.area} m² ×{" "}
                                            {item.count}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() =>
                                            onDeleteOpening(
                                                side,
                                                item.id
                                            )
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            <div className="design-summary">
                <span>
                    CURRENT MATERIAL SET
                </span>

                <div>
                    <strong>
                        Wall:
                    </strong>{" "}
                    {getMaterialName(
                        design.wall_material_id
                    )}
                </div>

                <div>
                    <strong>
                        Roof:
                    </strong>{" "}
                    {getMaterialName(
                        design.roof_material_id
                    )}
                </div>

                <div>
                    <strong>
                        Floor:
                    </strong>{" "}
                    {getMaterialName(
                        design.floor_material_id
                    )}
                </div>
            </div>
        </div>
    );
}

function ComparisonInput({
    label,
    name,
    type,
    step,
    min,
    value,
    onChange
}) {
    return (
        <div className="comparison-field">
            <label>
                {label}
            </label>

            <input
                type={type}
                name={name}
                step={step}
                min={min}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

function ComparisonSelect({
    label,
    name,
    value,
    materials,
    onChange
}) {
    return (
        <div className="comparison-field">
            <label>
                {label}
            </label>

            <select
                name={name}
                value={value}
                onChange={onChange}
            >
                <option value="">
                    Select material
                </option>

                {materials.map((material) => (
                    <option
                        key={material.id}
                        value={material.id}
                    >
                        {material.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

function ComparisonResults({
    result
}) {
    const resultA =
        result.designA?.summary || {};

    const resultB =
        result.designB?.summary || {};

    const hourlyA =
        result.designA?.hourly_data || [];

    const hourlyB =
        result.designB?.hourly_data || [];

    return (
        <section className="comparison-results">
            <div className="comparison-results-heading">
                <span>
                    THERMAL ANALYSIS
                </span>

                <h2>
                    Comparison Results
                </h2>

                <p>
                    Both shelter configurations have
                    been simulated under the selected
                    climatic condition.
                </p>
            </div>

            <div className="comparison-result-grid">
                <ResultColumn
                    title="Design A"
                    result={resultA}
                />

                <div className="result-vs">
                    VS
                </div>

                <ResultColumn
                    title="Design B"
                    result={resultB}
                />
            </div>

            <ComparisonTemperatureChart
                hourlyA={hourlyA}
                hourlyB={hourlyB}
            />

            <ComparisonHourlyTable
                hourlyA={hourlyA}
                hourlyB={hourlyB}
            />
        </section>
    );
}

function ResultColumn({
    title,
    result
}) {
    return (
        <div className="result-column">
            <div className="result-column-title">
                {title}
            </div>

            <div className="comparison-result-metrics">
                <ResultMetric
                    label="Average Indoor Temperature"
                    value={
                        result.average_indoor_temperature
                    }
                    unit="°C"
                />

                <ResultMetric
                    label="Minimum Temperature"
                    value={
                        result.minimum_indoor_temperature
                    }
                    unit="°C"
                />

                <ResultMetric
                    label="Maximum Temperature"
                    value={
                        result.maximum_indoor_temperature
                    }
                    unit="°C"
                />

                <ResultMetric
                    label="Total Solar Gain"
                    value={
                        result.total_solar_gain
                    }
                    unit="W"
                />

                <ResultMetric
                    label="Total Heat Loss"
                    value={
                        result.total_heat_loss
                    }
                    unit="W"
                />

                <ResultMetric
                    label="Thermal Comfort Score"
                    value={
                        result.thermal_comfort_score
                    }
                    unit=""
                />
            </div>
        </div>
    );
}

function ResultMetric({
    label,
    value,
    unit
}) {
    const number =
        Number(value);

    return (
        <div className="comparison-result-metric">
            <span>
                {label}
            </span>

            <strong>
                {Number.isFinite(number)
                    ? number.toFixed(2)
                    : "—"}
                {unit ? ` ${unit}` : ""}
            </strong>
        </div>
    );
}

function ComparisonTemperatureChart({
    hourlyA,
    hourlyB
}) {
    if (
        hourlyA.length === 0 ||
        hourlyB.length === 0
    ) {
        return null;
    }

    const width = 1000;
    const height = 390;

    const padding = {
        left: 65,
        right: 30,
        top: 35,
        bottom: 50
    };

    const values = [
        ...hourlyA.map(
            (row) =>
                Number(row.indoor_temperature)
        ),
        ...hourlyB.map(
            (row) =>
                Number(row.indoor_temperature)
        )
    ].filter(Number.isFinite);

    if (values.length === 0) {
        return null;
    }

    const minValue =
        Math.min(...values, 18) - 2;

    const maxValue =
        Math.max(...values, 27) + 2;

    const innerWidth =
        width -
        padding.left -
        padding.right;

    const innerHeight =
        height -
        padding.top -
        padding.bottom;

    const getX = (index, length) => {
        if (length <= 1) {
            return padding.left;
        }

        return (
            padding.left +
            (index / (length - 1)) *
                innerWidth
        );
    };

    const getY = (value) =>
        padding.top +
        ((maxValue - value) /
            (maxValue - minValue)) *
            innerHeight;

    const buildPath = (data) =>
        data
            .map((row, index) => {
                const value =
                    Number(
                        row.indoor_temperature
                    );

                const x = getX(
                    index,
                    data.length
                );

                const y = getY(value);

                return `${
                    index === 0
                        ? "M"
                        : "L"
                } ${x} ${y}`;
            })
            .join(" ");

    const pathA =
        buildPath(hourlyA);

    const pathB =
        buildPath(hourlyB);

    const gridLines = Array.from(
        { length: 5 },
        (_, index) => {
            const value =
                minValue +
                ((maxValue -
                    minValue) /
                    4) *
                    index;

            return {
                value,
                y: getY(value)
            };
        }
    );

    return (
        <div className="comparison-chart-card">
            <div className="comparison-chart-header">
                <div>
                    <h3>
                        Indoor Temperature Comparison
                    </h3>

                    <p>
                        Hour-by-hour indoor temperature
                        for both shelter configurations.
                    </p>
                </div>

                <div className="comparison-chart-legend">
                    <span>
                        <i className="legend-a"></i>
                        Design A
                    </span>

                    <span>
                        <i className="legend-b"></i>
                        Design B
                    </span>
                </div>
            </div>

            <div className="comparison-chart-wrapper">
                <svg
                    className="comparison-chart"
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                >
                    <rect
                        x={padding.left}
                        y={getY(27)}
                        width={innerWidth}
                        height={
                            getY(18) -
                            getY(27)
                        }
                        className="comparison-comfort-zone"
                    />

                    {gridLines.map(
                        (line, index) => (
                            <g key={index}>
                                <line
                                    x1={
                                        padding.left
                                    }
                                    x2={
                                        width -
                                        padding.right
                                    }
                                    y1={line.y}
                                    y2={line.y}
                                    className="comparison-grid-line"
                                />

                                <text
                                    x={
                                        padding.left -
                                        10
                                    }
                                    y={
                                        line.y +
                                        4
                                    }
                                    textAnchor="end"
                                    className="comparison-axis-label"
                                >
                                    {line.value.toFixed(
                                        0
                                    )}
                                </text>
                            </g>
                        )
                    )}

                    <line
                        x1={padding.left}
                        x2={
                            width -
                            padding.right
                        }
                        y1={
                            getY(18)
                        }
                        y2={
                            getY(18)
                        }
                        className="comparison-comfort-boundary"
                    />

                    <line
                        x1={padding.left}
                        x2={
                            width -
                            padding.right
                        }
                        y1={
                            getY(27)
                        }
                        y2={
                            getY(27)
                        }
                        className="comparison-comfort-boundary"
                    />

                    <line
                        x1={padding.left}
                        x2={padding.left}
                        y1={padding.top}
                        y2={
                            height -
                            padding.bottom
                        }
                        className="comparison-axis-line"
                    />

                    <line
                        x1={padding.left}
                        x2={
                            width -
                            padding.right
                        }
                        y1={
                            height -
                            padding.bottom
                        }
                        y2={
                            height -
                            padding.bottom
                        }
                        className="comparison-axis-line"
                    />

                    <path
                        d={pathA}
                        className="comparison-line line-a"
                    />

                    <path
                        d={pathB}
                        className="comparison-line line-b"
                    />

                    {hourlyA.map(
                        (row, index) => {
                            const value =
                                Number(
                                    row.indoor_temperature
                                );

                            if (
                                !Number.isFinite(
                                    value
                                )
                            ) {
                                return null;
                            }

                            return (
                                <circle
                                    key={`a-${index}`}
                                    cx={getX(
                                        index,
                                        hourlyA.length
                                    )}
                                    cy={getY(
                                        value
                                    )}
                                    r="3"
                                    className="comparison-point point-a"
                                />
                            );
                        }
                    )}

                    {hourlyB.map(
                        (row, index) => {
                            const value =
                                Number(
                                    row.indoor_temperature
                                );

                            if (
                                !Number.isFinite(
                                    value
                                )
                            ) {
                                return null;
                            }

                            return (
                                <circle
                                    key={`b-${index}`}
                                    cx={getX(
                                        index,
                                        hourlyB.length
                                    )}
                                    cy={getY(
                                        value
                                    )}
                                    r="3"
                                    className="comparison-point point-b"
                                />
                            );
                        }
                    )}
                </svg>
            </div>

            <div className="comparison-chart-note">
                The shaded region represents the prototype
                thermal comfort range of 18–27°C.
            </div>
        </div>
    );
}

function ComparisonHourlyTable({
    hourlyA,
    hourlyB
}) {
    const rowCount = Math.min(
        hourlyA.length,
        hourlyB.length
    );

    return (
        <div className="comparison-hourly-card">
            <div className="comparison-chart-header">
                <div>
                    <h3>
                        Hourly Comparison
                    </h3>

                    <p>
                        Thermal response of both designs
                        at each simulated hour.
                    </p>
                </div>
            </div>

            <div className="table-container">
                <table className="comparison-hourly-table">
                    <thead>
                        <tr>
                            <th>
                                Hour
                            </th>

                            <th>
                                Outdoor °C
                            </th>

                            <th>
                                Design A °C
                            </th>

                            <th>
                                Design B °C
                            </th>

                            <th>
                                A Solar Gain
                            </th>

                            <th>
                                B Solar Gain
                            </th>

                            <th>
                                A Heat Loss
                            </th>

                            <th>
                                B Heat Loss
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from(
                            {
                                length: rowCount
                            },
                            (_, index) => {
                                const rowA =
                                    hourlyA[
                                        index
                                    ];

                                const rowB =
                                    hourlyB[
                                        index
                                    ];

                                return (
                                    <tr
                                        key={
                                            index
                                        }
                                    >
                                        <td>
                                            {rowA.hour}
                                        </td>

                                        <td>
                                            {Number(
                                                rowA.outdoor_temperature
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            {Number(
                                                rowA.indoor_temperature
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            {Number(
                                                rowB.indoor_temperature
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            {Number(
                                                rowA.solar_gain ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            {Number(
                                                rowB.solar_gain ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            {Number(
                                                rowA.heat_loss ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            {Number(
                                                rowB.heat_loss ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Comparison;