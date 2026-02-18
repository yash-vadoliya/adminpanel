import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Ensure Bootstrap CSS is imported globally in your main index.js or App.js file.

const SPLASH_DURATION_MS = 5000; // 5 seconds

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Set a timer to redirect the user after 10 seconds
        const timer = setTimeout(() => {
            console.log("Splash screen duration finished. Redirecting to login...");
            navigate('/adminlogin');
        }, SPLASH_DURATION_MS);

        // Cleanup function to clear the timer on unmount
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        // 1. Full viewport height (vh-100)
        // 2. Centering content (d-flex, justify-content-center, align-items-center)
        // 3. Background color: Changed to white (bg-white)
        <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
            <div className="text-center p-4">

                {/* 4. Title: Adjusted for dark text on white background (text-dark) */}
                <h1 className="display-4 fw-bold text-dark mb-3">
                    Welcome to the Bus Travel System
                </h1>

                {/* 5. Subtitle: Muted text for subtle look */}
                <p className="lead text-muted mb-4">
                    Loading application...
                </p>

                {/* 6. Bootstrap Spinner */}
                <div className="d-flex justify-content-center">
                    {/* The text-primary gives it a standard Bootstrap blue color */}
                    <div className="spinner-border text-primary" role="status"
                        style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;