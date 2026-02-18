import { useContext, useState, useCallback } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";

export default function useCancellation() {
  const { token } = useContext(AuthContext);

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/cancel`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setPolicies(result[0] || []);
    } catch (error) {
      console.error("Error fetching cancellation policies:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    policies,
    loading,
    fetchPolicies,
  };
}
