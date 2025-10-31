import React, { useEffect, useState, useContext } from "react";
import CONFIG from "../Config";
import WorldMap from "../components/WorldMap";
import { AuthContext } from "../AuthContext";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import ROLES from "../Role";


const Stops = () => {
  const { token, user } = useContext(AuthContext);

  const [mapType, setMapType] = useState("roadmap");
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    route_id: "",
    stop_sequence: "",
    distance_from_start: "",
    approx_time_from_start: "",
    stop_name: "",
    wait_time: "",
    reach_time: "",
    is_minor: 0,
    latitude: "",
    longitude: "",
    radius_in_meters: "",
  });

  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [selectedStop, setSelectedStop] = useState(null);

  // Role Base
  const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);


  // Fetch stops from backend
  useEffect(() => {
    fetchStops();
  }, []);

  const fetchStops = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      // Flatten nested arrays if any
      const flattenedStops = Array.isArray(data)
        ? data.flat().filter((item) => item.id != null)
        : [];

      setStops(flattenedStops);
    } catch (err) {
      console.error("Error fetching stops:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => setSearch(e.target.value);
  const filteredStops = stops.filter((stop) =>
    stop.stop_name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open form for create
  const handleCreate = () => {
    setFormData({
      route_id: "",
      stop_sequence: "",
      distance_from_start: "",
      approx_time_from_start: "",
      stop_name: "",
      wait_time: "",
      reach_time: "",
      is_minor: 0,
      latitude: "",
      longitude: "",
      radius_in_meters: "",
    });
    setEditId(null);
    setShowForm(true);
  };

  // Open form for edit
  const handleEdit = (stop) => {
    setEditId(stop.id);
    setFormData({
      route_id: stop.route_id,
      stop_sequence: stop.stop_sequence,
      distance_from_start: stop.distance_from_start,
      approx_time_from_start: stop.approx_time_from_start,
      stop_name: stop.stop_name,
      wait_time: stop.wait_time,
      reach_time: stop.reach_time,
      is_minor: stop.is_minor,
      latitude: stop.latitude,
      longitude: stop.longitude,
      radius_in_meters: stop.radius_in_meters,
    });
    setShowForm(true);
  };

  // Delete stop
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stop?")) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert({ message: "Stop deleted successfully!", type: "success" });
        fetchStops();
        window.location.reload();
      } else {
        console.error("Failed to delete:", await res.text());
        alert({ message: "Delete failed! Check console.", type: "error" });
      }
    } catch (err) {
      console.error("Error deleting stop:", err);
      alert({ message: "Delete failed! Check console.", type: "error" });
    }
  };

  // Submit form (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${CONFIG.API_BASE_URL}/route_stop/${editId}`
      : `${CONFIG.API_BASE_URL}/route_stop`;

    try {
      const payload = { ...formData, adduid: user?.user_id };
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert(editId ? "Stop updated successfully!" : "Stop created successfully!");
        setShowForm(false);
        setEditId(null);
        fetchStops();
        window.location.reload();
      } else {
        console.error("Request failed:", await res.text());
        alert("Operation failed! Check console for details.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Operation failed! Check console for details.");
    }
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredStops.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStops.length / itemsPerPage);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Stops</h2>
        <button className="btn btn-success" onClick={handleCreate}>
          Add Stop
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search stop by name"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-3 p-3 shadow">
          <h5>{editId ? "Update Stop" : "Create Stop"}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label>Route ID</label>
                <input
                  type="number"
                  className="form-control"
                  name="route_id"
                  value={formData.route_id}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label>Stop Sequence</label>
                <input
                  type="number"
                  className="form-control"
                  name="stop_sequence"
                  value={formData.stop_sequence}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label>Distance From Start (km)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="distance_from_start"
                  value={formData.distance_from_start}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label>Approx Time From Start</label>
                <input
                  type="text"
                  className="form-control"
                  name="approx_time_from_start"
                  value={formData.approx_time_from_start}
                  onChange={handleInputChange}
                  placeholder="HH:MM"
                  required
                />
              </div>

              <div className="col-md-3">
                <label>Stop Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="stop_name"
                  value={formData.stop_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label>Wait Time</label>
                <input
                  type="text"
                  className="form-control"
                  name="wait_time"
                  value={formData.wait_time}
                  onChange={handleInputChange}
                  placeholder="MM:SS"
                  required
                />
              </div>
              <div className="col-md-3">
                <label>Reach Time</label>
                <input
                  type="text"
                  className="form-control"
                  name="reach_time"
                  value={formData.reach_time}
                  onChange={handleInputChange}
                  placeholder="HH:MM AM/PM"
                  required
                />
              </div>
              <div className="col-md-3">
                <label>Is Minor</label>
                <input
                  type="number"
                  className="form-control"
                  name="is_minor"
                  value={formData.is_minor}
                  onChange={handleInputChange}
                  min={0}
                  max={1}
                />
              </div>

              <div className="col-md-3">
                <label>Latitude</label>
                <input
                  type="text"
                  className="form-control"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label>Longitude</label>
                <input
                  type="text"
                  className="form-control"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label>Radius (meters)</label>
                <input
                  type="number"
                  className="form-control"
                  name="radius_in_meters"
                  value={formData.radius_in_meters}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary me-2">
                  {editId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Stops List */}
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-md-4">
            <div className="card shadow-lg border-0 pb-3 vh-100 overflow-auto">
              <div className="card-body">
                <h5 className="card-title mb-3">Stops</h5>
                {loading ? (
                  <p>Loading...</p>
                ) : currentData.length === 0 ? (
                  <p>No stops available</p>
                ) : (
                  <ul className="list-group">
                    {currentData
                      .filter((stop) => stop.record_status === 1 || stop.record_status == null)
                      .map((stop) => (
                        <li
                          key={stop.id}
                          className="list-group-item mb-3 rounded shadow-sm"
                          style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <div className="p-2">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span className="fw-bold me-2">ID: {stop.id}</span>
                              <h6 className="fs-3 fw-bold mb-0 me-2" style={{ wordBreak: "break-word" }}>
                                {stop.stop_name}
                              </h6>
                              <div
                                className="bg-secondary text-white px-3 py-1 rounded-pill fw-semibold flex-shrink-0"
                                style={{ fontSize: "1.1rem", whiteSpace: "nowrap" }}
                              >
                                Route ID: {stop.route_id}
                              </div>
                            </div>

                            <div>Latitude: {stop.latitude}</div>
                            <div>Longitude: {stop.longitude}</div>
                            <div>Wait Time: {stop.wait_time}</div>
                            <div>Radius: {stop.radius_in_meters} m</div>

                            <div className="mt-3">
                              {isAdmin && (
                                <>
                                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(stop)}>
                                    <PencilSquare />
                                  </button>
                                  <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(stop.id)}>
                                    <Trash />
                                  </button>
                                   </>
                              )}
                                  <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => {
                                      setMapCenter([parseFloat(stop.latitude), parseFloat(stop.longitude)]);
                                      setSelectedStop(stop);
                                    }}
                                  >
                                    Show Location
                                  </button>
                               
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-3">
              <nav>
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
            </div>
          </div>

          {/* Map */}
          <div className="col-md-8">
            <div className="card shadow-lg border-0 p-3 vh-100">
              <div className="mb-3">
                <button className={`btn me-2 ${mapType === "roadmap" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("roadmap")}>
                  Roadmap
                </button>
                <button className={`btn ${mapType === "satellite" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("satellite")}>
                  Satellite
                </button>
              </div>

              <WorldMap
                center={mapCenter}
                zoom={6}
                mapType={mapType}
                markers={
                  selectedStop
                    ? [
                      {
                        position: [parseFloat(selectedStop.latitude), parseFloat(selectedStop.longitude)],
                      },
                    ]
                    : []
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stops;
