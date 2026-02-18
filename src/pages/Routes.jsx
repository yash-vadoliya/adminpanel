import React, { useContext, useEffect, useState } from "react";
import CONFIG from "../Config";
import WorldMap from "../components/WorldMap";
import MapPicker from "../components/MapPicker";
import { AuthContext } from "../AuthContext";
import { PencilSquare, Trash, Plus, Dash } from "react-bootstrap-icons";
import ROLES from "../Role";
import useStops from "../Hooks/useStops";
import useCity from "../Hooks/useCities";

function Routes() {
  const { token, user } = useContext(AuthContext);

  // page state
  const [routes, setRoutes] = useState([]);
  const [data, setData] = useState(null);
  const [mapType, setMapType] = useState("roadmap");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [routeStops, setRouteStops] = useState([]); // stops for details/map
  // const [stop, setStop] =useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);


  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [addAdditionalStops, setAddAdditionalStops] = useState(false);

  // route form state
  const [formData, setFormData] = useState({
    route_name: "",
    route_start_from: "", // stop_id
    route_end_to: "", // stop_id
    distance_KM: "",
    approx_time: "",
    start_city_id: "",
    end_city_id: "",
    is_active: 1,
    adduid: user?.user_id || null,
  });

  // stop rows (additional stops)
  const [stopRows, setStopRows] = useState([
    {
      id: null, // DB id of route_stop row (if exists) - the route_stop table PK
      stop_id: "",
      stop_name: "",
      wait_time: "00:02:00",
      approx_km_from_start: "",
      approx_time_from_start: "",
      stop_sequence: 1,
      city_id: null,
      record_status: 1,
      latitude: null,
      longitude: null,
    },
  ]);

  // hooks for global stops & cities (these return arrays & fetch functions)
  const { stops, fetchStops } = useStops();
  const { city, fetchCity } = useCity();

  const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);

  // --- Fetch routes ---
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      const list = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result.data || result;
      setRoutes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchStops();
    fetchCity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: get stop object by id (stop_id or id)
  const getStopById = (id) => {
    if (!id) return null;
    return (stops || []).find((s) => String(s.stop_id ?? s.id) === String(id));
  };

  // const handleshowRecord = (routeId) => {
  //   setSelectedRouteId(routeId);
  // };


  // Helper: get city name by id
  const getCityNameById = (id) => {
    if (!id) return "";
    const c = (city || []).find((x) => String(x.city_id) === String(id));
    return c ? c.city_name : "";
  };

  // Filtered stops to show in selects: when city selected filter by cities, else all
  const filteredStops = Array.isArray(stops)
    ? stops.filter(
      (s) =>
        (!formData.start_city_id && !formData.end_city_id) ||
        String(s.city_id) === String(formData.start_city_id) ||
        String(s.city_id) === String(formData.end_city_id)
    )
    : [];

  // handle route form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // init create form
  const handleCreate = () => {
    setFormData({
      route_name: "",
      route_start_from: "",
      route_end_to: "",
      distance_KM: "",
      approx_time: "",
      start_city_id: "",
      end_city_id: "",
      is_active: 1,
      adduid: user?.user_id || null,
    });
    setStopRows([
      {
        id: null,
        stop_id: "",
        stop_name: "",
        wait_time: "00:02:00",
        approx_km_from_start: "",
        approx_time_from_start: "",
        stop_sequence: 1,
        city_id: null,
        record_status: 1,
        latitude: null,
        longitude: null,
      },
    ]);
    setEditId(null);
    setAddAdditionalStops(true);
    setShowForm(true);
  };

  // fetch route's stops (for edit/details)
  const fetchRouteStopByRouteID = async (route_id) => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/route/${route_id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result.data || result;
      const normalized = (rows || []).map((r) => ({
        id: r.id ?? null, // primary key of route_stop
        stop_id: r.stop_id ?? null,
        stop_name: r.stop_name ?? (getStopById(r.stop_id)?.stop_name || ""),
        wait_time: r.wait_time ?? "00:02:00",
        approx_km_from_start: r.approx_km_from_start ?? r.distance_from_start ?? "",
        approx_time_from_start: r.approx_time_from_start ?? r.approx_time_from_start ?? "",
        stop_sequence: r.stop_sequence ?? 1,
        city_id: r.city_id ?? (getStopById(r.stop_id)?.city_id) ?? null,
        record_status: r.record_status ?? 1,
        latitude: r.latitude ?? null,
        longitude: r.longitude ?? null,
      }));
      if (normalized.length) {
        normalized.sort((a, b) => (Number(a.stop_sequence) || 0) - (Number(b.stop_sequence) || 0));
        setStopRows(normalized);
      } else {
        setStopRows([
          {
            id: null,
            stop_id: "",
            stop_name: "",
            wait_time: "00:02:00",
            approx_km_from_start: "",
            approx_time_from_start: "",
            stop_sequence: 1,
            city_id: null,
            record_status: 1,
            latitude: null,
            longitude: null,
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching route stops:", err);
      setStopRows([
        {
          id: null,
          stop_id: "",
          stop_name: "",
          wait_time: "00:02:00",
          approx_km_from_start: "",
          approx_time_from_start: "",
          stop_sequence: 1,
          city_id: null,
          record_status: 1,
          latitude: null,
          longitude: null,
        },
      ]);
    }
  };

  // edit route: populate form and stopRows
  const handleEdit = async (route) => {
    setFormData({
      route_name: route.route_name,
      route_start_from: route.route_start_from || "",
      route_end_to: route.route_end_to || "",
      distance_KM: route.distance_KM || "",
      approx_time: route.approx_time || "",
      start_city_id: route.start_city_id || "",
      end_city_id: route.end_city_id || "",
      is_active: route.is_active ?? 1,
      adduid: user?.user_id || null,
    });
    setEditId(route.route_id);
    setAddAdditionalStops(true);
    setShowForm(true);
    await fetchRouteStopByRouteID(route.route_id);
  };

  // delete route
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Route deleted successfully!");
        await fetchRoutes();
      } else {
        const t = await res.text();
        console.error("Delete failed:", t);
        alert("Delete failed! See console.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed! See console.");
    }
  };

  // show details (map + right panel)
  const handleshowRecord = async (route_id) => {
    setShowDetails(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/route/${route_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result.data || result;
      const stopsArr = (rows || [])
        .filter((stop) => stop && (stop.record_status === 1))
        .map((stop) => ({
          id: stop.id ?? null,
          name: stop.stop_name ?? getStopById(stop.stop_id)?.stop_name ?? "",
          lat: stop.latitude ? parseFloat(stop.latitude) : null,
          lng: stop.longitude ? parseFloat(stop.longitude) : null,
          wait_time: stop.wait_time,
          radius_in_meters: stop.radius_in_meters,
          reach_time: stop.reach_time,
          stop_sequence: stop.stop_sequence ?? 0,
          city_name: getCityNameById(stop.city_id ?? getStopById(stop.stop_id)?.city_id),
          record_status: stop.record_status ?? 1,
        }));

      stopsArr.sort((a, b) => (Number(a.stop_sequence) || 0) - (Number(b.stop_sequence) || 0));

      setRouteStops(stopsArr);
      const routeInfo = routes.find((r) => r.route_id === route_id);
      setData(routeInfo || null);

      if (stopsArr.length && stopsArr[0].lat && stopsArr[0].lng) {
        setMapCenter([stopsArr[0].lat, stopsArr[0].lng]);
      } else {
        setMapCenter([20.5937, 78.9629]);
      }
    } catch (err) {
      console.error("Error loading stops:", err);
      setRouteStops([]);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setData(null);
    setRouteStops([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${CONFIG.API_BASE_URL}/route/${editId}`
      : `${CONFIG.API_BASE_URL}/route`;

    try {
      const payload = { ...formData, adduid: user?.user_id || null };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Operation failed!");
        return;
      }

      // --- Determine routeId ---
      let routeId =
        editId ||
        result?.route_id ||
        result?.insertId ||
        (Array.isArray(result) && result[0]?.insertId) ||
        null;

      if (!routeId) {
        await fetchRoutes();
        alert("Route saved, but routeId not returned.");
        return;
      }

      // ===============================
      // 1️⃣ FETCH EXISTING STOP ROWS (ONLY FOR EDIT)
      // ===============================
      let existingStops = [];
      if (editId) {
        try {
          const res2 = await fetch(
            `${CONFIG.API_BASE_URL}/route_stop/route/${routeId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          let js = await res2.json();

          existingStops = Array.isArray(js)
            ? js[0] || []
            : js.data || js || [];
        } catch (err) {
          console.log("Cannot load existing stops:", err);
        }
      }

      // Map existing start & end stop IDs
      const existingStart = existingStops.find((s) => s.stop_sequence === 1);
      const existingEnd = existingStops.length
        ? existingStops.reduce((max, row) =>
          row.stop_sequence > max.stop_sequence ? row : max
        )
        : null;

      // ===============================
      // 2️⃣ BUILD STOP LIST (START → MIDDLE → END)
      // ===============================
      const finalStops = [];

      // Add Start Stop (ONLY ON CREATE)
      if (!editId && formData.route_start_from) {
        const sObj = getStopById(formData.route_start_from);
        finalStops.push({
          id: null,
          route_id: routeId,
          stop_id: formData.route_start_from,
          stop_name: sObj?.stop_name || "",
          wait_time: "00:00:00",
          approx_km_from_start: 0,
          approx_time_from_start: "00:00:00",
          stop_sequence: 1,
          city_id: formData.start_city_id || sObj?.city_id || null,
          adduid: user?.user_id || null,
        });
      }

      // Add middle stops
      stopRows
        .filter((r) => r && r.stop_id)
        .forEach((r) => {
          const sObj = getStopById(r.stop_id);
          finalStops.push({
            id: r.id || null,
            route_id: routeId,
            stop_id: r.stop_id,
            stop_name: sObj?.stop_name || "",
            wait_time: r.wait_time || "00:02:00",
            approx_km_from_start: r.approx_km_from_start || r.distance_from_start || 0,
            approx_time_from_start:
              r.approx_time_from_start || r.reach_time || "00:00:00",
            stop_sequence: r.stop_sequence || null,
            city_id: r.city_id || sObj?.city_id || null,
            adduid: user?.user_id || null,
          });
        });

      // Add End Stop (ONLY ON CREATE)
      if (!editId && formData.route_end_to) {
        const eObj = getStopById(formData.route_end_to);
        finalStops.push({
          id: null,
          route_id: routeId,
          stop_id: formData.route_end_to,
          stop_name: eObj?.stop_name || "",
          wait_time: "00:00:00",
          approx_km_from_start: formData.distance_KM || 0,
          approx_time_from_start: formData.approx_time || "00:00:00",
          stop_sequence: null,
          city_id: formData.end_city_id || eObj?.city_id || null,
          adduid: user?.user_id || null,
        });
      }

      // ===============================
      // 3️⃣ ASSIGN SEQUENCES CLEANLY
      // ===============================
      let seq = 1;
      finalStops.forEach((s) => {
        s.stop_sequence = seq++;
      });

      // ===============================
      // 4️⃣ DELETE REMOVED STOPS (ONLY ON UPDATE)
      // ===============================
      if (editId && existingStops.length > 0) {
        const existingIds = new Set(existingStops.map((s) => String(s.id)));
        const finalIds = new Set(finalStops.filter((x) => x.id).map((x) => String(x.id)));

        const toDelete = [...existingIds].filter((id) => !finalIds.has(id));

        for (const delId of toDelete) {
          try {
            await fetch(`${CONFIG.API_BASE_URL}/route_stop/${delId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err) {
            console.log("Failed to delete stop:", delId);
          }
        }
      }

      // ===============================
      // 5️⃣ INSERT / UPDATE STOPS
      // ===============================
      for (const st of finalStops) {
        const body = {
          route_id: st.route_id,
          stop_id: st.stop_id,
          wait_time: st.wait_time,
          distance_from_start: st.approx_km_from_start || 0,
          approx_time_from_start: st.approx_time_from_start,
          stop_sequence: st.stop_sequence,
          city_id: st.city_id,
          adduid: st.adduid,
        };

        try {
          if (st.id) {
            await fetch(`${CONFIG.API_BASE_URL}/route_stop/${st.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(body),
            });
          } else {
            await fetch(`${CONFIG.API_BASE_URL}/route_stop`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(body),
            });
          }
        } catch (err) {
          console.log("Failed to save stop:", st, err);
        }
      }

      // ===============================
      // 6️⃣ DONE
      // ===============================
      alert(editId ? "Route updated successfully!" : "Route created successfully!");
      setShowForm(false);
      setEditId(null);
      setAddAdditionalStops(false);
      await fetchRoutes();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong. Check console.");
    }
  };


  // Stop row handlers
  const handleRowChange = (index, field, value) => {
    setStopRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      // if user changed stop_id, update stop_name automatically
      if (field === "stop_id") {
        const s = getStopById(value);
        copy[index].stop_name = s ? s.stop_name : copy[index].stop_name;
        copy[index].city_id = copy[index].city_id || (s ? s.city_id : copy[index].city_id);
      }
      return copy;
    });
  };

  const addRow = () => {
    setStopRows((prev) => [
      ...prev,
      {
        id: null,
        stop_id: "",
        stop_name: "",
        wait_time: "00:02:00",
        approx_km_from_start: "",
        approx_time_from_start: "",
        stop_sequence: prev.length + 1,
        city_id: null,
        record_status: 1,
        latitude: null,
        longitude: null,
      },
    ]);
  };

  const removeRow = (index) => setStopRows((prev) => prev.filter((_, i) => i !== index));

  // Save or delete a single stop (UI-level button on each row) using API (used when editing single row)
  const saveSingleStop = async (row) => {
    const payload = {
      route_id: editId,
      stop_id: row.stop_id || null,
      stop_name: row.stop_name || "",
      wait_time: row.wait_time || "00:02:00",
      distance_from_start: row.approx_km_from_start || 0,
      approx_time_from_start: row.approx_time_from_start || "00:00:00",
      stop_sequence: row.stop_sequence || 1,
      city_id: row.city_id || null,
      adduid: user?.user_id || null,
    };
    try {
      if (row.id) {
        const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/${row.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        return res.ok;
      } else {
        const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        return res.ok;
      }
    } catch (err) {
      console.error("saveSingleStop error:", err);
      return false;
    }
  };

  const deleteSingleStop = async (id) => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch (err) {
      console.error("deleteSingleStop error:", err);
      return false;
    }
  };

  // ----- Pagination helpers & filteredRoutes -----
  const filteredRoutes = Array.isArray(routes)
    ? routes.filter((route) => {
      if (route.record_status !== 1) return false;
      if (filter === "active") return route.is_active === 1;
      if (filter === "inactive") return route.is_active === 0;
      return true;
    })
    : [];

  const uniqueRouteStops = routeStops.filter(
    (stop, index, self) =>
      index === self.findIndex((s) => String(s.id) === String(stop.id))
  );


  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRoutes = filteredRoutes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / itemsPerPage));

  // map markers for details view
  const routeMarkers = (routeStops || []).map((s) => ({ lat: s.lat, lng: s.lng, name: s.name }));

  // render
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Routes</h2>
        <button className="btn btn-success" onClick={handleCreate}>
          Add Route
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-3 p-3 shadow">
          <h5>{editId ? "Update Route" : "Create Route"}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Route Name */}
              <div className="col-md-3">
                <label className="form-label">Route Name</label>
                <input type="text" name="route_name" value={formData.route_name} onChange={handleChange} className="form-control" required />
              </div>

              {/* Start City */}
              <div className="col-md-3">
                <label className="form-label">Start City</label>
                <select name="start_city_id" className="form-select" value={formData.start_city_id} onChange={handleChange}>
                  <option value="">Select City</option>
                  {Array.isArray(city) &&
                    city.map((c) => (
                      <option key={c.city_id} value={c.city_id}>
                        {c.city_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* End City */}
              <div className="col-md-3">
                <label className="form-label">End City</label>
                <select name="end_city_id" className="form-select" value={formData.end_city_id} onChange={handleChange}>
                  <option value="">Select City</option>
                  {Array.isArray(city) &&
                    city.map((c) => (
                      <option key={c.city_id} value={c.city_id}>
                        {c.city_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Start Stop (select stop_id) */}
              <div className="col-md-3">
                <label className="form-label">Start Stop</label>
                <select name="route_start_from" className="form-select" value={formData.route_start_from} onChange={handleChange}>
                  <option value="">Select Stop</option>
                  {filteredStops.map((s) => (
                    <option key={s.stop_id ?? s.id} value={s.stop_id ?? s.id}>
                      {s.stop_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Stop */}
              <div className="col-md-3">
                <label className="form-label">End Stop</label>
                <select name="route_end_to" className="form-select" value={formData.route_end_to} onChange={handleChange}>
                  <option value="">Select Stop</option>
                  {filteredStops
                    .filter((s) => String(s.stop_id ?? s.id) !== String(formData.route_start_from))
                    .map((s) => (
                      <option key={s.stop_id ?? s.id} value={s.stop_id ?? s.id}>
                        {s.stop_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Distance */}
              <div className="col-md-3">
                <label className="form-label">Distance (KM)</label>
                <input type="number" step="0.01" name="distance_KM" value={formData.distance_KM} onChange={handleChange} className="form-control" />
              </div>

              {/* Approx Time */}
              <div className="col-md-3">
                <label className="form-label">Approx Time</label>
                <input type="text" name="approx_time" value={formData.approx_time} onChange={handleChange} className="form-control" placeholder="HH:MM" />
              </div>

              {/* Status */}
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select name="is_active" className="form-select" value={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              {/* Additional stops toggle */}
              <div className="col-md-12">
                <div className="form-check mt-3">
                  <input type="checkbox" className="form-check-input" id="addStopsCheck" checked={addAdditionalStops} onChange={(e) => setAddAdditionalStops(e.target.checked)} />
                  <label htmlFor="addStopsCheck" className="form-check-label">
                    Add Additional Stops
                  </label>
                </div>
              </div>

              {/* Additional stops block */}
              {addAdditionalStops && (
                <div className="collapse show col-12">
                  <div className="p-2">
                    {stopRows.map((row, index) => (
                      <div className="row mb-2" key={index}>
                        <div className="col-md-3">
                          <label className="form-label">Stop</label>
                          <select className="form-select" value={row.stop_id || ""} onChange={(e) => handleRowChange(index, "stop_id", e.target.value)}>
                            <option value="">Select Stop</option>
                            {stops.map((s) => (
                              <option key={s.stop_id ?? s.id} value={s.stop_id ?? s.id}>
                                {s.stop_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Wait Time</label>
                          <select className="form-select" value={row.wait_time || ""} onChange={(e) => handleRowChange(index, "wait_time", e.target.value)}>
                            <option value="00:02:00">2 min</option>
                            <option value="00:05:00">5 min</option>
                            <option value="00:10:00">10 min</option>
                            <option value="00:15:00">15 min</option>
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Approx KM from Start</label>
                          <input type="text" className="form-control" value={row.approx_km_from_start || ""} onChange={(e) => handleRowChange(index, "approx_km_from_start", e.target.value)} />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Approx Time from Start</label>
                          <input type="text" className="form-control" value={row.approx_time_from_start ? String(row.approx_time_from_start).substring(0, 5) : ""} onChange={(e) => handleRowChange(index, "approx_time_from_start", e.target.value)} placeholder="HH:MM" />
                        </div>

                        <div className="col-md-3 mt-2">
                          <label className="form-label">Stop Sequence</label>
                          <input type="number" className="form-control" value={row.stop_sequence || index + 1} onChange={(e) => handleRowChange(index, "stop_sequence", Number(e.target.value))} />
                        </div>

                        <div className="col-md-3 d-flex align-items-end gap-2 mt-2">
                          {index === stopRows.length - 1 ? (
                            <button type="button" className="btn btn-sm btn-success w-50" onClick={addRow}>
                              <Plus />
                            </button>
                          ) : (
                            <button type="button" className="btn btn-sm btn-warning w-50" onClick={() => removeRow(index)}>
                              <Dash />
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-sm btn-primary w-50"
                            onClick={async () => {
                              if (!editId) {
                                alert("Save the route first (Create the route) to add this stop individually.");
                                return;
                              }
                              const ok = await saveSingleStop(stopRows[index]);
                              if (ok) {
                                alert("Stop saved.");
                                await fetchRouteStopByRouteID(editId);
                                await fetchStops();
                              } else alert("Failed to save stop.");
                            }}
                          >
                            <PencilSquare />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-danger w-50"
                            onClick={async () => {
                              if (!stopRows[index].id) {
                                // not persisted
                                removeRow(index);
                                return;
                              }
                              if (!window.confirm("Delete this stop?")) return;
                              const ok = await deleteSingleStop(stopRows[index].id);
                              if (ok) {
                                alert("Stop deleted.");
                                await fetchRouteStopByRouteID(editId);
                                await fetchStops();
                              } else alert("Delete failed.");
                            }}
                          >
                            <Trash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save / Cancel */}
              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary">
                  {editId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setAddAdditionalStops(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main view */}
      <div className="row">
        <div className="col-md-4">
          {showDetails ? (
            <div className="card p-3 shadow-lg mb-3 rounded-4 position-relative">
              <button className="btn position-absolute top-0 end-0 m-2 text-danger" onClick={handleCloseDetails} title="Close">
                <i className="bi bi-x-circle fs-4"></i>
              </button>

              <h3>{data?.route_id}</h3>

              <h5 className="mb-3 text-primary fw-bold text-center border-bottom pb-2">{data?.route_name || "Unnamed Route"}</h5>

              <div className="mb-2">
                <strong>From:</strong>{" "}
                <span className="text-dark">{data?.route_start_from ? getStopById(data.route_start_from)?.stop_name || data.route_start_from : "-"}</span>
              </div>
              <div className="mb-2">
                <strong>To:</strong>{" "}
                <span className="text-dark">{data?.route_end_to ? getStopById(data.route_end_to)?.stop_name || data.route_end_to : "-"}</span>
              </div>
              <div className="mb-2">
                <strong>Distance:</strong> <span className="text-dark">{data?.distance_KM || "-"} KM</span>
              </div>
              <div className="mb-2">
                <strong>Approx Time:</strong> <span className="text-dark">{data?.approx_time || "-"}</span>
              </div>

              <div className="mt-2">{data?.is_active === 1 ? <span className="badge fs-6 bg-success px-3 py-2">Active</span> : <span className="badge fs-6 bg-danger px-3 py-2">Stopped</span>}</div>

              <div className="mt-3">
                <strong>Stops:</strong>
                <div className="mt-2">
                  {uniqueRouteStops?.length > 0 ? (
                    uniqueRouteStops
                      .filter((stop) => stop.record_status === 1)
                      .map((stop, idx) => {

                        // ⭐ FIX ID MATCHING
                        const st = stops?.find((s) =>
                          s.stop_id === stop.stop_id || s.id === stop.stop_id
                        );

                        return (
                          <div key={idx} className="border p-2 mb-2 rounded bg-light">



                            <div className="d-flex align-items-center mb-1">
                              <div className="me-3 fw-bold text-primary">#{stop.stop_sequence}</div>
                              <i className="bi bi-geo-alt-fill me-2 text-danger fs-4"></i>
                              <strong className="fs-4">{stop.name}</strong>
                            </div>

                            <div className="text-muted small ms-4">
                              ⏳ <strong>Wait Time:</strong> {stop.wait_time || "-"} <br />

                              📏 <strong>Radius:</strong> {st?.radius_in_meters || "-"} meters <br />

                              🧭 <strong>Coordinates:</strong>{" "}
                              {st?.latitude && st?.longitude ? `(${parseFloat(st.latitude).toFixed(4)}, ${parseFloat(st.longitude).toFixed(4)})` : "-"} <br />

                              {/* 🏙 <strong>City:</strong> {st?.city_name || "-"} */}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-muted small mt-2">No active stops available.</div>
                  )}


                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-lg border-0 p-3 rounded-4">
              <h5 className="card-title mb-3">All Routes</h5>

              <div className="mb-3">
                <select
                  className="form-select form-select-sm w-auto"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : currentRoutes.length === 0 ? (
                <p>No routes available</p>
              ) : (
                <>
                  {currentRoutes
                    .filter((route) => route.record_status === 1 || route.record_status == null)
                    .map((route) => (
                      <div key={route.route_id} className="card mb-3 shadow-sm rounded-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="fs-5 fw-bold mb-1 me-2">{route.route_name}</h6>
                            {route.is_active === 1 ? <span className="badge fs-6 bg-success">Active</span> : <span className="badge fs-6 bg-danger">Stopped</span>}
                          </div>
                          <div>From: {route.route_start_from ? getStopById(route.route_start_from)?.stop_name || route.route_start_from : "-"}</div>
                          <div>To: {route.route_end_to ? getStopById(route.route_end_to)?.stop_name || route.route_end_to : "-"}</div>
                          <div>Distance: {route.distance_KM} KM</div>
                          <div>Approx Time: {route.approx_time}</div>

                          <div className="mt-3 d-flex flex-wrap gap-2">
                            {isAdmin && (
                              <>
                                <button className="btn btn-sm btn-warning" onClick={() => handleEdit(route)}>
                                  <PencilSquare />
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(route.route_id)}>
                                  <Trash />
                                </button>
                              </>
                            )}
                            <button className="btn btn-sm btn-info text-white" onClick={() => handleshowRecord(route.route_id)}>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Pagination */}
                  <nav className="d-flex justify-content-center mt-3">
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                          Previous
                        </button>
                      </li>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}

                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </>
              )}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="col-md-8">
          <div className="card shadow-lg border-0 p-3" style={{ height: "78vh" }}>
            <div className="mb-3">
              <button className={`btn me-2 ${mapType === "roadmap" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("roadmap")}>
                Roadmap
              </button>
              <button className={`btn ${mapType === "satellite" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("satellite")}>
                Satellite
              </button>
            </div>

            <WorldMap center={mapCenter} zoom={5} mapType={mapType} markers={routeMarkers} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Routes;
