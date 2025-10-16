import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import ROLES from './Role';
import { AuthProvider } from "./AuthContext";
import PrivateRoute from "./PrivateRoute";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Deshboard from "./pages/Deshboard";
import Mapview from "./pages/Mapview";
import Geofance from "./pages/Geofance";
import Stops from "./pages/Stops";
import My_Routes from "./pages/Routes";
import Vehicles from "./pages/Vehicles";
import Fare from "./pages/Fare";
import Trip from "./pages/Trip";
import Analytics from "./pages/Analytics";
import Cencellation from './pages/Cencellation';
import Promotion from './pages/Promotion';
import SuggestedRoutes from "./pages/SuggestedRoutes";
import Holiday from "./pages/Holiday";
import Customer from "./pages/Customer";

// Layout component for pages with sidebar
function Layout({ isSidebarExpanded, toggleSidebar }) {
  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar */}
      <Sidebar isExpanded={isSidebarExpanded} toggle={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`main-content ${isSidebarExpanded ? "expanded" : "collapsed"}`}
        style={{
          flexGrow: 1,
          transition: "all 0.3s ease",
          padding: "20px",
        }}
      >
        <Outlet /> {/* 👈 nested route content renders here */}
      </div>
    </div> 
  );
}

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
   
  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  const SuperAdmin = ROLES.SUPER_ADMIN;
  const Admin = ROLES.ADMIN;
  const Manager = ROLES.MANAGER;
  const Travel_manager = ROLES.TRAVEL_MANAGER;
  const Operator = ROLES.OPERATOER;
  const Enduser = ROLES.END_USER;


  return (
    <AuthProvider>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes with sidebar+header */}
        <Route
          element={
            <>
              <Header />
              <Layout isSidebarExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar}/>
            </>
          }
        >
          <Route path="/dashboard" element={<PrivateRoute><Deshboard /></PrivateRoute>} />
          <Route path="/mapview" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Mapview /></PrivateRoute>} />
          <Route path="/geofance" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Geofance /></PrivateRoute>} />
          <Route path="/stops" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Stops /></PrivateRoute>} />
          <Route path="/routes" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><My_Routes /></PrivateRoute>} />
          <Route path="/vehicles" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Vehicles /></PrivateRoute>} />
          <Route path="/fare" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Fare /></PrivateRoute>} />
          <Route path="/trip" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Trip /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Analytics /></PrivateRoute>} />
          <Route path="/cancel" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Cencellation /></PrivateRoute>} />
          <Route path="/promo" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Promotion /></PrivateRoute>} />
          <Route path="/suggestedroutes" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><SuggestedRoutes /></PrivateRoute>} />
          <Route path="/holiday" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Holiday /></PrivateRoute>} />
          <Route path="/customer" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Customer /></PrivateRoute>} />

        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
