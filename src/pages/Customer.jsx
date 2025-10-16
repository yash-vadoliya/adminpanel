// ✅ Customer.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import Pagination from "../components/Pagination";
import { PencilSquare, Trash } from "react-bootstrap-icons";

function Customer() {
  const { token, user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    verified_status: "",
    gender: "",
    date_of_birth: "",
    city: "",
    active_status: "",
    customer_image: "",
    adduid: user?.user_id || "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  useEffect(() => {
    fetchCustomers();
  }, []);

  // ✅ Fetch Customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const flatCustomer = Array.isArray(data) ? data.flat() : [];
      setCustomers(flatCustomer);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "customer_image" && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Add or Update Customer
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
        setEditId(null);
        setFormData({
          customer_name: "",
          email: "",
          phone_number: "",
          verified_status: "",
          gender: "",
          date_of_birth: "",
          city: "",
          active_status: "",
          customer_image: "",
          adduid: user?.user_id || "",
        });
      } else {
        const err = await res.json();
        alert("Error: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // ✅ Edit Customer
  // const handleEdit = (cust) => {
  //     let formattedDOB = "";
  // if (cust.date_of_birth) {
  //   try {
  //     formattedDOB = new Date(cust.date_of_birth).toISOString().split("T")[0];
  //   } catch {
  //     formattedDOB = cust.date_of_birth; // fallback if already in YYYY-MM-DD
  //   }
  // }

  //   setEditId(cust.customer_id);
  //   setFormData({
  //     customer_name: cust.customer_name,
  //     email: cust.email,
  //     phone_number: cust.phone_number,
  //     verified_status: cust.verified_status,
  //     gender: cust.gender,
  //     date_of_birth: formattedDOB ,
  //     city: cust.city,
  //     active_status: cust.active_status,
  //     customer_image: cust.customer_image || "",
  //     adduid: cust.adduid,
  //   });
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };
  const handleEdit = (cust) => {
  const formattedDOB = cust.date_of_birth
    ? new Date(cust.date_of_birth).toISOString().split("T")[0]
    : "";

  setEditId(cust.customer_id);
  setFormData({
    customer_name: cust.customer_name || "",
    email: cust.email || "",
    phone_number: cust.phone_number || "",
    verified_status: cust.verified_status || "",
    gender: cust.gender || "",
    date_of_birth: formattedDOB,
    city: cust.city || "",
    active_status: cust.active_status || "",
    customer_image: cust.customer_image || "",
    adduid: cust.adduid || user?.user_id || "",
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
};


  // ✅ Delete Customer
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/customer/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Customer deleted!");
        fetchCustomers();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ Export CSV
  const exportCSV = () => {
    if (!customers.length) return alert("No records available to export!");

    const header = [
      "customer_id",
      "customer_name",
      "email",
      "phone_number",
      "verified_status",
      "gender",
      "date_of_birth",
      "city",
      "active_status",
      "adduid",
    ];

    const rows = customers.map((c) => [
      c.customer_id,
      c.customer_name,
      c.email,
      c.phone_number,
      c.verified_status,
      c.gender,
      c.date_of_birth,
      c.city,
      c.active_status,
      c.adduid,
    ]);

    const csvContent =
      [header, ...rows].map((r) => r.map((v) => `"${v ?? "-"}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Customer_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // ✅ Pagination Logic
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = customers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Customer Management</h2>
        <button className="btn btn-success" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      {/* ✅ Form */}
      <form onSubmit={handleSubmit} className="row g-3 bg-light p-3 rounded shadow-sm">
        <div className="col-md-4">
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
        <div className="col-md-4">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            name="phone_number"
            className="form-control"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-3">
          <input
            type="text"
            name="gender"
            className="form-control"
            placeholder="Gender"
            value={formData.gender}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            name="date_of_birth"
            className="form-control"
            value={formData.date_of_birth}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            name="city"
            className="form-control"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <select
            name="active_status"
            className="form-select"
            value={formData.active_status}
            onChange={handleChange}
          >
            <option value="">Select Status</option>
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
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            {editId ? "Update Customer" : "Add Customer"}
          </button>
        </div>
      </form>

      {/* ✅ Table */}
      <div className="table-responsive mt-4">
        {loading ? (
          <p className="text-center fs-5">Loading customers...</p>
        ) : (
          <table className="table table-bordered table-hover text-center align-middle fs-6">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>City</th>
                <th>Status</th>
                <th>Added By</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length ? (
                currentData.map((c, i) => (
                  <tr key={i}>
                    <td>{c.customer_id}</td>
                    <td>{c.customer_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone_number}</td>
                    <td>{c.gender}</td>
                    <td>{c.date_of_birth}</td>
                    <td>{c.city}</td>
                    <td>
                      {c.active_status === 1 ? (
                        <span className="badge bg-success px-3 py-2 fs-6">Active</span>
                      ) : (
                        <span className="badge bg-danger px-3 py-2 fs-6">Inactive</span>
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
                        <span className="text-muted">N/A</span>
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
                  <td colSpan="11" className="text-center text-muted">
                    No customers found.
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
        totalItems={customers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Customer;
