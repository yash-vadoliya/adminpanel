import React, { useContext, useState, useEffect, useCallback } from "react";
import Select from "react-select";
import MapPicker from "../components/MapPicker";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import ROLES from "../Role";

function SuggestedRoutes() {
  const { token, user } = useContext(AuthContext);

  const [showForm, setShowForm] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editID, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedRoute, setSelectedRoute] = useState(null);



  const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);

  const [formData, setFormData] = useState({
    // travel_id: user?.travel_id || null,
    route_id: '',
    user_id: user?.user_id || null,
    phone_number: "",
    pickup: "",
    drop: "",
    shift: "",
    description: "",
    adduid: user?.user_id || null,
  });

  // ======================================================
  // FETCH SUGGESTED ROUTES
  // ======================================================
  const fetchSuggestedRoutes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/suggest`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log(data);
      setRoutes(data[0]);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH ROUTE LIST FOR DROPDOWN
  // ======================================================
  const fetchRouteList = async () => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/route`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();



      // const options = data[0].map((r) => ({
      //   value: Number(r.route_id),
      //   label: r.route_name,
      // }));

      // console.log(options);

      setRouteOptions(data[0]);

    } catch (err) {
      console.log("Route fetch error:", err);
    }
  };

  useEffect(() => {
    fetchSuggestedRoutes();
    fetchRouteList();
  }, []);

  // ======================================================
  // HANDLE INPUT
  // ======================================================
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ======================================================
  // SELECT ROUTE
  // ======================================================
  // const handleRouteSelect = (selected) => {
  //   setSelectedRoute(selected);
  //   setFormData(prev => ({
  //     ...prev,
  //     route_id: selected ? Number(selected.value) : null,
  //   }));
  // };


  // ======================================================
  // MAP PICKER
  // ======================================================
  const handlePickupSelect = (lat, lng) => {
    const merged = `${lat},${lng}`;
    setFormData(prev => ({
      ...prev,
      pickup: merged
    }));
  };


  const handleDropSelect = (lat, lng) => {
    const merged = `${lat},${lng}`;
    setFormData(prev => ({
      ...prev,
      drop: merged
    }));
  };


  const onLocationChange = useCallback((location) => {
    if (location.lat && location.lng) {
      setFormData((prev) => ({
        ...prev,
        latitude: location.lat,
        longitude: location.lng,
      }));
    }
  }, []);


  const handleAdd = () => {
    setFormData({
      route_id: null,
      user_id: user?.user_id || null,
      phone_number: "",
      pickup: "",
      drop: "",
      shift: "",
      description: "",
      adduid: user?.user_id || null,
    });

    setSelectedRoute(null);
    setEditId(null);
    setShowForm(true);
  };

  // ======================================================
  // SUBMIT
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.route_id) {
      alert("Please select a route");
      return;
    }

    const url = editID
      ? `${CONFIG.API_BASE_URL}/suggest/${editID}`
      : `${CONFIG.API_BASE_URL}/suggest`;

    const method = editID ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(editID ? "Updated Successfully!" : "Added Successfully!");
        fetchSuggestedRoutes();
        setShowForm(false);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.log("Submit error:", err);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================
  const handleEdit = (item) => {
    setFormData({
      route_id: Number(item.route_id),
      user_id: user?.user_id || null,
      phone_number: item.phone_number || "",
      pickup: item.pickup || "",
      drop: item.drop || "",
      shift: item.shift || "",
      description: item.description || "",
      adduid: user?.user_id || null,
    });

    setEditId(item.id);
    setShowForm(true);
  };




  // ======================================================
  // DELETE
  // ======================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await fetch(`${CONFIG.API_BASE_URL}/suggest/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchSuggestedRoutes();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  // ======================================================
  // PAGINATION
  // ======================================================
  const activeRows = routes.filter((x) => x.record_status === 1);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = activeRows.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(activeRows.length / itemsPerPage);

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Suggested Routes</h2>

        {isAdmin && (
          <button className="btn btn-success" onClick={handleAdd}>
            Add New
          </button>
        )}
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="card p-3 shadow mb-4">
          <h5>{editID ? "Edit" : "Add"} Suggested Route</h5>

          <form onSubmit={handleSubmit}>
            <div className="row">

              <div className="col-md-6 mb-3">
                <label>Route</label>
                {/* <Select
                  options={routeOptions}
                  value={selectedRoute}
                  onChange={handleRouteSelect}
                  placeholder="Select route"
                /> */}

                <select
                  name="route_id"
                  className="form-control"
                  value={formData.route_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Route</option>
                  {routeOptions.map((r) => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.route_name}
                    </option>

                  ))}
                </select>

              </div>

              <div className="col-md-6 mb-3">
                <label>Phone</label>
                <input
                  className="form-control"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Shift</label>
                <input
                  className="form-control"
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-12 mb-3">
                <label>Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Pickup</label>
                <MapPicker onLocationChange={(l) => handlePickupSelect(l.lat, l.lng)} />
                <input className="form-control mt-2" value={formData.pickup} readOnly />
              </div>

              <div className="col-md-6 mb-3">
                <label>Drop</label>
                <MapPicker onLocationChange={(l) => handleDropSelect(l.lat, l.lng)} />
                <input className="form-control mt-2" value={formData.drop} readOnly />
              </div>
            </div>

            <button className="btn btn-primary me-2">
              {editID ? "Update" : "Submit"}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="table-responsive">
        <table className="table table-bordered text-center shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Phone</th>
              <th>Pickup</th>
              <th>Drop</th>
              <th>Shift</th>
              <th>Description</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((r, i) => (
                <tr key={i}>
                  <td>{r.id}</td>
                  <td>{r.user_id}</td>
                  <td>{r.phone_number}</td>
                  <td>{r.pickup}</td>
                  <td>{r.drop}</td>
                  <td>{r.shift}</td>
                  <td>{r.description}</td>

                  {isAdmin && (
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(r)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 d-flex justify-content-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`btn ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
              }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SuggestedRoutes;
