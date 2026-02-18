// src/hooks/useStops.js
import { useState, useEffect, useContext } from "react";
import CONFIG from "../Config";
import { AuthContext } from "../AuthContext";

function useStops(autoFetch = true) {
  const { token, user } = useContext(AuthContext);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- Fetch Stops ----------------
  const fetchStops = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/stop`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      // console.log("stop data", data);
      let stopsData = [];
      if (Array.isArray(data)) {
        stopsData = Array.isArray(data[0]) ? data[0] : data;
      } else if (data && Array.isArray(data.data)) {
        stopsData = data.data;
      }
      setStops(stopsData);
    } catch (err) {
      console.error("Error fetching stops:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Create / Update ----------------
  const saveStop = async (stopData, editId = null) => {
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${CONFIG.API_BASE_URL}/stop/${editId}`
      : `${CONFIG.API_BASE_URL}/stop`;

    const payload = {
      ...stopData,
      adduid: user?.user_id,
      city_id: stopData.city_id ? Number(stopData.city_id) : null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchStops();
        return true;
      } else {
        console.error("Save failed:", await res.text());
        return false;
      }
    } catch (err) {
      console.error("Error saving stop:", err);
      return false;
    }
  };

  // ---------------- Delete ----------------
  const deleteStop = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stop?")) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/stop/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchStops();
        return true;
      } else {
        console.error("Delete failed:", await res.text());
        return false;
      }
    } catch (err) {
      console.error("Error deleting stop:", err);
      return false;
    }
  };


  useEffect(() => {
    if (autoFetch) fetchStops();
  }, []);

  return { stops, fetchStops, saveStop, deleteStop, loading };
}

export default useStops;