import React, { useEffect, useState, useContext } from "react";
import CONFIG from "../Config";
import { AuthContext } from "../AuthContext";

function CancelReason() {
  const { token, user } = useContext(AuthContext);

  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    reason: "",
    status: "Active",
  });

  // -------------------------
  // Fetch all reasons
  // -------------------------
  const fetchReasons = async () => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/cencelReason`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setList(Array.isArray(data[0]) ? data[0] : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchReasons();
  }, []);

  // -------------------------
  // Handle Change
  // -------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------------------------
  // Submit (Add / Update)
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${CONFIG.API_BASE_URL}/cencelReason/${editId}`
      : `${CONFIG.API_BASE_URL}/cencelReason`;

    const payload = {
      ...formData,
      adduid: user?.user_id,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editId ? "Reason Updated!" : "Reason Added!");
        setShowForm(false);
        setEditId(null);
        setFormData({ reason: "", status: "Active" });
        fetchReasons();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // Edit
  // -------------------------
  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      reason: item.reason,
      status: item.status,
    });
    setShowForm(true);
  };

  // -------------------------
  // Delete
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this record?")) return;

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/cencelReason/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Reason Deleted");
        fetchReasons();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fliuid mt-4">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Reason Master</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setFormData({ reason: "", status: "Active" });
          }}
        >
          + Add Reason
        </button>
      </div>

      {/* ---------------- FORM ---------------- */}
      {showForm && (
        <div className="card mb-4 p-3">
          <form onSubmit={handleSubmit}>
            <div className="row">

              {/* Reason */}
              <div className="col-md-4 mb-3">
                <label className="form-label">Reason</label>
                <input
                  type="text"
                  className="form-control"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Status */}
              <div className="col-md-3 mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

            </div>

            <button className="btn btn-success me-2" type="submit">
              {editId ? "Update" : "Submit"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* ---------------- TABLE ---------------- */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark text-center">
          <tr>
            <th>ID</th>
            <th>REASON</th>
            <th>STATUS</th>
            <th width="160px">ACTION</th>
          </tr>
        </thead>

        <tbody className="text-center">
          {list.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">
                No Records Found
              </td>
            </tr>
          )}

          {list.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.reason}</td>
              <td>
                <span
                  className={`badge ${
                    item.status === "Active" ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {item.status}
                </span>
              </td>

              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default CancelReason