import React from "react";
import { useNavigate } from "react-router-dom";


function AppHeader() {
     const navigate = useNavigate();

     const handleLogout = () => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
     };
     return (
          <>
               <nav className="navbar navbar-expand-lg navbar-light sticky-top bg-light border-bottom px-3">
                    <div className="container">
                         <a className="navbar-brand d-flex align-items-center" href="/">
                              <span className="fs-4 fw-bold text-dark">Bus Rider</span>
                         </a>

                         {/* Mobile toggle button */}
                         <button
                              className="navbar-toggler"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#mainNavbar"
                              aria-controls="mainNavbar"
                              aria-expanded="false"
                              aria-label="Toggle navigation"
                         >
                              <span className="navbar-toggler-icon"></span>
                         </button>

                         {/* Collapsible menu */}
                         <div className="collapse navbar-collapse" id="mainNavbar">
                              <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">

                                   <li className="nav-item">
                                        <a className="nav-link text-dark" href="/home">Home</a>
                                   </li>

                                   <li className="nav-item">
                                        <a className="nav-link text-dark" href="/features">Features</a>
                                   </li>

                                   {/* User dropdown */}
                                   <li className="nav-item dropdown">
                                        <a
                                             className="nav-link dropdown-toggle text-dark"
                                             href="#"
                                             id="navbarDropdown"
                                             role="button"
                                             data-bs-toggle="dropdown"
                                             aria-expanded="false"
                                        >
                                             User
                                        </a>

                                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                             <li><a className="dropdown-item" href="/profile">Profile</a></li>
                                             <li><hr className="dropdown-divider" /></li>
                                             <li>
                                                  <button className="dropdown-item text-danger d-flex align-items-center" onClick={handleLogout}>
                                                       <i className="bi bi-box-arrow-right me-2"></i>
                                                       Logout
                                                  </button>
                                             </li>

                                        </ul>
                                   </li>

                              </ul>
                         </div>
                    </div>
               </nav>

          </>
     );
}

export default AppHeader;
