import { useState } from "react";
import "./App.css";

import Home from "./pages/Home";
import Simulation from "./pages/Simulation";
import Comparison from "./pages/Comparison";
import History from "./pages/History";

function App() {
    const [currentPage, setCurrentPage] = useState("home");

    function goToPage(page) {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    }

    function goHome() {
        goToPage("home");
    }

    function goToSimulation() {
        goToPage("simulation");
    }

    function goToComparison() {
        goToPage("comparison");
    }

    function goToHistory() {
        goToPage("history");
    }

    return (
        <div className="app">

            {/* =================================================
                TOP NAVIGATION
            ================================================= */}

            <header className="top-header">

                <div
                    className="brand"
                    onClick={goHome}
                    style={{ cursor: "pointer" }}
                >
                    <div className="brand-title">
                        Shelter Thermal System
                    </div>

                    <div className="brand-subtitle">
                        Thermal Comfort &amp; Design Platform
                    </div>
                </div>


                <nav className="main-navigation">

                    <button
                        className={
                            currentPage === "home"
                                ? "nav-button active"
                                : "nav-button"
                        }
                        onClick={goHome}
                    >
                        Home
                    </button>


                    <button
                        className={
                            currentPage === "simulation"
                                ? "nav-button active"
                                : "nav-button"
                        }
                        onClick={goToSimulation}
                    >
                        Design &amp; Simulate
                    </button>


                    <button
                        className={
                            currentPage === "comparison"
                                ? "nav-button active"
                                : "nav-button"
                        }
                        onClick={goToComparison}
                    >
                        Compare Designs
                    </button>


                    <button
                        className={
                            currentPage === "history"
                                ? "nav-button active"
                                : "nav-button"
                        }
                        onClick={goToHistory}
                    >
                        Simulation History
                    </button>

                </nav>

            </header>


            {/* =================================================
                PAGE CONTENT
            ================================================= */}

            <main>

                {/* HOME PAGE */}

                {currentPage === "home" && (
                    <Home
                        onNavigate={goToPage}
                        onStartSimulation={goToSimulation}
                        onCompare={goToComparison}
                        onHistory={goToHistory}
                    />
                )}


                {/* SIMULATION PAGE */}

                {currentPage === "simulation" && (
                    <Simulation
                        onBack={goHome}
                        onNavigate={goToPage}
                    />
                )}


                {/* COMPARISON PAGE */}

                {currentPage === "comparison" && (
                    <Comparison
                        onBack={goHome}
                        onNavigate={goToPage}
                    />
                )}


                {/* HISTORY PAGE */}

                {currentPage === "history" && (
                    <History
                        onBack={goHome}
                        onNavigate={goToPage}
                    />
                )}

            </main>

        </div>
    );
}

export default App;