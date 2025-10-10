import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
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
import Promotion from "./pages/Promotion";

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
          <Route path="/deshboard" element={<PrivateRoute><Deshboard /></PrivateRoute>} />
          <Route path="/mapview" element={<PrivateRoute><Mapview /></PrivateRoute>} />
          <Route path="/geofance" element={<PrivateRoute><Geofance /></PrivateRoute>} />
          <Route path="/stops" element={<PrivateRoute><Stops /></PrivateRoute>} />
          <Route path="/routes" element={<PrivateRoute><My_Routes /></PrivateRoute>} />
          <Route path="/vehicles" element={<PrivateRoute><Vehicles /></PrivateRoute>} />
          <Route path="/fare" element={<PrivateRoute><Fare /></PrivateRoute>} />
          <Route path="/trip" element={<PrivateRoute><Trip /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/promotion" element={<PrivateRoute><Promotion /></PrivateRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
