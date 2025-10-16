import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { PencilSquare, Trash, Eye } from "react-bootstrap-icons";
import "../App.css";
import Pagination from "../components/Pagination";


function Promotion() {
  const { token, user } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [promo, setPromo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editID, setEditId] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const [formData, setFormData] = useState({
    promotion_title: "",
    promo_type: "",
    discount_value: "",
    max_discount: "",
    start_date: "",
    end_date: "",
    max_allowed: "",
    per_user_limit: "",
    status: "Active",
    promo_code: "",
    adduid: user?.user_id || "",
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch Data
  useEffect(() => {
    fetchPromo();
  }, []);

  const fetchPromo = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/promotions`, {
        method: "GET",
        headers,
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      const flatData = Array.isArray(data[0]) ? data.flat() : data;
      setPromo(flatData);
      console.log("Promotions:", flatData);
    } catch (err) {
      console.log("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add / Reset form
  const handleAdd = () => {
    setFormData({
      promotion_title: "",
      promo_type: "",
      discount_value: "",
      max_discount: "",
      start_date: "",
      end_date: "",
      max_allowed: "",
      per_user_limit: "",
      status: "Active",
      promo_code: "",
      adduid: user?.user_id || "",
    });
    setEditId(null);
    setShowForm(true);
  };

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, adduid: user?.user_id || null };
      const url = editID
        ? `${CONFIG.API_BASE_URL}/promotions/${editID}`
        : `${CONFIG.API_BASE_URL}/promotions`;
      const method = editID ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editID ? "Promo Updated" : "Promo Added");
        fetchPromo();
        setShowForm(false);
        setEditId(null);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.log("Submit error:", err);
    }
  };

  // Edit
  const handleEdit = (p) => {
    setFormData({
      promotion_title: p.promotion_title,
      promo_type: p.promo_type,
      discount_value: p.discount_value,
      max_discount: p.max_discount,
      start_date: p.start_date?.split("T")[0] || "",
      end_date: p.end_date?.split("T")[0] || "",
      max_allowed: p.max_allowed,
      per_user_limit: p.per_user_limit,
      status: p.status,
      promo_code: p.promo_code,
      adduid: p.adduid,
    });
    setEditId(p.promotion_id);
    setShowForm(true);
  };

  // Delete
  const handleDelete = async (promotion_id) => {
    if (!window.confirm("Are you sure you want to delete this promo?")) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/promotions/${promotion_id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        alert("Promo deleted");
        fetchPromo();
      }
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  // Pagination
  const activePromo = promo.filter(
    (p) => p.record_status === 1 || p.record_status === undefined
  );
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = activePromo.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(activePromo.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Promotion</h2>
        <button className="btn btn-success" onClick={handleAdd}>
          Add Promo
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-3 shadow mb-4">
          <h5>{editID ? "Edit Promotion" : "Add Promotion"}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {[
                { label: "Promotion Title", name: "promotion_title" },
                { label: "Promotion Type", name: "promo_type" },
                { label: "Discount Value", name: "discount_value" },
                { label: "Maximum Discount", name: "max_discount" },
                { label: "Start Date", name: "start_date", type: "date" },
                { label: "End Date", name: "end_date", type: "date" },
                { label: "Max Allowed", name: "max_allowed" },
                { label: "User Limit", name: "per_user_limit" },
                { label: "Promo Code", name: "promo_code" },
              ].map((field, i) => (
                <div className="col-md-4 mb-2" key={i}>
                  <label className="form-label">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    className="form-control"
                    value={formData[field.name]}
                    onChange={handleChange}
                  />
                </div>
              ))}
              <div className="col-md-4 mb-2">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary me-2">
              {editID ? "Update" : "Add"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div>
        <h5>Promotion List</h5>
        <div className="table-responsive mt-3 rounded-5" >
          <table className="table table-bordered align-middle text-center shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Discount</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((p, i) => (
                  <tr key={i}>
                    <td>{p.promotion_id}</td>
                    <td>{p.promotion_title}</td>
                    <td>{p.promo_type}</td>
                    <td>{p.discount_value}</td>
                    <td>{p.start_date?.split("T")[0]}</td>
                    <td>{p.end_date?.split("T")[0]}</td>
                    <td>
                      {p.status === "Active" ? (
                        <span className="badge bg-success px-3 py-2">Active</span>
                      ) : (
                        <span className="badge bg-danger px-3 py-2">Inactive</span>
                      )}
                    </td>
                    <td>{p.promo_code}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => setSelectedPromo(p)}
                      >
                        <Eye /> View
                      </button>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(p)}
                      >
                        <PencilSquare />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p.promotion_id)}
                      >
                        <Trash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No active promotions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>



        {/* ✅ Sliding Detail Panel */}
        {selectedPromo && (
          <>
            <div
              className="details-overlay"
              onClick={() => setSelectedPromo(null)}
            ></div>

            <div className="details-panel show" >
              <div className="card shadow-lg">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h4 className="mb-0 text-center flex-grow-1 fs-3">
                    Promotion Details
                  </h4>
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => setSelectedPromo(null)}
                  >
                    ✖
                  </button>
                </div>

                <div className="card-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <strong className="text-success">Promotion Title : </strong>
                      {selectedPromo.promotion_title}
                    </div>
                    <div className="col-md-6">
                      <strong className="text-success">Promotion Type : </strong>
                      {selectedPromo.promo_type}
                    </div>
                  </div>
                  <hr />
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <strong className="text-success">Discount Value :  </strong>
                      {selectedPromo.discount_value}
                    </div>
                    <div className="col-md-6">
                      <strong className="text-success">Maximum Discount :  </strong>
                      {selectedPromo.max_discount}
                    </div>
                  </div>
                  <hr />
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <strong className="text-success">Date From :  </strong>
                      {selectedPromo.start_date?.split("T")[0]}
                    </div>
                    <div className="col-md-6">
                      <strong className="text-success">Max Allowed : </strong>
                      {selectedPromo.max_allowed}
                    </div>
                    <div className="col-md-6">
                      <strong className="text-success">User Limit :  </strong>
                      {selectedPromo.per_user_limit}
                    </div>
                  </div>
                  <hr />
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <strong className="text-success">Status :  </strong>
                      {selectedPromo.status === "Active" ? (
                        <span className="badge bg-success px-3 py-2 fs-6">Active</span>
                      ) : (
                        <span className="badge bg-danger px-3 py-2 fs-6">Stopped</span>
                      )}
                    </div>
                    <div className="col-md-6">
                      <strong className="text-success">Add User ID :  </strong>
                      {selectedPromo.adduid}
                    </div>
                    <div className="col-md-12">
                      <strong className="text-success">Promo Code : </strong>
                      <span className="fs-3 bg-light">{selectedPromo.promo_code}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}


        {/* Pagination */}
        <Pagination
  currentPage={currentPage}
  totalItems={totalPages.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>

      </div>
    </div>
  );
}

export default Promotion;
