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
  const [viewPromotion, setViewPromotion] = useState(null); // 👁️ For viewing details

  // ✅ Initial form state
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

  // ✅ Fetch all promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/promotions`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  // ✅ Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle add/edit form submit
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

  // ✅ Handle edit
  const handleEdit = (promo) => {
    setEditingPromotion(promo);
    setFormData(promo);
    setShowForm(true);
    setViewPromotion(null);
  };

  // ✅ Handle delete
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

  // ✅ Handle view details
  const handleView = (promo) => {
    setViewPromotion(promo);
    setShowForm(false);
  };

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

      {/* ✅ FORM SECTION */}
      {showForm && (
        <div className="card p-3 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {Object.keys(initialForm).map((key) => (
                key !== "status" && key !== "promo_code" ? (
                  <div className="col-md-3" key={key}>
                    <input
                      type={
                        key.includes("date")
                          ? "date"
                          : key.includes("value") || key.includes("limit") || key.includes("allowed") || key.includes("discount")
                          ? "number"
                          : "text"
                      }
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      placeholder={`Enter ${key.replace(/_/g, " ")}`}
                      className="form-control"
                      required={key === "promotion_title" || key === "promo_type"}
                    />
                  </div>
                ) : null
              ))}

              <div className="col-md-3">
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="Enter Status"
                  className="form-control"
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  name="promo_code"
                  value={formData.promo_code}
                  onChange={handleChange}
                  placeholder="Enter Promo Code"
                  className="form-control"
                />
              </div>

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

      {/* ✅ VIEW DETAILS CARD */}
{viewPromotion && (
  <div
    className="offcanvas offcanvas-end show"
    tabIndex="-1"
    // style={{backgroundColor: "rgba(255, 255, 255, 0.5)" }} 
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


      {/* ✅ TABLE SECTION */}
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
            ) : promotions.length > 0 ? (
              promotions.map((p, i) => (
                <tr key={i}>
                  <td>{p.promotion_id}</td>
                  <td>{p.promotion_title}</td>
                  <td>
                    <span
                      className={`badge ${p.status === "Active" ? "bg-success" : "bg-secondary"}`}
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
    </div>
  );
}

export default Promotion;
