import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";

export default function useAll() {
     const { token, user } = useContext(AuthContext);

     const [route, setRoutes] = useState([]);
     const [trips, setTrips] = useState([]);
     const [routestop, setRouteStop] = useState([]);
     const [thresholds, setThresholds] = useState([]);
     const [promo, setPromo] = useState([]);
     const [travel, setTravel] = useState([]);

     const [loading, setLoading] = useState(false);

     const fetchRoutes = async () => {
          try {
               setLoading(true);
               const res = await fetch(`${CONFIG.API_BASE_URL}/route`, {
                    headers: {
                         "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,
                    },
               });
               const result = await res.json();
               const activeRoutes = result[0]
                    ? result[0].filter(route => route.record_status == 1)
                    : [];
               console.log("Route:", activeRoutes);
               setRoutes(activeRoutes);
          } catch (err) {
               console.error("Route error:", err);
               setRoutes([]);
          } finally {
               setLoading(false);
          }
     };

     const fetchRouteStop = async (route_id) => {
          try {
               setLoading(true);
               const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/${route_id}`, {
                    headers: {
                         "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,
                    },
               });
               const result = await res.json();
               // console.log("Route Stop:", result[0]);
               setRouteStop(result[0]);
               return result[0];
          } catch (err) {
               console.error("Route error:", err);
               setRoutes([]);
          } finally {
               setLoading(false);
          }
     }

     const fetchTrips = async () => {
          try {
               setLoading(true);
               const res = await fetch(`${CONFIG.API_BASE_URL}/trip`, {
                    method: "GET",
                    headers: {
                         "Content-type": "application/json",
                         Authorization: `Bearer ${token}`,
                    },
               });
               if (!res.ok) throw new Error(`Error: ${res.status}`);
               const Trip = await res.json();
               const flatTrips = Trip.flat();
               console.log("Trip:", Trip);
               // console.log("Trips from DB:", Trip);
               console.log("Trips Count:", Trip.length);

               setTrips(Trip[0]);
          } catch (err) {
               console.log("Error fetching trips:", err);
          } finally {
               setLoading(false);
          }
     };

     const fetchThreshold = async (policy_id) => {
          try {
               // console.log(policy_id);
               setLoading(true);
               const res = await fetch(`${CONFIG.API_BASE_URL}/thresholds/policy/${policy_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
               });
               const data = await res.json();
               // console.log("Thresholds:", data[0]);
               setThresholds(data[0] || []);
          } catch (err) {
               console.error("fetchThresholds error:", err);
          }
     };

     const fetchPromo = async (promotion_id) => {
          try {
               setLoading(true);
               const res = await fetch(`${CONFIG.API_BASE_URL}/promotions/${promotion_id}`, {
                    method: "GET",
                    headers: {
                         "Content-type": "application/json",
                         Authorization: `Bearer ${token}`,
                    },
               });
               if (!res.ok) throw new Error(`Error: ${res.status}`);
               const data = await res.json();
               setPromo(data[0]);
               console.log("Promotions:", data);
          } catch (err) {
               console.log("Error fetching data:", err);
          } finally {
               setLoading(false);
          }
     };

     const fetchTravels = async () => {

          try {
               let res;
               setLoading(true);
               res = await fetch(`${CONFIG.API_BASE_URL}/travel`, {
                    headers: { Authorization: `Bearer ${token}` },
               });
               const result = await res.json();
               // console.log("Travel Data :", result);
               setTravel(result[0] || []);
          } catch (err) {
               console.error("Error fetching travels:", err);
          } finally {
               setLoading(false);
          }
     };

     return {
          route,
          fetchRoutes,
          routestop,
          fetchRouteStop,
          trips,
          fetchTrips,
          thresholds,
          fetchThreshold,
          promo,
          fetchPromo,
          travel,
          fetchTravels
          // loading,
     };
}

// useAll.js - ✅ ENHANCED: Auto-selects correct token (adminToken/appToken)
// import { useCallback, useContext, useState, useEffect } from "react";
// import { AuthContext } from "../AuthContext";
// import CONFIG from "../Config";

// export default function useAll() {
//      const { token, user, isAdmin } = useContext(AuthContext);

//      const [route, setRoutes] = useState([]);
//      const [trips, setTrips] = useState([]);
//      const [routestop, setRouteStop] = useState([]);
//      const [thresholds, setThresholds] = useState([]);
//      const [promo, setPromo] = useState([]);
//      const [travel, setTravel] = useState([]);
//      const [loading, setLoading] = useState(false);

//      // ✅ AUTO-SELECT TOKEN: adminToken for admin, appToken for app
//      const getAuthToken = () => {
//           if (isAdmin) {
//                return localStorage.getItem('adminToken') || token;
//           }
//           return localStorage.getItem('appToken') || token;
//      };

//      const fetchRoutes = useCallback(async () => {
//           try {
//                setLoading(true);
//                const authToken = getAuthToken();
//                const res = await fetch(`${CONFIG.API_BASE_URL}/route`, {
//                     headers: {
//                          "Content-Type": "application/json",
//                          Authorization: `Bearer ${authToken}`, // ✅ Uses correct token
//                     },
//                });
//                const result = await res.json();
//                const activeRoutes = result[0]
//                     ? result[0].filter(route => route.record_status == 1)
//                     : [];
//                console.log("✅ Routes loaded:", activeRoutes.length);
//                setRoutes(activeRoutes);
//           } catch (err) {
//                console.error("Route error:", err);
//                setRoutes([]);
//           } finally {
//                setLoading(false);
//           }
//      }, [token, isAdmin]);

//      const fetchRouteStop = useCallback(async (route_id) => {
//           try {
//                setLoading(true);
//                const authToken = getAuthToken();
//                const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/${route_id}`, {
//                     headers: {
//                          "Content-Type": "application/json",
//                          Authorization: `Bearer ${authToken}`,
//                     },
//                });
//                const result = await res.json();
//                setRouteStop(result[0]);
//                return result[0];
//           } catch (err) {
//                console.error("Route stop error:", err);
//                setRouteStop([]);
//                return [];
//           } finally {
//                setLoading(false);
//           }
//      }, [token, isAdmin]);

//      const fetchTrips = useCallback(async () => {
//           try {
//                setLoading(true);
//                const authToken = getAuthToken();
//                const res = await fetch(`${CONFIG.API_BASE_URL}/trip`, {
//                     method: "GET",
//                     headers: {
//                          "Content-type": "application/json",
//                          Authorization: `Bearer ${authToken}`,
//                     },
//                });
//                if (!res.ok) throw new Error(`Error: ${res.status}`);
//                const Trip = await res.json();
//                const flatTrips = Trip.flat();
//                console.log("✅ Trips loaded:", flatTrips.length);
//                setTrips(Trip[0]);
//           } catch (err) {
//                console.log("Error fetching trips:", err);
//                setTrips([]);
//           } finally {
//                setLoading(false);
//           }
//      }, [token, isAdmin]);

//      const fetchThreshold = useCallback(async (policy_id) => {
//           try {
//                setLoading(true);
//                const authToken = getAuthToken();
//                const res = await fetch(`${CONFIG.API_BASE_URL}/thresholds/policy/${policy_id}`, {
//                     headers: { Authorization: `Bearer ${authToken}` },
//                });
//                const data = await res.json();
//                setThresholds(data[0] || []);
//           } catch (err) {
//                console.error("fetchThresholds error:", err);
//                setThresholds([]);
//           } finally {
//                setLoading(false);
//           }
//      }, [token, isAdmin]);

//      const fetchPromo = useCallback(async (promotion_id) => {
//           try {
//                setLoading(true);
//                const authToken = getAuthToken();
//                const res = await fetch(`${CONFIG.API_BASE_URL}/promotions/${promotion_id}`, {
//                     method: "GET",
//                     headers: {
//                          "Content-type": "application/json",
//                          Authorization: `Bearer ${authToken}`,
//                     },
//                });
//                if (!res.ok) throw new Error(`Error: ${res.status}`);
//                const data = await res.json();
//                setPromo(data[0]);
//           } catch (err) {
//                console.log("Error fetching promo:", err);
//                setPromo([]);
//           } finally {
//                setLoading(false);
//           }
//      }, [token, isAdmin]);

//      const fetchTravels = useCallback(async () => {
//           try {
//                setLoading(true);
//                const authToken = getAuthToken();
//                const res = await fetch(`${CONFIG.API_BASE_URL}/travel`, {
//                     headers: { Authorization: `Bearer ${authToken}` },
//                });
//                const result = await res.json();
//                setTravel(result[0] || []);
//                console.log("✅ Travels loaded:", result[0]?.length || 0);
//           } catch (err) {
//                console.error("Error fetching travels:", err);
//                setTravel([]);
//           } finally {
//                setLoading(false);
//           }
//      }, [token, isAdmin]);

//      // ✅ Auto-fetch on mount if token exists
//      useEffect(() => {
//           if (token) {
//                fetchRoutes();
//                fetchTrips();
//                fetchTravels();
//           }
//      }, [token]);

//      return {
//           route,
//           fetchRoutes,
//           routestop,
//           fetchRouteStop,
//           trips,
//           fetchTrips,
//           thresholds,
//           fetchThreshold,
//           promo,
//           fetchPromo,
//           travel,
//           fetchTravels,
//           loading,
//           isAdmin, // ✅ Expose admin status
//           userData: user?.userData || [] // ✅ User-specific data
//      };
// }