import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";  // ✅ named import

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          user_id: decoded.user_id || null,
          role_id: decoded.role_id || null,
          token
        }); // decoded payload must include user_id
      } catch (err) {
        console.error("Invalid token:", err);
        setUser(null);
      }
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    try {
      const decoded = jwtDecode(newToken);
      setUser({
        user_id: decoded.user_id || null,
        role_id: decoded.role_id || null,
        token: newToken
      });
    } catch (err) {
      console.error("Invalid token:", err);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
