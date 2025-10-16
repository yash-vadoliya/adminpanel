import React, { useContext, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AuthContext } from "../AuthContext";
import ROLES from "../Role";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(true);
  const [shuttleOpen, setShuttleOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);

  const SuperAdmin = ROLES.SUPER_ADMIN;
  const Admin = ROLES.ADMIN;
  const Manager = ROLES.MANAGER;
  const Travel_manager = ROLES.TRAVEL_MANAGER;
  const Operator = ROLES.OPERATOER;
  const Enduser = ROLES.END_USER;

  const toggleSetting = () => {
    setSettingOpen(!settingOpen);
  };

  const toggleUser = () => {
    setUserOpen(!userOpen);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleShuttle = () => {
    setShuttleOpen(!shuttleOpen);
  };

  return (
    <div
      className={`d-flex flex-column flex-shrink-0 p-3 bg-light  border-end position-relative`}
      style={{ width: isExpanded ? "280px" : "80px", transition: "width 0.3s", height: '100vh' }}
    >
      {/* Top Section */}
      <div className="d-flex align-items-center justify-content-between mb-3 ">
        {isExpanded && <span className="fs-5 fw-bold">Menu</span>}
        <button
          className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2"
          onClick={toggleSidebar}
        >
          <i
            className={`bi ${isExpanded ? "bi-chevron-left" : "bi-chevron-right"
              }`}
          />
        </button>
      </div>

      <hr />

      {/* Menu */}
      <ul className="nav nav-pills flex-column mb-auto fs-5">
        {/* Dashboard */}
        <li>
          <a href='/dashboard' className="nav-link text-dark d-flex align-items-center">
            <i className="bi bi-speedometer2 me-2"></i>
            {isExpanded && "Dashboard"}
          </a>
        </li>

        {/* Shuttle (submenu) */}
        <li>
          <button
            className="btn btn-toggle align-items-center rounded nav-link text-dark w-100 d-flex justify-content-between"
            onClick={toggleShuttle}
          >
            <span className="d-flex align-items-center">
              <i className="bi bi-table me-2"></i>
              {isExpanded && "Shuttle"}
            </span>
            {isExpanded && (
              <i
                className={`bi ${shuttleOpen ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
              ></i>
            )}
          </button>
          {shuttleOpen && isExpanded && (
            <ul className="nav flex-column ms-4 mt-2" >
              <li>{user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="/stops" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-geo-alt me-2"></i>
                  Stops
                </a>
              )}

              </li>
              <li>
                {user && [SuperAdmin, Admin].includes(user.role_id) && (
                  <a href="/routes" className="nav-link text-dark d-flex align-items-center">
                    <i className="bi bi-signpost-2 me-2"></i>
                    Routes
                  </a>
                )}
              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="/vehicles" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-truck me-2"></i>
                  Vehicles
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="/fare" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-cash-stack me-2"></i>
                  Fare
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="/trip" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-calendar2-week me-2"></i>
                  Trips
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="/analytics" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-graph-up-arrow me-2"></i>
                  Analytics
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="#" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-x-circle me-2"></i>
                  Cancellation
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="#" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Cancellation Reasons
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="/promo" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-megaphone me-2"></i>
                  Promotions
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="/suggestedroutes" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-compass me-2"></i>
                  Suggested Routes
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="/holiday" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-calendar-event me-2"></i>
                  Holiday
                </a>
              )}

              </li>
            </ul>

          )}
        </li>

        {/* Other main menu items */}
        <li>  {user && [SuperAdmin, Admin].includes(user.role_id) && (
          <a href="/mapview" className="nav-link text-dark d-flex align-items-center">
            <i className="bi bi-map me-2"></i>
            {isExpanded && "Map View"}
          </a>
        )}

        </li>
        <li>
          <button
            className="btn btn-toggle align-items-center rounded nav-link text-dark w-100 d-flex justify-content-between"
            onClick={toggleUser} // 👈 use state
          >
            <span className="d-flex align-items-center">
              <i className="bi bi-people me-2"></i>
              {isExpanded && "User"}
            </span>
            {isExpanded && (
              <i
                className={`bi ${userOpen ? "bi-chevron-up" : "bi-chevron-down"}`}
              ></i>
            )}
          </button>

          {userOpen && isExpanded && (
            <ul className="nav flex-column ms-4 mt-2">
              <li>  {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="/customer" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Customers
                </a>
              )}

              </li>
              <li>  {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="#" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-person-badge me-2"></i>
                  Drivers
                </a>
              )}

              </li>
            </ul>
          )}
        </li>

        <li>  {user && [SuperAdmin, Admin].includes(user.role_id) && (
          <a href="#" className="nav-link text-dark d-flex align-items-center">
            <i className="bi bi-person-x me-2"></i>
            {isExpanded && "Delete Account Request"}
          </a>
        )}

        </li>
        <li>  {user && [SuperAdmin, Admin].includes(user.role_id) && (
          <a href="#" className="nav-link text-dark d-flex align-items-center">
            <i className="bi bi-truck me-2"></i>
            {isExpanded && "Vehicle Type"}
          </a>
        )}

        </li>
        <li>  {user && [SuperAdmin, Admin].includes(user.role_id) && (
          <a href="/geofance" className="nav-link text-dark d-flex align-items-center">
            <i className="bi bi-geo-alt-fill me-2"></i>
            {isExpanded && "Geofence"}
          </a>
        )}

        </li>
        <li>
          <button
            className="btn btn-toggle align-items-center rounded nav-link text-dark w-100 d-flex justify-content-between"
            onClick={toggleSetting} // 👈 new state for Settings
          >
            <span className="d-flex align-items-center">
              <i className="bi bi-gear me-2"></i>
              {isExpanded && "Setting"}
            </span>
            {isExpanded && (
              <i
                className={`bi ${settingOpen ? "bi-chevron-up" : "bi-chevron-down"}`}
              ></i>
            )}
          </button>

          {settingOpen && isExpanded && (
            <ul className="nav flex-column ms-4 mt-2">
              <li>  {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="#" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-sliders me-2"></i>
                  General Setting
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="#" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-building me-2"></i>
                  City
                </a>
              )}

              </li>
              <li> {user && [SuperAdmin, Admin].includes(user.role_id) && (
                <a href="#" className="nav-link text-dark d-flex align-items-center">
                  <i className="bi bi-person-gear me-2"></i>
                  Manager Setting
                </a>
              )}

              </li>
            </ul>
          )}
        </li>

      </ul>
    </div>
  );
};

export default Sidebar;
