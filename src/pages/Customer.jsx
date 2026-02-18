import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import Pagination from "../components/Pagination";
import { PencilSquare, Trash, X } from "react-bootstrap-icons";
import ROLES from "../Role";

function Customer() {
  const { token, user } = useContext(AuthContext);

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    trip_id: "",
    customer_name: "",
    email: "",
    customer_phone_number: "",
    gender: "",
    date_of_birth: "",
    city_id: "",
    total_trips: 0,
    active_status: "1",
    customer_image: null,
    adduid: user?.user_id || "",
  });

  const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/customer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomers(data[0] || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTrips = useCallback(async () => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/trip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTrips(data[0] || []);
    } catch (err) {
      console.error("Error fetching trips:", err);
    }
  }, [token]);

  const fetchCities = useCallback(async () => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/city`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCities(data[0] || []);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchCustomers();
    fetchTrips();
    fetchCities();
  }, [fetchCustomers, fetchTrips, fetchCities]);

  useEffect(() => {
    let filtered = customers;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (c) => String(c.active_status) === String(statusFilter)
      );
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((c) =>
        Object.values(c).some((val) =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchQuery, statusFilter]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "customer_image" && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== undefined)
          formDataToSend.append(key, val);
      });

      const url = editId
        ? `${CONFIG.API_BASE_URL}/customer/${editId}`
        : `${CONFIG.API_BASE_URL}/customer`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (res.ok) {
        alert(editId ? "Customer updated!" : "Customer added!");
        fetchCustomers();
        setShowForm(false);
        setEditId(null);
      } else {
        const err = await res.json();
        alert("Error: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleEdit = (cust) => {
    setEditId(cust.customer_id);
    setFormData({
      trip_id: cust.trip_id || "",
      customer_name: cust.customer_name || "",
      email: cust.email || "",
      customer_phone_number: cust.customer_phone_number || "",
      gender: cust.gender || "",
      date_of_birth: cust.date_of_birth
        ? new Date(cust.date_of_birth).toISOString().split("T")[0]
        : "",
      city_id: cust.city_id || "",
      total_trips: cust.total_trips || 0,
      active_status: cust.active_status?.toString() || "1",
      customer_image: null,
      adduid: cust.adduid || user?.user_id || "",
    });

    setImagePreview(cust.customer_image || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await fetch(`${CONFIG.API_BASE_URL}/customer/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCustomers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const startIndex = (currentPage - 1) * 10;
  const currentData = filteredCustomers.slice(startIndex, startIndex + 10);

  const getTripName = (trip_id) =>
    trips.find((t) => t.trip_id === trip_id)?.trip_name || "-";

  const getCityName = (city_id) =>
    cities.find((c) => c.city_id === city_id)?.city_name || "-";

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Customer Management</h2>
        <div>
          <button className="btn btn-success me-2" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Hide Form" : editId ? "Update Customer" : "Add Customer"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3 d-flex align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="btn btn-outline-secondary" onClick={() => setSearchQuery("")}>
            <X />
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="row g-3 bg-light p-3 rounded shadow-sm mb-4">
          
          {/* Trip Dropdown */}
          <div className="col-md-3">
            <label className="form-label">Trip</label>
            <select
              name="trip_id"
              className="form-select"
              value={formData.trip_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Trip</option>
              {trips.map((t) => (
                <option key={t.trip_id} value={t.trip_id}>
                  {t.trip_name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="col-md-3">
            <label className="form-label">City</label>
            <select
              name="city_id"
              className="form-select"
              value={formData.city_id}
              onChange={handleChange}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.city_id} value={c.city_id}>
                  {c.city_name}
                </option>
              ))}
            </select>
          </div>

          {/* Other Fields */}
          <div className="col-md-3">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              name="customer_name"
              className="form-control"
              value={formData.customer_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="customer_phone_number"
              className="form-control"
              value={formData.customer_phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Gender</label>
            <select
              name="gender"
              className="form-select"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              className="form-control"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Total Trips</label>
            <input
              type="number"
              name="total_trips"
              className="form-control"
              value={formData.total_trips}
              onChange={handleChange}
            />
          </div>

          {/* Status */}
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              name="active_status"
              className="form-select"
              value={formData.active_status}
              onChange={handleChange}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="col-md-4">
            <label className="form-label">Customer Image</label>
            <input type="file" name="customer_image" className="form-control" onChange={handleChange} />
            {imagePreview && <img src={imagePreview} alt="Preview" height={50} className="mt-2 rounded border" />}
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary">{editId ? "Update" : "Add"}</button>
            <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Trip</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>City</th>
              <th>Total Trips</th>
              <th>Status</th>
              <th>Added By</th>
              <th>Image</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {currentData.length ? (
              currentData.map((c) => (
                <tr key={c.customer_id}>
                  <td>{c.customer_id}</td>

                  {/* Trip Name */}
                  <td>{getTripName(c.trip_id)}</td>

                  <td>{c.customer_name}</td>
                  <td>{c.email}</td>
                  <td>{c.customer_phone_number}</td>
                  <td>{c.gender}</td>
                  <td>{c.date_of_birth?.split("T")[0]}</td>

                  {/* City Name */}
                  <td>{getCityName(c.city_id)}</td>

                  <td>{c.total_trips}</td>

                  <td>
                    {c.active_status === 1 ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Inactive</span>
                    )}
                  </td>

                  <td>{c.adduid}</td>

                  <td>
                    {c.customer_image ? (
                      <img src={c.customer_image} height={50} width={80} className="rounded" />
                    ) : (
                      "N/A"
                    )}
                  </td>

                  {isAdmin && (
                    <td>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(c)}>
                        <PencilSquare />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.customer_id)}>
                        <Trash />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="text-center text-muted">No customer records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredCustomers.length}
        itemsPerPage={10}
        onPageChange={(n) => setCurrentPage(n)}
      />

    </div>
  );
}

export default Customer;
