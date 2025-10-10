import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { PencilSquare, Trash } from "react-bootstrap-icons";

function Promotion() {
  const { token } = useContext(AuthContext);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  // ✅ Initial form state
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
  });

  // ✅ Fetch all promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/promotions`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data);
      setPromotions(data[0]);
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
        resetForm();
      } else {
        console.error("Failed to save promotion");
      }
    } catch (err) {
      console.error("Error saving promotion:", err);
    }
  };

  const resetForm = () => {
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
    });
  };

  // ✅ Handle edit
  const handleEdit = (promo) => {
    setEditingPromotion(promo);
    setFormData(promo);
    setShowForm(true);
  };

  // ✅ Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await fetch(`${CONFIG.API_URL}/promotions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPromotions();
    } catch (err) {
      console.error("Error deleting promotion:", err);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-success">Promotion</h2>
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setEditingPromotion(null);
            setShowForm(true);
          }}
        >
          Add Promotion
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        // <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
        //   <div className="modal-dialog modal-lg">
        //     <div className="modal-content">
        //       <div className="modal-header bg-success text-white">
        //         <h5 className="modal-title">
        //           {editingPromotion ? "Edit Promotion" : "Add Promotion"}
        //         </h5>
        //         <button
        //           type="button"
        //           className="btn-close"
        //           onClick={() => setShowForm(false)}
        //         ></button>
        //       </div>

        //       <form onSubmit={handleSubmit}>
        //         <div className="modal-body">
        //           <div className="row g-3">
        //             <div className="col-md-6">
        //               <label className="form-label">Title</label>
        //               <input
        //                 type="text"
        //                 name="promotion_title"
        //                 className="form-control"
        //                 value={formData.promotion_title}
        //                 onChange={handleChange}
        //                 required
        //               />
        //             </div>
        //             <div className="col-md-6">
        //               <label className="form-label">Promo Type</label>
        //               <input
        //                 type="text"
        //                 name="promo_type"
        //                 className="form-control"
        //                 value={formData.promo_type}
        //                 onChange={handleChange}
        //                 required
        //               />
        //             </div>
        //             <div className="col-md-6">
        //               <label className="form-label">Discount Value</label>
        //               <input
        //                 type="number"
        //                 name="discount_value"
        //                 className="form-control"
        //                 value={formData.discount_value}
        //                 onChange={handleChange}
        //                 required
        //               />
        //             </div>
        //             <div className="col-md-6">
        //               <label className="form-label">Max Discount</label>
        //               <input
        //                 type="number"
        //                 name="max_discount"
        //                 className="form-control"
        //                 value={formData.max_discount}
        //                 onChange={handleChange}
        //                 required
        //               />
        //             </div>
        //             <div className="col-md-6">
        //               <label className="form-label">Start Date</label>
        //               <input
        //                 type="date"
        //                 name="start_date"
        //                 className="form-control"
        //                 value={formData.start_date}
        //                 onChange={handleChange}
        //                 required
        //               />
        //             </div>
        //             <div className="col-md-6">
        //               <label className="form-label">End Date</label>
        //               <input
        //                 type="date"
        //                 name="end_date"
        //                 className="form-control"
        //                 value={formData.end_date}
        //                 onChange={handleChange}
        //                 required
        //               />
        //             </div>
        //             <div className="col-md-6">
        //               <label className="form-label">Max Allowed</label>
        //               <input
        //                 type="number"
        //                 name="max_allowed"
        //                 className="form-control"
        //                 value={formData.max_allowed}
        //                 onChange={handleChange}
        //               />
        //             </div>
        //             <div className="col-md-6">
        //               <label className="form-label">Per User Limit</label>
        //               <input
        //                 type="number"
        //                 name="per_user_limit"
        //                 className="form-control"
        //                 value={formData.per_user_limit}
        //                 onChange={handleChange}
        //               />
        //             </div>
        //             <div className="col-md-6">
        //               <label className="form-label">Status</label>
        //               <select
        //                 name="status"
        //                 className="form-select"
        //                 value={formData.status}
        //                 onChange={handleChange}
        //               >
        //                 <option value="Active">Active</option>
        //                 <option value="Inactive">Inactive</option>
        //               </select>
        //             </div>
        //             <div className="col-md-6">
        //               <label className="form-label">Promo Code</label>
        //               <input
        //                 type="text"
        //                 name="promo_code"
        //                 className="form-control"
        //                 value={formData.promo_code}
        //                 onChange={handleChange}
        //                 required
        //               />
        //             </div>
        //           </div>
        //         </div>
        //         <div className="modal-footer">
        //           <button
        //             type="button"
        //             className="btn btn-secondary"
        //             onClick={() => setShowForm(false)}
        //           >
        //             Cancel
        //           </button>
        //           <button type="submit" className="btn btn-success">
        //             {editingPromotion ? "Update" : "Save"}
        //           </button>
        //         </div>
        //       </form>
        //     </div>
        //   </div>
        // </div>
        <div className="card">
          <div className="row">
            <div className="col-mb-2">
              <input type="text" name="prpromotion_title" value={ } placeholder="Enter Promotion Title" />
            </div>
            <div className="col-mb-2">
              <input type="text" name="prpromotion_type" value={ } placeholder="Enter Promotion Type" />
            </div>
            <div className="col-mb-2">
              <input type="text" name="discout_value" value={ } placeholder="Enter Discount Value" />
            </div>
            <div className="col-mb-2">
              <input type="text" name="max_discount" value={ } placeholder="Enter Maximum Discount"/>
            </div>
            <div className="col-mb-2">
              <input type="date" name="start_date" valu0e={ } require />
            </div>
            <div className="col-mb-2">
              <input type="date" name="end_date" value={ } required />
            </div>
            <div className="col-mb-2">
              <input type="text" name="max_allowed" value={ } placeholder="Enter Maximum Allowed" />
            </div>
            <div className="col-mb-2">
              <input type="text" name="per_user_limit" value={ } placeholder="Enter Limit Per User" />
            </div>
            <div className="col-mb-2">
              <input type="text" name="status" value={ } placeholder="Enter Status" />
            </div>
            <div className="col-mb-2">
              <input type="text" name="prormo_code" value={ } placeholder="Enter Promocod" />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
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
                      className={`badge ${p.status === "Active" ? "bg-success" : "bg-secondary"
                        }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{p.promo_code}</td>
                  <td>
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
