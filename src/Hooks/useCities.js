// src/hooks/useCity.js
import { useState, useEffect, useContext } from "react";
import CONFIG from "../Config";
import { AuthContext } from "../AuthContext";

function useCity(autoFetch = true) {
  const { token, user } = useContext(AuthContext);
  const [city, setCity] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- Fetch City ----------------
  const fetchCity = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/city`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      // console.log("city : ", data[0]);
      // setCity(Array.isArray(data[0]) ? data[0] : data);
      setCity(data[0]);
    } catch (err) {
      console.error("Error fetching city:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Create / Update City ----------------
  const saveCity = async (cityData, editId = null) => {
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${CONFIG.API_BASE_URL}/city/${editId}`
      : `${CONFIG.API_BASE_URL}/city`;

    const payload = {
      ...cityData,
      adduid: user?.user_id,
      city_id: cityData.city_id ? Number(cityData.city_id) : null,
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
        fetchCity();
        return true;
      } else {
        console.error("Save failed:", await res.text());
        return false;
      }
    } catch (err) {
      console.error("Error saving city:", err);
      return false;
    }
  };

  // ---------------- Delete City ----------------
  const deleteCity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this city?")) return false;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/city/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchCity();
        return true;
      } else {
        console.error("Delete failed:", await res.text());
        return false;
      }
    } catch (err) {
      console.error("Error deleting city:", err);
      return false;
    }
  };

  // // ---------------- Auto Fetch ----------------
  // useEffect(() => {
  //   if (autoFetch) fetchCity();
  // }, []);

  // ---------------- Return All ----------------
  return { city, fetchCity, saveCity, deleteCity, loading };
}

export default useCity;
