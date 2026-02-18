import { useEffect, useState } from "react";
import CONFIG from "../Config";

const useDrivers = (token) => {
     const [drivers, setDrivers] = useState([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     const fetchDrivers = async () => {
          setLoading(true);
          setError(null);

          try {
               const res = await fetch(`${CONFIG.API_BASE_URL}/driver`, {
                    method: "GET",
                    headers: {
                         Authorization: `Bearer ${token}`,
                    },
               });
               const data = await res.json();
               setDrivers(data?.[0] || []);
          } catch (err) {
               console.error("Fetch Driver Error:", err);
               setError(err);
               setDrivers([]);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          if (token) fetchDrivers();
     }, [token]);

     return {
          drivers,
          loading,
          error,
          fetchDrivers,
     };
};

export default useDrivers;
