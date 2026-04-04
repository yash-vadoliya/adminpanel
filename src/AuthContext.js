import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 runs once and when token changes
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        const userData = {
          user_id: decoded.user_id || null,
          role_id: decoded.role_id || null,
        };

        setUser(userData);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Invalid token", err);
        logout();
      }
    } else {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    setToken(newToken); // ✅ only token
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
