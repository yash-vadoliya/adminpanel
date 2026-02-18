import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLogo from "../images/applogo.png";

const SPLASH_DURATION_MS = 5000;

const SplashHome = () => {
     const navigate = useNavigate();
     const [progress, setProgress] = useState(0);

     useEffect(() => {
          const intervalTime = 50;
          const increment = 100 / (SPLASH_DURATION_MS / intervalTime);

          const interval = setInterval(() => {
               setProgress((prev) => {
                    if (prev >= 100) {
                         clearInterval(interval);
                         return 100;
                    }
                    return prev + increment;
               });
          }, intervalTime);

          const timer = setTimeout(() => {
               navigate("/applogin");
          }, SPLASH_DURATION_MS);

          return () => {
               clearInterval(interval);
               clearTimeout(timer);
          };
     }, [navigate]);

     return (
          <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
               <div
                    className="text-center px-4"
                    style={{ maxWidth: "420px", width: "100%" }}
               >
                    {/* Logo */}
                    <img
                         src={AppLogo}
                         alt="Bus Booking System"
                         style={{ width: "400px", marginBottom: "10px" }}
                    />

                    {/* Title */}
                    <h2 className="fw-bold text-dark mb-2">
                         Welcome to <br /> Bus Ride Service
                    </h2>

                    {/* Subtitle */}
                    <p className="text-muted mb-4">
                         Best Bus Booking System
                    </p>

                    {/* Progress Bar */}
                    <div className="progress rounded-pill" style={{ height: "6px" }}>
                         <div
                              className="progress-bar progress-bar-striped progress-bar-animated"
                              role="progressbar"
                              style={{ width: `${progress}%` }}
                              aria-valuenow={progress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                         />
                    </div>

                    {/* Loading Text */}
                    <small className="text-muted d-block mt-2">
                         Loading… {Math.round(progress)}%
                    </small>
               </div>
          </div>
     );
};

export default SplashHome;
