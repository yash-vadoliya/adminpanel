import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { PencilSquare, Trash, Eye } from "react-bootstrap-icons";

function Promotion() {
  const { token } = useContext(AuthContext);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [viewPromotion, setViewPromotion] = useState(null);

  const initialForm = {
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
  };

  const [formData, setFormData] = useState(initialForm);

// Pagination state
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(10); // ✅ Show 10 records per page

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/promotions`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setPromotions(data[0] || []);
    } catch (err) {
      console.error("Error fetching promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingPromotion
      ? `${CONFIG.API_BASE_URL}/promotions/${editingPromotion.promotion_id}`
      : `${CONFIG.API_BASE_URL}/promotions`;

    const method = editingPromotion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchPromotions();
        setShowForm(false);
        setEditingPromotion(null);
        setFormData(initialForm);
      } else {
        console.error("Failed to save promotion");
      }
    } catch (err) {
      console.error("Error saving promotion:", err);
    }
  };

  const handleEdit = (promo) => {
    setEditingPromotion(promo);
    setFormData(promo);
    setShowForm(true);
    setViewPromotion(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await fetch(`${CONFIG.API_BASE_URL}/promotions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPromotions();
    } catch (err) {
      console.error("Error deleting promotion:", err);
    }
  };

  const handleView = (promo) => {
    setViewPromotion(promo);
    setShowForm(false);
  };

  // Pagination calculations
 const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentPromotions = promotions.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(promotions.length / itemsPerPage);


  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-success">Promotion</h2>
        <button
          className="btn btn-success"
          onClick={() => {
            setFormData(initialForm);
            setEditingPromotion(null);
            setShowForm(true);
            setViewPromotion(null);
          }}
        >
          Add Promotion
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card p-3 shadow-sm mb-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {Object.keys(initialForm).map((key) => (
                <div className="col-md-3" key={key}>
                  <input
                    type={
                      key.includes("date")
                        ? "date"
                        : key.includes("value") ||
                          key.includes("limit") ||
                          key.includes("allowed") ||
                          key.includes("discount")
                        ? "number"
                        : "text"
                    }
                    name={key}
                    value={formData[key] || ""}
                    onChange={handleChange}
                    placeholder={key.replace(/_/g, " ")}
                    className="form-control"
                    required={key === "promotion_title" || key === "promo_type"}
                  />
                </div>
              ))}

              <div className="col-12 text-end">
                <button type="submit" className="btn btn-primary me-2">
                  {editingPromotion ? "Update Promotion" : "Add Promotion"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* VIEW DETAILS */}
      {viewPromotion && (
        <div
          className="offcanvas offcanvas-end show"
          tabIndex="-1"
          style={{ visibility: "visible" }}
        >
          <div className="offcanvas-header bg-primary text-white">
            <h5 className="offcanvas-title">Promotion Details</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setViewPromotion(null)}
            ></button>
          </div>
          <div className="offcanvas-body">
            <div className="row">
              {Object.entries(viewPromotion).map(([key, value], i) => (
                <div className="col-md-6 mb-3" key={i}>
                  <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong> <br />
                  <span>{value || "—"}</span>
                </div>
              ))}
            </div>
            <div className="text-end">
              <button
                className="btn btn-secondary mt-3"
                onClick={() => setViewPromotion(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="table-responsive mt-4">
        <table className="table table-bordered align-middle text-center shadow-sm fs-6">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>TITLE</th>
              <th>STATUS</th>
              <th>PROMO CODE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading...</td>
              </tr>
            ) : currentPromotions.length > 0 ? (
              currentPromotions.map((p, i) => (
                <tr key={i}>
                  <td>{p.promotion_id}</td>
                  <td>{p.promotion_title}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === "Active" ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{p.promo_code}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleView(p)}
                    >
                      <Eye />
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
                <td colSpan="5">No promotions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
     {/* Pagination */}
<div className="d-flex justify-content-center mt-3">
  <nav>
    <ul className="pagination">
      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
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
        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </button>
      </li>
    </ul>
  </nav>
</div>
    </div>
  );
}

export default Promotion;
