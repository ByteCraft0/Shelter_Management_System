
function Home({ onStartSimulation, onCompare }) {

    return (

        <div className="home-page">

            <section className="home-hero">

                <div className="home-hero-content">

                    <p className="eyebrow">
                        SIH 2026 • SIH26051 • DRDO
                    </p>

                    <h1>
                        Area-Specific Passive Shelter
                        <span> Thermal Simulator</span>
                    </h1>

                    <p className="home-description">
                        Design, simulate and compare passive shelter
                        configurations according to local climatic
                        conditions.
                    </p>

                    <div className="home-actions">

                        <button
                            className="home-primary-button"
                            onClick={onStartSimulation}
                        >
                            Design &amp; Simulate
                        </button>

                        <button
                            className="home-secondary-button"
                            onClick={onCompare}
                        >
                            Compare Designs
                        </button>

                    </div>

                </div>

                <div className="home-visual">

                    <div className="thermal-visual">

                        <div className="visual-sun">
                            ☀
                        </div>

                        <div className="visual-shelter">

                            <div className="shelter-roof"></div>

                            <div className="shelter-body">

                                <div className="shelter-window"></div>

                                <div className="shelter-door"></div>

                            </div>

                        </div>

                        <div className="visual-ground"></div>

                        <div className="temperature-card">

                            <span>THERMAL ANALYSIS</span>

                            <strong>24h Simulation</strong>

                            <small>
                                Indoor temperature response
                            </small>

                        </div>

                    </div>

                </div>

            </section>

            <section className="home-features">

                <div className="home-section-heading">

                    <span>PLATFORM CAPABILITIES</span>

                    <h2>
                        From shelter design to thermal comparison
                    </h2>

                    <p>
                        A single platform for analysing how climate,
                        materials, geometry and openings affect
                        shelter thermal behaviour.
                    </p>

                </div>

                <div className="feature-grid">

                    <div className="feature-card">

                        <div className="feature-icon">
                            01
                        </div>

                        <h3>
                            Climate Input
                        </h3>

                        <p>
                            Enter outdoor temperature, solar
                            radiation, wind speed and humidity
                            for the selected location.
                        </p>

                    </div>

                    <div className="feature-card">

                        <div className="feature-icon">
                            02
                        </div>

                        <h3>
                            Shelter Design
                        </h3>

                        <p>
                            Configure dimensions, orientation,
                            materials, wall thickness and
                            thermal properties.
                        </p>

                    </div>

                    <div className="feature-card">

                        <div className="feature-icon">
                            03
                        </div>

                        <h3>
                            Thermal Simulation
                        </h3>

                        <p>
                            Simulate the shelter's thermal
                            response over 24, 48 or 72 hours.
                        </p>

                    </div>

                    <div className="feature-card">

                        <div className="feature-icon">
                            04
                        </div>

                        <h3>
                            Design Comparison
                        </h3>

                        <p>
                            Compare two shelter configurations
                            using temperature, heat loss,
                            solar gain and comfort results.
                        </p>

                    </div>

                </div>

            </section>

            <section className="home-workflow">

                <div className="home-section-heading">

                    <span>HOW IT WORKS</span>

                    <h2>
                        A simple thermal analysis workflow
                    </h2>

                </div>

                <div className="workflow">

                    <div className="workflow-step">
                        <strong>01</strong>
                        <span>Climate</span>
                    </div>

                    <div className="workflow-arrow">
                        →
                    </div>

                    <div className="workflow-step">
                        <strong>02</strong>
                        <span>Design</span>
                    </div>

                    <div className="workflow-arrow">
                        →
                    </div>

                    <div className="workflow-step">
                        <strong>03</strong>
                        <span>Simulate</span>
                    </div>

                    <div className="workflow-arrow">
                        →
                    </div>

                    <div className="workflow-step">
                        <strong>04</strong>
                        <span>Compare</span>
                    </div>

                    <div className="workflow-arrow">
                        →
                    </div>

                    <div className="workflow-step">
                        <strong>05</strong>
                        <span>Optimize</span>
                    </div>

                </div>

            </section>

        </div>

    );

}

export default Home;

