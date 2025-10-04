import React, { useState, useEffect, useContext } from 'react';
import CONFIG from '../Config';
import WorldMap from '../components/WorldMap';
import { AuthContext } from '../AuthContext';
import { PencilSquare, Trash } from 'react-bootstrap-icons';

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
  const [routeStops, setRouteStops] = useState([]); // stops for map
  const [formData, setFormData] = useState({
    route_name: '',
    route_start_from: '',
    route_end_to: '',
    distance_KM: '',
    approx_time: '',
    is_active: false,
    adduid: '',
  });

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
      setRoutes(fetchdata[0] || []); // fallback to empty array
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreate = () => {
    setFormData({
      route_name: '',
      route_start_from: '',
      route_end_to: '',
      distance_KM: '',
      approx_time: '',
      is_active: false,
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
      is_active: route.is_active === 1,
    });
    setEditId(route.route_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${CONFIG.API_BASE_URL}/route/${id}`, { method: 'DELETE' });
      fetchRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  // Show route details and stops on map
  const handleshowRecord = async (route_id) => {
    setShowDetails(true);

    try {
      // Fetch route details
      const resDetails = await fetch(`${CONFIG.API_BASE_URL}/route_details/${route_id}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const routeDetails = await resDetails.json();

      // Get route name from all routes
      const routeInfo = routes.find(r => r.route_id === route_id);
      const routeName = routeInfo ? routeInfo.route_name : "Unknown";

      // Merge route name with details
      const dataWithName = { ...routeDetails[0], routeName };
      setData(dataWithName);

      // Set stops for map
      const stops = routeDetails
        .map(stop => ({
          lat: parseFloat(stop.latitude),
          lng: parseFloat(stop.longitude),
          name: stop.stop_name
        }))
        .filter(stop => !isNaN(stop.lat) && !isNaN(stop.lng));
      setRouteStops(stops);

      // Center map on first stop
      if (stops.length > 0) {
        setMapCenter([stops[0].lat, stops[0].lng]);
      }

    } catch (err) {
      console.error("Error fetching route details:", err);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setData(null);
    setRouteStops([]); // remove stops from map
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${CONFIG.API_BASE_URL}/route/${editId}`
      : `${CONFIG.API_BASE_URL}/route`;

    try {
      const payload = {
        ...formData,
        is_active: formData.is_active ? 1 : 0,
        adduid: user?.user_id || null,
      };

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
        console.error("Request failed:", await res.json());
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  const filteredRoutes = routes.filter(route => {
    if (filter === "active") return route.is_active === 1;
    if (filter === "inactive") return route.is_active === 0;
    return true;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Routes</h2>
        <button className="btn btn-success" onClick={handleCreate}>Add Route</button>
      </div>

      {showForm && (
        <div className="card mb-3 p-3">
          <h5>{editId ? "Update Route" : "Create Route"}</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label>Route Name</label>
              <input type="text" name="route_name" value={formData.route_name} onChange={handleChange} className="form-control" />
            </div>
            <div className="mb-2">
              <label>Route Start From</label>
              <input type="text" name="route_start_from" value={formData.route_start_from} onChange={handleChange} className="form-control" />
            </div>
            <div className="mb-2">
              <label>Route End To</label>
              <input type="text" name="route_end_to" value={formData.route_end_to} onChange={handleChange} className="form-control" />
            </div>
            <div className="mb-2">
              <label>Route Distance KM</label>
              <input type="number" name="distance_KM" value={formData.distance_KM} onChange={handleChange} className="form-control" />
            </div>
            <div className="mb-2">
              <label>Route Approx Time</label>
              <input type="text" name="approx_time" value={formData.approx_time} onChange={handleChange} className="form-control" />
            </div>
            <div className="mb-2 form-check">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="form-check-input" />
              <label className="form-check-label">Route Is Active</label>
            </div>

            <button type="submit" className="btn btn-primary">{editId ? "Update" : "Create"}</button>
            <button type="button" className="btn btn-secondary ms-2" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </form>
        </div>
      )}

      <div className="row">
        <div className="col-md-4">
          {showDetails ? (
            <div className='card shadow-lg border-0 p-3 position-relative'>
              <button className="btn btn-dark mb-3 position-absolute top-0 end-0" onClick={handleCloseDetails}>
                <i className="bi bi-x"></i>
              </button>

              {data ? (
                <ul className="list-group">
                  <li className="list-group-item">
                    <div className='card-title'><strong>{data.routeName}</strong></div>
                    <div className="card-text">From: {data.start_point}</div>
                    <div className="card-text">To: {data.end_point}</div>
                    <div className="card-text">Distance: {data.distance} KM</div>
                    <div className="card-text">Approx Time: {data.approx_time}</div>
                    {data.is_active === 1 ? (
                      <span className="badge bg-success ms-2">Active</span>
                    ) : (
                      <span className="badge bg-danger ms-2">Stopped</span>
                    )}
                  </li>
                  <li className="list-group-item">
                    <strong>Stops:</strong>
                    <ul>
                      {routeStops.map((stop, index) => (
                        <li key={index}>
                          <i className="bi bi-geo-alt-fill me-2"></i>
                          {stop.name} ({stop.lat}, {stop.lng})
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              ) : (
                <p>Loading route details...</p>
              )}
            </div>
          ) : (
            <div className="card shadow-lg border-0 p-3">
              <h5 className="card-title">All Routes</h5>
              <div className="mb-2">
                <select className="form-select form-select-sm w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : filteredRoutes.length === 0 ? (
                <p>No routes available</p>
              ) : (
                <ul className="list-group">
                  {filteredRoutes.map(route => (
                    <li key={route.route_id} className="list-group-item d-flex justify-content-between align-items-start">
                      <div>
                        <div className='card-title'><strong>{route.route_name}</strong></div>
                        <div className="card-text">From: {route.route_start_from}</div>
                        <div className="card-text">To: {route.route_end_to}</div>
                        <div className="card-text">Distance: {route.distance_KM} KM</div>
                        <div className="card-text">Approx Time: {route.approx_time}</div>
                        {route.is_active === 1 ? (
                          <span className="badge bg-success ms-2">Active</span>
                        ) : (
                          <span className="badge bg-danger ms-2">Stopped</span>
                        )}
                        <br />
                        <button className="btn btn-sm btn-warning me-2 mt-1" onClick={() => handleEdit(route)}><PencilSquare /></button>
                        <button className="btn btn-sm btn-danger me-2 mt-1" onClick={() => handleDelete(route.route_id)}><Trash /></button>
                        <button className="btn btn-sm btn-outline-info me-2 mt-1" onClick={() => handleshowRecord(route.route_id)}>View Details</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="col-md-8">
          <div className="card shadow-lg border-0 p-3 vh-100">
            <div className="mb-3">
              <button className={`btn me-2 ${mapType === "roadmap" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("roadmap")}>Roadmap</button>
              <button className={`btn ${mapType === "satellite" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("satellite")}>Satellite</button>
            </div>

            <WorldMap
              center={mapCenter}
              zoom={5}
              mapType={mapType}
              markers={routeStops} // pass stops as markers
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Routes;
