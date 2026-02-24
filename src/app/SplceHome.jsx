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
          <div className="d-flex justify-content-center align-items-center vh-100 bg-white px-3">
               <div
                    className="text-center w-100"
                    style={{ maxWidth: "420px" }}
               >
                    {/* Logo */}
                    <img
                         src={AppLogo}
                         alt="Bus Booking System"
                         className="img-fluid mb-3"
                         style={{ maxWidth: "250px", width: "100%" }}
                    />

                    {/* Title */}
                    <h2 className="fw-bold text-dark mb-2 fs-4 fs-md-3">
                         Welcome to <br /> Bus Ride Service
                    </h2>

                    {/* Subtitle */}
                    <p className="text-muted mb-4 small">
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
