import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import "./App.css";

import ROLES from "./Role";

import PrivateRoute from "./PrivateRoute";

/* ================= COMPONENTS ================= */
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AppHeader from "./components/AppHeader";

/* ================= USER APP ================= */
import Home from "./app/home";
import SplashHome from "./app/SplceHome";
import Applogin from "./app/Applogin";
import AppRegister from "./app/AppRegister";
import Features from "./app/features";
import Profile from "./app/Profile";

// import SeatSelcetion from "./app/SeatSelcetion";

/* ================= ADMIN ================= */
import Login from "./pages/Login";
import SplashScreen from "./pages/SplashScreen";
import Deshboard from "./pages/Deshboard";
import AddUser from "./pages/AddUser";
import Travel from "./pages/Travel";
import Mapview from "./pages/Mapview";
import Geofance from "./pages/Geofance";
import Stops from "./pages/Stops";
import My_Routes from "./pages/Routes";
import Vehicles from "./pages/Vehicles";
import Fare from "./pages/Fare";
import Trip from "./pages/Trip";
import Analytics from "./pages/Analytics";
import Cencellation from "./pages/Cencellation";
import CancelReason from "./pages/CancelReason";
import Promotion from "./pages/Promotion";
import SuggestedRoutes from "./pages/SuggestedRoutes";
import Holiday from "./pages/Holiday";
import Customer from "./pages/Customer";
import Driver from "./pages/Driver";
import City from "./pages/City";
import DeleteAccount from "./pages/DeleteAccount";
import DriverDocuments from "./pages/DriverDoc";

/* ================= LAYOUTS ================= */

/* Public layout (NO HEADER) */
const PublicLayout = () => <Outlet />;

/* User layout (WITH AppHeader) */
const UserLayout = () => (
  <>
    <AppHeader />
    <div >
      <Outlet />
    </div>
  </>
);

/* Admin layout (Header + Sidebar) */
const AdminLayout = ({ isSidebarExpanded, toggleSidebar }) => {
  return (
    <>
      <Header />
      <div className="dashboard-container d-flex">
        <Sidebar isExpanded={isSidebarExpanded} toggle={toggleSidebar} />

        <div
          className={`main-content ${isSidebarExpanded ? "expanded" : "collapsed"
            }`}
          style={{
            flexGrow: 1,
            transition: "all 0.3s ease",
            // padding: "20px",
          }}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

/* ================= APP ================= */

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  const SuperAdmin = ROLES.SUPER_ADMIN;
  const Admin = ROLES.ADMIN;

  return (

    <Routes>

      {/* ========== PUBLIC ========= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<SplashHome />} />
        <Route path="/applogin" element={<Applogin />} />
        <Route path="/appregister" element={<AppRegister />} />
      </Route>

      {/* ========== USER ========= */}
      <Route element={<UserLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* ========== ADMIN PUBLIC ========= */}
      <Route path="/admin" element={<SplashScreen />} />
      <Route path="/adminlogin" element={<Login />} />

      {/* ========== ADMIN PROTECTED ========= */}
      <Route
        element={
          <AdminLayout
            isSidebarExpanded={isSidebarExpanded}
            toggleSidebar={toggleSidebar}
          />
        }
      >
        <Route path="/dashboard" element={<PrivateRoute><Deshboard /></PrivateRoute>} />
        <Route path="/adduser" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><AddUser /></PrivateRoute>} />
        <Route path="/travel" element={<PrivateRoute allowedRoles={[SuperAdmin, Admin]}><Travel /></PrivateRoute>} />
        <Route path="/mapview" element={<PrivateRoute><Mapview /></PrivateRoute>} />
        <Route path="/geofance" element={<PrivateRoute><Geofance /></PrivateRoute>} />
        <Route path="/stops" element={<PrivateRoute><Stops /></PrivateRoute>} />
        <Route path="/routes" element={<PrivateRoute><My_Routes /></PrivateRoute>} />
        <Route path="/vehicles" element={<PrivateRoute><Vehicles /></PrivateRoute>} />
        <Route path="/fare" element={<PrivateRoute><Fare /></PrivateRoute>} />
        <Route path="/trip" element={<PrivateRoute><Trip /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/cancel" element={<PrivateRoute><Cencellation /></PrivateRoute>} />
        <Route path="/cancelreason" element={<PrivateRoute><CancelReason /></PrivateRoute>} />
        <Route path="/promo" element={<PrivateRoute><Promotion /></PrivateRoute>} />
        <Route path="/suggestedroutes" element={<PrivateRoute><SuggestedRoutes /></PrivateRoute>} />
        <Route path="/holiday" element={<PrivateRoute><Holiday /></PrivateRoute>} />
        <Route path="/customer" element={<PrivateRoute><Customer /></PrivateRoute>} />
        <Route path="/driver" element={<PrivateRoute><Driver /></PrivateRoute>} />
        <Route path="/city" element={<PrivateRoute><City /></PrivateRoute>} />
        <Route path="/deleteaccount" element={<PrivateRoute><DeleteAccount /></PrivateRoute>} />
        <Route path="/driverdoc" element={<PrivateRoute><DriverDocuments /></PrivateRoute>} />
      </Route>

    </Routes>

  );
}

export default App;
