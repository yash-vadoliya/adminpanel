import React, { useState, useEffect, useContext } from 'react';
import CONFIG from '../Config';
import WorldMap from '../components/WorldMap';
import { AuthContext } from '../AuthContext';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import ROLES from '../Role';

function Routes() {
  const { token, user } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [mapType, setMapType] = useState("roadmap");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editId, setEditId] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [routeStops, setRouteStops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    route_name: '',
    route_start_from: '',
    route_end_to: '',
    distance_KM: '',
    approx_time: '',
    city_id: '',
    is_active: 1,
    adduid: '',
  });

  // Role Base
  const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);


  // Fetch all routes
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const fetchdata = await res.json();
      setRoutes(fetchdata[0] || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    setFormData({
      route_name: '',
      route_start_from: '',
      route_end_to: '',
      distance_KM: '',
      approx_time: '',
      city_id: '',
      is_active: 1,
      adduid: '',
    });
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (route) => {
    setFormData({
      route_name: route.route_name,
      route_start_from: route.route_start_from,
      route_end_to: route.route_end_to,
      distance_KM: route.distance_KM,
      approx_time: route.approx_time,
      city_id: route.city_id,
      is_active: route.is_active,
    });
    setEditId(route.route_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Route deleted successfully!");
        fetchRoutes();
      } else {
        console.error(await res.text());
        alert("Delete failed! Check console for details.");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed! Check console for details.");
    }
  };

  const handleshowRecord = async (route_id) => {
    setShowDetails(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/route/${route_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const stopsData = await res.json();
      console.log(stopsData);

      // Flatten and map only valid stops
      const stops = stopsData
        .flat()
        .filter((stop) => stop && stop.latitude && stop.longitude && stop.record_status === 1)
        .map((stop) => ({
          id: stop.id,
          route_id: stop.route_id,
          stop_sequence: stop.stop_sequence,
          name: stop.stop_name || "Unnamed Stop",
          lat: parseFloat(stop.latitude),
          lng: parseFloat(stop.longitude),
          record_status: stop.record_status,
          reach_time: stop.reach_time,
          wait_time: stop.wait_time,
          radius_in_meters: stop.radius_in_meters,
        }));

      setRouteStops(stops);

      const routeInfo = routes.find((r) => r.route_id === route_id);
      setData(routeInfo || null);
    } catch (err) {
      console.error(err);
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
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editId ? "Route updated successfully!" : "Route created successfully!");
        setEditId(null);
        setShowForm(false);
        fetchRoutes();
      } else {
        console.error("Request failed:", await res.text());
        alert("Operation failed! Check console for details.");
      }
    } catch (err) {
      console.error(err);
      alert("Operation failed! Check console for details.");
    }
  };

  // Filtered & paginated routes
  const filteredRoutes = routes.filter(route => {
    if (filter === "active") return route.is_active === 1;
    if (filter === "inactive") return route.is_active === 0;
    return true;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRoutes = filteredRoutes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Routes</h2>
        <button className="btn btn-success" onClick={handleCreate}>Add Route</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-3 p-3 shadow">
          <h5>{editId ? "Update Route" : "Create Route"}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Route Name</label>
                <input type="text" name="route_name" value={formData.route_name} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Route Start From</label>
                <input type="text" name="route_start_from" value={formData.route_start_from} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Route End To</label>
                <input type="text" name="route_end_to" value={formData.route_end_to} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Distance (KM)</label>
                <input type="number" step="0.01" name="distance_KM" value={formData.distance_KM} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Approx Time</label>
                <input type="text" name="approx_time" value={formData.approx_time} onChange={handleChange} className="form-control" placeholder="HH:MM" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">City ID</label>
                <input type="number" name="city_id" value={formData.city_id} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select name="is_active" value={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })} className="form-select" required>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary">{editId ? "Update" : "Create"}</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="row">
        {/* Left Panel */}
        <div className="col-md-4">
          {showDetails ? (
            <div className="card p-3 shadow-lg mb-3 rounded-4 position-relative">
              {/* Close Button */}
              <button
                className="btn position-absolute top-0 end-0 m-2 text-danger"
                onClick={handleCloseDetails}
                title="Close"
              >
                <i className="bi bi-x-circle fs-4"></i>
              </button>

              {/* Route Info Header */}
              <h5 className="mb-3 text-primary fw-bold text-center border-bottom pb-2">
                {data?.route_name || "Unnamed Route"}
              </h5>

              {/* Route Details */}
              <div className="mb-2">
                <strong>From:</strong> <span className="text-dark">{data?.route_start_from || '-'}</span>
              </div>
              <div className="mb-2">
                <strong>To:</strong> <span className="text-dark">{data?.route_end_to || '-'}</span>
              </div>
              <div className="mb-2">
                <strong>Distance:</strong> <span className="text-dark">{data?.distance_KM || '-'} KM</span>
              </div>
              <div className="mb-2">
                <strong>Approx Time:</strong> <span className="text-dark">{data?.approx_time || '-'}</span>
              </div>
              <div className="mb-2">
                <strong>City ID:</strong> <span className="text-dark">{data?.city_id || '-'}</span>
              </div>

              {/* Status Badge */}
              <div className="mt-2">
                {data?.is_active === 1 ? (
                  <span className="badge fs-6 bg-success px-3 py-2">Active</span>
                ) : (
                  <span className="badge fs-6 bg-danger px-3 py-2">Stopped</span>
                )}
              </div>

              {/* Stops List */}
              <div className="mt-3">
                <strong>Stops:</strong>
                <div className="mt-2">
                  {routeStops?.length > 0 ? (
                    routeStops
                      // .filter((stop) => stop.record_status === 1)
                      .map((stop, idx) => (
                        <div
                          key={idx}
                          className="border p-2 mb-2 rounded bg-light"
                        >
                          <div className="d-flex align-items-center mb-1">
                            <div className="me-3 fw-bold text-primary">#{stop.id}</div>
                            <i className="bi bi-geo-alt-fill me-2 text-danger fs-5"></i>
                            <strong>{stop.name}</strong>
                          </div>

                          <div className="text-muted small ms-4">
                            🕒 <strong>Reach Time:</strong> {stop.reach_time || "-"} <br />
                            ⏳ <strong>Wait Time:</strong> {stop.wait_time || "-"} <br />
                            📏 <strong>Radius:</strong> {stop.radius_in_meters} meters <br />
                            🧭 <strong>Coordinates:</strong> ({stop.lat.toFixed(4)}, {stop.lng.toFixed(4)})
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-muted small mt-2">No active stops available.</div>
                  )}


                </div>
              </div>
            </div>
          ) : (
            // 🔹 Route List Section
            <div className="card shadow-lg border-0 p-3 rounded-4">
              <h5 className="card-title mb-3">All Routes</h5>

              {/* Filter */}
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

              {/* Routes List */}
              {loading ? (
                <p>Loading...</p>
              ) : currentRoutes.length === 0 ? (
                <p>No routes available</p>
              ) : (
                <>
                  {currentRoutes.map((route) => (
                    <div key={route.route_id} className="card mb-3 shadow-sm rounded-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="fs-5 fw-bold mb-1 me-2">{route.route_name}</h6>
                          {route.is_active === 1 ? (
                            <span className="badge fs-6 bg-success">Active</span>
                          ) : (
                            <span className="badge fs-6 bg-danger">Stopped</span>
                          )}
                        </div>
                        <div>From: {route.route_start_from}</div>
                        <div>To: {route.route_end_to}</div>
                        <div>Distance: {route.distance_KM} KM</div>
                        <div>Approx Time: {route.approx_time}</div>

                        {/* Action Buttons */}
                        <div className="mt-3 d-flex flex-wrap gap-2">
                          {isAdmin && (<>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEdit(route)}
                            >
                              <PencilSquare />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(route.route_id)}
                            >
                              <Trash />
                            </button>
                          </>)}
                          <button
                            className="btn btn-sm btn-info text-white"
                            onClick={() => handleshowRecord(route.route_id)}
                          >
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
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                          Previous
                        </button>
                      </li>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <li
                          key={i}
                          className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}

                      <li
                        className={`page-item ${currentPage === totalPages ? "disabled" : ""
                          }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                          }
                        >
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


        {/* Right Panel - Map */}
        < div className="col-md-8" >
          <div className="card shadow-lg border-0 p-3 vh-100">
            <div className="mb-3">
              <button className={`btn me-2 ${mapType === "roadmap" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("roadmap")}>Roadmap</button>
              <button className={`btn ${mapType === "satellite" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("satellite")}>Satellite</button>
            </div>
            <WorldMap
              center={mapCenter}
              zoom={5}
              mapType={mapType}
              markers={routeStops && routeStops.length > 0 ? routeStops : []}
            />
          </div>
        </div >
      </div >
    </>
  );
}

export default Routes;
