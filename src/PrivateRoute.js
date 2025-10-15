import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { token, user } = useContext(AuthContext);

  // 1️⃣ Not logged in → redirect to login
  if (!token) return <Navigate to="/login" />;

  // 2️⃣ User data is still loading → show loading
  if (!user) return <div className="text-center mt-5">Loading...</div>;

  // 3️⃣ Role-based access check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_id)) {
    return (
      <div className="text-center mt-5 text-danger">
        <h3>Access Denied</h3>
        <p>You don’t have permission to view this page.</p>
      </div>
    );
  }

  // 4️⃣ Allowed → render children
  return children;
};

export default PrivateRoute;
