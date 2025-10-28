import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import Pagination from "../components/Pagination";
import { PencilSquare, Trash, X } from "react-bootstrap-icons";

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch Customers
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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ✅ Filter logic
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

  // ✅ Form change handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "customer_image" && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Add / Update Customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== undefined) formDataToSend.append(key, val);
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
        alert(editId ? "Customer updated successfully!" : "Customer added successfully!");
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

  // ✅ Edit Customer
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

  // ✅ Delete Customer
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/customer/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ CSV Export
  const exportCSV = () => {
    const dataToExport = filteredCustomers.length ? filteredCustomers : customers;

    if (!dataToExport.length) return alert("No records available to export!");

    const header = [
      "customer_id",
      "trip_id",
      "customer_name",
      "email",
      "customer_phone_number",
      "gender",
      "date_of_birth",
      "city_id",
      "total_trips",
      "active_status",
      "customer_image",
      "adduid",
    ];

    const rows = dataToExport.map((c) => [
      c.customer_id,
      c.trip_id,
      c.customer_name,
      c.email,
      c.customer_phone_number,
      c.gender,
      c.date_of_birth,
      c.city_id,
      c.total_trips,
      c.active_status,
      c.customer_image,
      c.adduid,
    ]);

    const csvContent = [header, ...rows]
      .map((r) => r.map((v) => `"${v ?? "-"}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const fileName = filteredCustomers.length
      ? `Customer_Filtered_${new Date().toISOString().slice(0, 10)}.csv`
      : `Customer_All_${new Date().toISOString().slice(0, 10)}.csv`;
    link.download = fileName;
    link.click();
  };

  // ✅ Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const clearSearch = () => setSearchQuery("");

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Customer Management</h2>
        <div>
          <button className="btn btn-success me-2" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Hide Form" : editId ? "Update Customer" : "Add Customer"}
          </button>
          <button className="btn btn-secondary" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {/* 🔍 Search & Filter */}
      <div className="mb-3 d-flex align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search by name, email, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="btn btn-outline-secondary" onClick={clearSearch}>
            <X />
          </button>
        )}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="ms-2 form-select"
          style={{ width: "180px" }}
        >
          <option value="all">All</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {/* ✅ Form Section */}
      {showForm && (
        <form onSubmit={handleSubmit} className="row g-3 bg-light p-3 rounded shadow-sm mb-4">
          <div className="col-md-3">
            <input
              type="number"
              name="trip_id"
              className="form-control"
              placeholder="Trip ID"
              value={formData.trip_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              name="customer_name"
              className="form-control"
              placeholder="Customer Name"
              value={formData.customer_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              name="customer_phone_number"
              className="form-control"
              placeholder="Phone Number"
              value={formData.customer_phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <select
              name="gender"
              className="form-select"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="date"
              name="date_of_birth"
              className="form-control"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              name="city_id"
              className="form-control"
              placeholder="City ID"
              value={formData.city_id}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              name="total_trips"
              className="form-control"
              placeholder="Total Trips"
              value={formData.total_trips}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
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
          <div className="col-md-4">
            <input
              type="file"
              name="customer_image"
              className="form-control"
              onChange={handleChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 rounded border"
                height={50}
                width={80}
              />
            )}
          </div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" type="submit">
              {editId ? "Update Customer" : "Add Customer"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ✅ Table */}
      <div className="table-responsive">
        {loading ? (
          <p className="text-center fs-5">Loading customers...</p>
        ) : (
          <table className="table table-bordered table-hover text-center align-middle fs-6">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Trip ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>City ID</th>
                <th>Total Trips</th>
                <th>Status</th>
                <th>Added By</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length ? (
                currentData.map((c) => (
                  <tr key={c.customer_id}>
                    <td>{c.customer_id}</td>
                    <td>{c.trip_id}</td>
                    <td>{c.customer_name}</td>
                    <td>{c.email}</td>
                    <td>{c.customer_phone_number}</td>
                    <td>{c.gender}</td>
                    <td>{c.date_of_birth?.split("T")[0] || "-"}</td>
                    <td>{c.city_id}</td>
                    <td>{c.total_trips}</td>
                    <td>
                      {c.active_status === 1 ? (
                        <span className="badge bg-success px-3 py-2">Active</span>
                      ) : (
                        <span className="badge bg-danger px-3 py-2">Inactive</span>
                      )}
                    </td>
                    <td>{c.adduid}</td>
                    <td>
                      {c.customer_image ? (
                        <img
                          src={c.customer_image}
                          alt={c.customer_name}
                          height="50"
                          width="80"
                          className="rounded border"
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(c)}
                      >
                        <PencilSquare size={16} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c.customer_id)}
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-center text-muted">
                    No customer records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredCustomers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Customer;
